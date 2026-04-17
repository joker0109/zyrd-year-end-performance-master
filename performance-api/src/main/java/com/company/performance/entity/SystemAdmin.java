package com.company.performance.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 系统管理员配置实体类
 */
@Data
@TableName("system_admins")
public class SystemAdmin {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 管理员员工ID
     */
    @TableField("employee_id")
    private String employeeId;

    /**
     * 角色：admin管理员
     */
    private String role;

    /**
     * 是否可查看结果页：0否 1是
     */
    @TableField("can_view_result")
    private Integer canViewResult;

    /**
     * 是否可查看统计页：0否 1是
     */
    @TableField("can_view_stats")
    private Integer canViewStats;

    /**
     * 是否可查看投票详情：0否 1是
     */
    @TableField("can_view_vote_detail")
    private Integer canViewVoteDetail;

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
