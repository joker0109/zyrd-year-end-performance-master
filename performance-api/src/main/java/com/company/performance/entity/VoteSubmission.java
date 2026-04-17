package com.company.performance.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 投票提交记录实体类
 */
@Data
@TableName("vote_submissions")
public class VoteSubmission {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 投票批次ID
     */
    @TableField("vote_session_id")
    private Long voteSessionId;

    /**
     * 投票人ID
     */
    @TableField("voter_id")
    private String voterId;

    /**
     * 提交时间
     */
    @TableField("submit_time")
    private LocalDateTime submitTime;

    /**
     * 是否已提交：0草稿 1已提交
     */
    @TableField("is_submitted")
    private Integer isSubmitted;

    /**
     * 提交IP地址
     */
    @TableField("ip_address")
    private String ipAddress;

    /**
     * 浏览器UA
     */
    @TableField("user_agent")
    private String userAgent;

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
