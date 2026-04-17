package com.company.performance.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 操作日志实体类
 */
@Data
@TableName("operation_logs")
public class OperationLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 操作人ID
     */
    @TableField("employee_id")
    private String employeeId;

    /**
     * 操作类型：LOGIN登录/VOTE投票/QUERY查询等
     */
    @TableField("operation_type")
    private String operationType;

    /**
     * 操作描述
     */
    @TableField("operation_desc")
    private String operationDesc;

    /**
     * IP地址
     */
    @TableField("ip_address")
    private String ipAddress;

    /**
     * 浏览器UA
     */
    @TableField("user_agent")
    private String userAgent;

    /**
     * 请求数据
     */
    @TableField("request_data")
    private String requestData;

    /**
     * 响应数据
     */
    @TableField("response_data")
    private String responseData;

    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
