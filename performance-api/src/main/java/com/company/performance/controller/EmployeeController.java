package com.company.performance.controller;

import com.company.performance.dto.ChangePasswordDTO;
import com.company.performance.service.EmployeeService;
import com.company.performance.vo.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 员工管理控制器
 */
@RestController
@RequestMapping("/employee")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    /**
     * 修改密码
     * POST /api/employee/change-password
     *
     * 请求体示例:
     * {
     *   "employeeId": "E001",
     *   "oldPassword": "123456",
     *   "newPassword": "newPwd123",
     *   "confirmPassword": "newPwd123"
     * }
     */
    @PostMapping("/change-password")
    public Result<Void> changePassword(@Valid @RequestBody ChangePasswordDTO dto) {
        String errorMsg = employeeService.changePassword(
                dto.getEmployeeId(),
                dto.getOldPassword(),
                dto.getNewPassword(),
                dto.getConfirmPassword()
        );
        if (errorMsg != null) {
            return Result.fail(errorMsg);
        }
        return Result.ok("密码修改成功", null);
    }
}
