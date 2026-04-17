package com.company.performance.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 评分结果实体类
 */
@Data
@TableName("scores")
public class Score {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 投票批次ID
     */
    @TableField("vote_session_id")
    private Long voteSessionId;

    /**
     * 员工ID
     */
    @TableField("employee_id")
    private String employeeId;

    /**
     * 员工层级
     */
    private Integer level;

    // ========== 领导评分票数 ==========
    @TableField("leader_a_count")
    private Integer leaderACount;

    @TableField("leader_b_count")
    private Integer leaderBCount;

    @TableField("leader_c_count")
    private Integer leaderCCount;

    @TableField("leader_d_count")
    private Integer leaderDCount;

    @TableField("leader_total_count")
    private Integer leaderTotalCount;

    // ========== 全体员工评分票数 ==========
    @TableField("staff_a_count")
    private Integer staffACount;

    @TableField("staff_b_count")
    private Integer staffBCount;

    @TableField("staff_c_count")
    private Integer staffCCount;

    @TableField("staff_d_count")
    private Integer staffDCount;

    @TableField("staff_total_count")
    private Integer staffTotalCount;

    // ========== 各等级得分 ==========
    @TableField("score_a")
    private BigDecimal scoreA;

    @TableField("score_b")
    private BigDecimal scoreB;

    @TableField("score_c")
    private BigDecimal scoreC;

    @TableField("score_d")
    private BigDecimal scoreD;

    // ========== 最终结果 ==========
    @TableField("total_score")
    private BigDecimal totalScore;

    @TableField("final_grade")
    private String finalGrade;

    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
