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
     * 获取全公司统计数据
     * GET /api/vote/statistics
     */
    @GetMapping("/statistics")
    public Result<StatisticsVO> statistics() {
        StatisticsVO vo = voteService.getStatistics();
        if (vo == null) {
            return Result.fail("暂无统计数据");
        }
        return Result.ok(vo);
    }

    /**
     * 获取投票详情矩阵（韩雪专属）
     * GET /api/vote/detail
     */
    @GetMapping("/detail")
    public Result<VoteDetailVO> detail() {
        VoteDetailVO vo = voteService.getVoteDetail();
        if (vo == null) {
            return Result.fail("暂无投票详情");
        }
        return Result.ok(vo);
    }
}
