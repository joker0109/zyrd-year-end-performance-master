package com.company.performance.service;

import com.company.performance.entity.Employee;
import com.company.performance.vo.*;

import java.util.List;
import java.util.Map;

/**
 * 投票服务接口
 */
public interface VoteService {

    /**
     * 提交投票（每人只能提交一次）
     *
     * @param voterId 投票人ID
     * @param votes   投票内容 Map<被投票人ID, 评分等级>
     * @return null 表示成功，否则返回错误信息
     */
    String submitVotes(String voterId, Map<String, String> votes);

    /**
     * 检查某员工是否已提交投票
     */
    boolean isSubmitted(String voterId);

    /**
     * 获取某投票人已提交的投票内容（用于回显）
     *
     * @return Map<被投票人ID, 评分等级>，未提交返回 null
     */
    Map<String, String> getMyVotes(String voterId);

    /**
     * 计算并返回某员工的评分结果（默认当前绩效年）
     */
    VoteResultVO getResult(String employeeId);

    /**
     * 获取全公司统计数据（year=null 表示当前绩效年）
     */
    StatisticsVO getStatistics(Integer year);

    /**
     * 获取投票详情矩阵（韩雪专属，year=null 表示当前绩效年）
     */
    VoteDetailVO getVoteDetail(Integer year);

    /**
     * 获取历史绩效年份列表（韩雪专属）
     */
    List<Integer> getAvailableYears();

    /**
     * 获取某投票人的投票目标列表（排除自己和董事长）
     */
    List<Employee> getVoteTargets(String voterId);
}
