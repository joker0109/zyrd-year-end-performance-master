package com.company.performance.controller;

import com.company.performance.dto.SubmitVoteDTO;
import com.company.performance.service.VoteService;
import com.company.performance.vo.Result;
import com.company.performance.vo.StatisticsVO;
import com.company.performance.vo.VoteDetailVO;
import com.company.performance.vo.VoteResultVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 投票控制器
 */
@RestController
@RequestMapping("/vote")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;

    /**
     * 提交投票
     * POST /api/vote/submit
     */
    @PostMapping("/submit")
    public Result<Void> submit(@Valid @RequestBody SubmitVoteDTO dto) {
        String error = voteService.submitVotes(dto.getVoterId(), dto.getVotes());
        if (error != null) {
            return Result.fail(error);
        }
        return Result.ok("评分提交成功", null);
    }

    /**
     * 查询某员工的评分结果
     * GET /api/vote/result?employeeId=E011
     */
    @GetMapping("/result")
    public Result<VoteResultVO> result(@RequestParam String employeeId) {
        VoteResultVO vo = voteService.getResult(employeeId);
        if (vo == null) {
            return Result.fail("暂无评分数据");
        }
        return Result.ok(vo);
    }

    /**
     * 获取全公司统计数据（韩雪专属支持 year 参数）
     * GET /api/vote/statistics?year=2025
     */
    @GetMapping("/statistics")
    public Result<StatisticsVO> statistics(@RequestParam(required = false) Integer year) {
        StatisticsVO vo = voteService.getStatistics(year);
        if (vo == null) {
            return Result.fail("暂无统计数据");
        }
        return Result.ok(vo);
    }

    /**
     * 获取投票详情矩阵（韩雪专属，支持 year 参数）
     * GET /api/vote/detail?year=2025
     */
    @GetMapping("/detail")
    public Result<VoteDetailVO> detail(@RequestParam(required = false) Integer year) {
        VoteDetailVO vo = voteService.getVoteDetail(year);
        if (vo == null) {
            return Result.fail("暂无投票详情");
        }
        return Result.ok(vo);
    }

    /**
     * 获取历史绩效年份列表（韩雪专属）
     * GET /api/vote/years
     */
    @GetMapping("/years")
    public Result<List<Integer>> years() {
        List<Integer> yearList = voteService.getAvailableYears();
        return Result.ok(yearList);
    }
}
