package com.company.performance.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 修改密码请求DTO
 */
@Data
public class ChangePasswordDTO {

    /**
     * 员工ID
     */
    @NotBlank(message = "员工ID不能为空")
    private String employeeId;

    /**
     * 旧密码（明文）
     */
    @NotBlank(message = "旧密码不能为空")
    private String oldPassword;

    /**
     * 新密码（明文）
     */
    @NotBlank(message = "新密码不能为空")
    @Size(min = 6, max = 20, message = "新密码长度必须在6-20位之间")
    private String newPassword;

    /**
     * 确认新密码（明文）
     */
    @NotBlank(message = "确认密码不能为空")
    private String confirmPassword;
}
