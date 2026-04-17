package com.company.performance.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 投票批次实体类
 */
@Data
@TableName("vote_sessions")
public class VoteSession {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 评分年度
     */
    private Integer year;

    /**
     * 批次名称
     */
    private String name;

    /**
     * 开始时间
     */
    @TableField("start_time")
    private LocalDateTime startTime;

    /**
     * 截止时间
     */
    @TableField("end_time")
    private LocalDateTime endTime;

    /**
     * 状态：0未开始 1进行中 2已结束
     */
    private Integer status;

    /**
     * 是否已计算：0否 1是
     */
    @TableField("is_calculated")
    private Integer isCalculated;

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
