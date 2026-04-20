package com.company.performance.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 员工实体类
 */
@Data
@TableName("employees")
public class Employee {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 员工编号，如E001
     */
    @TableField("employee_id")
    private String employeeId;

    /**
     * 姓名
     */
    private String name;

    /**
     * 部门
     */
    private String department;

    /**
     * 层级：1董事长 2经理层 3中层领导 4普通员工
     */
    private Integer level;

    /**
     * 手机号（用于登录）
     */
    private String phone;

    /**
     * 登录用户名
     */
    private String username;

    /**
     * 登录密码（MD5加密）
     */
    private String password;

    /**
     * 职位
     */
    private String position;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 状态：0离职 1在职
     */
    private Integer status;

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

    /**
     * 是否删除
     */
    @TableLogic
    @TableField("is_deleted")
    private Integer isDeleted;
}
