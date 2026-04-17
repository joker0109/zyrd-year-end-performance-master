package com.company.performance.vo;

import lombok.Data;
import java.util.Map;

/**
 * 投票结果VO（单个员工的评分结果）
 */
@Data
public class VoteResultVO {

    private String employeeId;
    private String name;
    private String department;
    private Integer level;
    private String levelName;

    /** 领导投票票数：{A: n, B: n, C: n, D: n, total: n} */
    private Map<String, Integer> leaderVotes;
    /** 员工互评票数：{A: n, B: n, C: n, D: n, total: n} */
    private Map<String, Integer> staffVotes;
    /** 各等级得分：{A: 35.0, B: 30.0, C: ...} */
    private Map<String, Double> gradeScores;
    /** 总分（A得分 + B得分） */
    private Double totalScore;
    /** 最终评级：A/B/C/D */
    private String finalGrade;
    /** 最终评级名称：优秀/良好/合格/不合格 */
    private String finalGradeName;
}
