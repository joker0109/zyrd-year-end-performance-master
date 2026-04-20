package com.company.performance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.company.performance.entity.*;
import com.company.performance.mapper.*;
import com.company.performance.service.VoteService;
import com.company.performance.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 投票服务实现类
 */
@Service
@RequiredArgsConstructor
public class VoteServiceImpl implements VoteService {

    private final VoteMapper voteMapper;
    private final VoteSubmissionMapper voteSubmissionMapper;
    private final VoteSessionMapper voteSessionMapper;
    private final EmployeeMapper employeeMapper;

    // 各等级得分基准（满分100）
    private static final Map<String, Integer> GRADE_BASE = Map.of(
            "A", 100, "B", 80, "C", 60, "D", 40
    );

    // 等级名称映射
    private static final Map<String, String> GRADE_NAME = Map.of(
            "A", "优秀", "B", "良好", "C", "合格", "D", "不合格"
    );

    /**
     * 获取当前活跃投票批次ID（绩效年 = 当前年-1）
     */
    private Long getActiveSessionId() {
        int perfYear = LocalDate.now().getYear() - 1;
        VoteSession session = voteSessionMapper.selectOne(
                new LambdaQueryWrapper<VoteSession>()
                        .eq(VoteSession::getYear, perfYear)
                        .eq(VoteSession::getStatus, 1)
                        .last("LIMIT 1")
        );
        return session == null ? null : session.getId();
    }

    /**
     * 根据绩效年份获取投票批次ID（不限 status）
     */
    private Long getSessionIdByYear(int year) {
        VoteSession session = voteSessionMapper.selectOne(
                new LambdaQueryWrapper<VoteSession>()
                        .eq(VoteSession::getYear, year)
                        .last("LIMIT 1")
        );
        return session == null ? null : session.getId();
    }

    /**
     * 解析 year 参数：null 表示当前活跃年，非空表示指定年
     */
    private Long resolveSessionId(Integer year) {
        return (year != null) ? getSessionIdByYear(year) : getActiveSessionId();
    }

    @Override
    @Transactional
    public String submitVotes(String voterId, Map<String, String> votes) {
        Long sessionId = getActiveSessionId();
        if (sessionId == null) return "当前没有进行中的评分批次";

        if (isSubmitted(voterId)) return "您已提交过评分，不能重复提交";

        Employee voter = employeeMapper.selectByEmployeeId(voterId);
        if (voter == null) return "投票人不存在";

        for (Map.Entry<String, String> entry : votes.entrySet()) {
            String targetId = entry.getKey();
            String grade = entry.getValue();

            if (!List.of("A", "B", "C", "D").contains(grade)) {
                return "评分等级无效：" + grade;
            }

            Employee target = employeeMapper.selectByEmployeeId(targetId);
            if (target == null) continue;

            Vote vote = new Vote();
            vote.setVoteSessionId(sessionId);
            vote.setVoterId(voterId);
            vote.setVoterLevel(voter.getLevel());
            vote.setTargetId(targetId);
            vote.setTargetLevel(target.getLevel());
            vote.setGrade(grade);
            voteMapper.insert(vote);
        }

        VoteSubmission submission = new VoteSubmission();
        submission.setVoteSessionId(sessionId);
        submission.setVoterId(voterId);
        submission.setIsSubmitted(1);
        voteSubmissionMapper.insert(submission);

        return null;
    }

    @Override
    public boolean isSubmitted(String voterId) {
        Long sessionId = getActiveSessionId();
        if (sessionId == null) return false;
        Long count = voteSubmissionMapper.selectCount(
                new LambdaQueryWrapper<VoteSubmission>()
                        .eq(VoteSubmission::getVoteSessionId, sessionId)
                        .eq(VoteSubmission::getVoterId, voterId)
                        .eq(VoteSubmission::getIsSubmitted, 1)
        );
        return count > 0;
    }

    @Override
    public Map<String, String> getMyVotes(String voterId) {
        Long sessionId = getActiveSessionId();
        if (sessionId == null) return null;
        if (!isSubmitted(voterId)) return null;

        List<Vote> votes = voteMapper.selectList(
                new LambdaQueryWrapper<Vote>()
                        .eq(Vote::getVoteSessionId, sessionId)
                        .eq(Vote::getVoterId, voterId)
        );
        Map<String, String> result = new LinkedHashMap<>();
        votes.forEach(v -> result.put(v.getTargetId(), v.getGrade()));
        return result;
    }

    @Override
    public VoteResultVO getResult(String employeeId) {
        return getResultBySession(employeeId, getActiveSessionId());
    }

    /**
     * 内部方法：根据 sessionId 计算某员工绩效结果
     */
    private VoteResultVO getResultBySession(String employeeId, Long sessionId) {
        if (sessionId == null) return null;

        Employee employee = employeeMapper.selectByEmployeeId(employeeId);
        if (employee == null) return null;

        List<Vote> allVotes = voteMapper.selectList(
                new LambdaQueryWrapper<Vote>()
                        .eq(Vote::getVoteSessionId, sessionId)
                        .eq(Vote::getTargetId, employeeId)
        );

        Set<Integer> leaderLevels = getLeaderLevels(employee.getLevel());

        // 统计票数
        Map<String, Integer> leaderVotesMap = initVoteCount();
        Map<String, Integer> staffVotesMap = initVoteCount();

        for (Vote v : allVotes) {
            if (v.getVoterLevel() == null) continue;
            String grade = v.getGrade();
            if (leaderLevels.contains(v.getVoterLevel())) {
                leaderVotesMap.merge(grade, 1, Integer::sum);
                leaderVotesMap.merge("total", 1, Integer::sum);
            }
            if (v.getVoterLevel() != 1) {
                staffVotesMap.merge(grade, 1, Integer::sum);
                staffVotesMap.merge("total", 1, Integer::sum);
            }
        }

        // 计算加权得分
        double leaderBaseScore = calcBaseScore(leaderVotesMap);
        double staffBaseScore = calcBaseScore(staffVotesMap);

        double totalScore;
        int leaderTotal = leaderVotesMap.getOrDefault("total", 0);
        int staffTotal = staffVotesMap.getOrDefault("total", 0);

        if (leaderTotal == 0 && staffTotal == 0) {
            totalScore = 0;
        } else if (leaderTotal == 0) {
            totalScore = staffBaseScore;
        } else if (staffTotal == 0) {
            totalScore = leaderBaseScore;
        } else {
            totalScore = leaderBaseScore * 0.4 + staffBaseScore * 0.6;
        }

        // 计算各等级得分（用于图表展示）
        Map<String, Double> gradeScores = new LinkedHashMap<>();
        for (String g : List.of("A", "B", "C", "D")) {
            double ls = leaderTotal > 0 ? (double) leaderVotesMap.getOrDefault(g, 0) / leaderTotal * 0.4 : 0;
            double ss = staffTotal > 0 ? (double) staffVotesMap.getOrDefault(g, 0) / staffTotal * 0.6 : 0;
            gradeScores.put(g, round2((leaderTotal > 0 && staffTotal > 0 ? (ls + ss) : (leaderTotal > 0 ? (double) leaderVotesMap.getOrDefault(g, 0) / leaderTotal : (double) staffVotesMap.getOrDefault(g, 0) / staffTotal)) * 100));
        }

        String finalGrade = calcFinalGrade(totalScore);

        VoteResultVO vo = new VoteResultVO();
        vo.setEmployeeId(employeeId);
        vo.setName(employee.getName());
        vo.setDepartment(employee.getDepartment());
        vo.setLevel(employee.getLevel());
        vo.setLevelName(getLevelName(employee.getLevel()));
        vo.setLeaderVotes(leaderVotesMap);
        vo.setStaffVotes(staffVotesMap);
        vo.setGradeScores(gradeScores);
        vo.setTotalScore(round2(totalScore));
        vo.setFinalGrade(finalGrade);
        vo.setFinalGradeName(GRADE_NAME.getOrDefault(finalGrade, ""));
        return vo;
    }

    @Override
    public StatisticsVO getStatistics(Integer year) {
        Long sessionId = resolveSessionId(year);
        if (sessionId == null) return null;

        List<Employee> targets = employeeMapper.selectAllVotableEmployees();

        long submittedCount = voteSubmissionMapper.selectCount(
                new LambdaQueryWrapper<VoteSubmission>()
                        .eq(VoteSubmission::getVoteSessionId, sessionId)
                        .eq(VoteSubmission::getIsSubmitted, 1)
        );

        int aCount = 0, bCount = 0, cCount = 0, dCount = 0;
        List<StatisticsVO.ScoreRankItem> rankList = new ArrayList<>();

        for (Employee emp : targets) {
            VoteResultVO result = getResultBySession(emp.getEmployeeId(), sessionId);
            if (result == null || result.getTotalScore() == null || result.getTotalScore() == 0) continue;

            switch (result.getFinalGrade()) {
                case "A" -> aCount++;
                case "B" -> bCount++;
                case "C" -> cCount++;
                case "D" -> dCount++;
            }

            rankList.add(new StatisticsVO.ScoreRankItem(
                    emp.getEmployeeId(),
                    emp.getName(),
                    emp.getDepartment(),
                    emp.getLevel(),
                    getLevelName(emp.getLevel()),
                    result.getTotalScore(),
                    result.getFinalGrade(),
                    GRADE_NAME.getOrDefault(result.getFinalGrade(), "")
            ));
        }

        rankList.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        StatisticsVO vo = new StatisticsVO();
        vo.setTotalCount(targets.size());
        vo.setVotedCount((int) submittedCount);
        vo.setACount(aCount);
        vo.setBCount(bCount);
        vo.setCCount(cCount);
        vo.setDCount(dCount);
        vo.setScoreRanking(rankList);
        return vo;
    }

    @Override
    public VoteDetailVO getVoteDetail(Integer year) {
        Long sessionId = resolveSessionId(year);
        if (sessionId == null) return null;

        List<Employee> allParticipants = employeeMapper.selectAllVotableEmployees();

        List<Vote> allVotes = voteMapper.selectList(
                new LambdaQueryWrapper<Vote>().eq(Vote::getVoteSessionId, sessionId)
        );

        // 构建 voterId -> (targetId -> grade)
        Map<String, Map<String, String>> votesMatrix = new LinkedHashMap<>();
        for (Vote v : allVotes) {
            votesMatrix.computeIfAbsent(v.getVoterId(), k -> new HashMap<>())
                    .put(v.getTargetId(), v.getGrade());
        }

        // 构建投票人/被投票人列表
        List<VoteDetailVO.PersonInfo> personList = allParticipants.stream()
                .map(e -> {
                    VoteDetailVO.PersonInfo p = new VoteDetailVO.PersonInfo();
                    p.setId(e.getEmployeeId());
                    p.setName(e.getName());
                    p.setDepartment(e.getDepartment());
                    p.setLevel(e.getLevel());
                    p.setLevelName(getLevelName(e.getLevel()));
                    return p;
                }).collect(Collectors.toList());

        // 构建评分结果摘要
        Map<String, VoteDetailVO.ResultSummary> results = new LinkedHashMap<>();
        for (Employee emp : allParticipants) {
            VoteResultVO result = getResultBySession(emp.getEmployeeId(), sessionId);
            if (result != null) {
                VoteDetailVO.ResultSummary summary = new VoteDetailVO.ResultSummary();
                summary.setScore(result.getTotalScore());
                summary.setGrade(result.getFinalGrade());
                summary.setGradeName(result.getFinalGradeName());
                results.put(emp.getEmployeeId(), summary);
            }
        }

        VoteDetailVO vo = new VoteDetailVO();
        vo.setVoters(personList);
        vo.setTargets(personList);
        vo.setVotes(votesMatrix);
        vo.setResults(results);
        return vo;
    }

    @Override
    public List<Integer> getAvailableYears() {
        List<VoteSession> sessions = voteSessionMapper.selectList(
                new LambdaQueryWrapper<VoteSession>().orderByDesc(VoteSession::getYear)
        );
        return sessions.stream().map(VoteSession::getYear).distinct().collect(Collectors.toList());
    }

    @Override
    public List<Employee> getVoteTargets(String voterId) {
        List<Employee> all = employeeMapper.selectAllVotableEmployees();
        return all.stream()
                .filter(e -> !e.getEmployeeId().equals(voterId))
                .collect(Collectors.toList());
    }

    // ============ 私有辅助方法 ============

    private Map<String, Integer> initVoteCount() {
        Map<String, Integer> map = new LinkedHashMap<>();
        map.put("A", 0);
        map.put("B", 0);
        map.put("C", 0);
        map.put("D", 0);
        map.put("total", 0);
        return map;
    }

    private Set<Integer> getLeaderLevels(int employeeLevel) {
        if (employeeLevel == 2) return Set.of(1);
        if (employeeLevel == 3) return Set.of(1, 2);
        if (employeeLevel == 4) return Set.of(1, 2, 3);
        return Collections.emptySet();
    }

    private double calcBaseScore(Map<String, Integer> votesMap) {
        int total = votesMap.getOrDefault("total", 0);
        if (total == 0) return 0;
        double score = 0;
        for (String grade : List.of("A", "B", "C", "D")) {
            score += (double) votesMap.getOrDefault(grade, 0) / total * GRADE_BASE.get(grade);
        }
        return score;
    }

    private String calcFinalGrade(double totalScore) {
        if (totalScore > 95) return "A";
        if (totalScore >= 70) return "B";
        if (totalScore >= 50) return "C";
        return "D";
    }

    private double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }

    private String getLevelName(int level) {
        return switch (level) {
            case 1 -> "董事长";
            case 2 -> "经理层";
            case 3 -> "中层领导";
            case 4 -> "普通员工";
            default -> "未知";
        };
    }
}
