package com.company.performance.controller;

import com.company.performance.dto.ChangePasswordDTO;
import com.company.performance.dto.LoginDTO;
import com.company.performance.entity.Employee;
import com.company.performance.entity.SystemAdmin;
import com.company.performance.mapper.SystemAdminMapper;
import com.company.performance.service.EmployeeService;
import com.company.performance.service.VoteService;
import com.company.performance.vo.LoginVO;
import com.company.performance.vo.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 员工管理控制器
 */
@RestController
@RequestMapping("/employee")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final VoteService voteService;
    private final SystemAdminMapper systemAdminMapper;

    /**
     * 登录
     * POST /api/employee/login
     */
    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO dto) {
        Employee employee = employeeService.login(dto.getUsername(), dto.getPassword());
        if (employee == null) {
            return Result.fail("用户名或密码错误");
        }

        // 查询管理员配置
        SystemAdmin admin = systemAdminMapper.selectByEmployeeId(employee.getEmployeeId());
        boolean isAdmin = admin != null;

        // 判断是否已提交投票
        boolean submitted = voteService.isSubmitted(employee.getEmployeeId());
        Map<String, String> myVotes = submitted ? voteService.getMyVotes(employee.getEmployeeId()) : null;

        // 层级名称
        String levelName = switch (employee.getLevel()) {
            case 1 -> "董事长";
            case 2 -> "经理层";
            case 3 -> "中层领导";
            case 4 -> "普通员工";
            default -> "未知";
        };

        LoginVO vo = new LoginVO();
        vo.setEmployeeId(employee.getEmployeeId());
        vo.setName(employee.getName());
        vo.setDepartment(employee.getDepartment());
        vo.setLevel(employee.getLevel());
        vo.setLevelName(levelName);
        vo.setIsAdmin(isAdmin);
        vo.setCanViewResult(isAdmin && admin.getCanViewResult() == 1);
        vo.setCanViewStats(isAdmin && admin.getCanViewStats() == 1);
        vo.setCanViewVoteDetail(isAdmin && admin.getCanViewVoteDetail() == 1);
        vo.setIsSubmitted(submitted);
        vo.setMyVotes(myVotes);
        return Result.ok(vo);
    }

    /**
     * 获取所有参与评分的员工列表
     * GET /api/employee/list
     */
    @GetMapping("/list")
    public Result<List<Map<String, Object>>> list() {
        List<Employee> employees = employeeService.getAllVotableEmployees();
        List<Map<String, Object>> result = employees.stream()
                .map(e -> {
                    Map<String, Object> m = new java.util.HashMap<>();
                    m.put("id", e.getEmployeeId());
                    m.put("name", e.getName());
                    m.put("department", e.getDepartment());
                    m.put("level", e.getLevel());
                    return m;
                })
                .collect(Collectors.toList());
        return Result.ok(result);
    }

    /**
     * 获取某员工的投票目标列表
     * GET /api/employee/vote-targets?voterId=E011
     */
    @GetMapping("/vote-targets")
    public Result<List<Map<String, Object>>> voteTargets(@RequestParam String voterId) {
        List<Employee> targets = voteService.getVoteTargets(voterId);
        List<Map<String, Object>> result = targets.stream()
                .map(e -> {
                    Map<String, Object> m = new java.util.HashMap<>();
                    m.put("id", e.getEmployeeId());
                    m.put("name", e.getName());
                    m.put("department", e.getDepartment());
                    m.put("level", e.getLevel());
                    return m;
                })
                .collect(Collectors.toList());
        return Result.ok(result);
    }

    /**
     * 修改密码
     * POST /api/employee/change-password
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
