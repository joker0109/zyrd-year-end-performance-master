package com.company.performance.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 投票记录实体类
 */
@Data
@TableName("votes")
public class Vote {

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
     * 投票人层级
     */
    @TableField("voter_level")
    private Integer voterLevel;

    /**
     * 被评人ID
     */
    @TableField("target_id")
    private String targetId;

    /**
     * 被评人层级
     */
    @TableField("target_level")
    private Integer targetLevel;

    /**
     * 评分等级：A优秀 B良好 C合格 D不合格
     */
    private String grade;

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
