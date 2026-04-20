package com.company.performance.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.company.performance.dto.ChangePasswordDTO;
import com.company.performance.dto.LoginDTO;
import com.company.performance.entity.Employee;
import com.company.performance.entity.SystemAdmin;
import com.company.performance.mapper.SystemAdminMapper;
import com.company.performance.service.EmployeeService;
import com.company.performance.service.VoteService;
import com.company.performance.utils.JwtUtil;
import com.company.performance.utils.RedisUtil;
import com.company.performance.vo.LoginVO;
import com.company.performance.vo.Result;
import jakarta.servlet.http.HttpServletRequest;
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
    private final JwtUtil jwtUtil;
    private final RedisUtil redisUtil;

    /** Token 过期时间：2小时 */
    private static final long SESSION_EXPIRE_SECONDS = 7200L;

    /**
     * 登录
     * POST /api/employee/login
     */
    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO dto) {
        Employee employee = employeeService.login(dto.getPhone(), dto.getPassword());
        if (employee == null) {
            return Result.fail("手机号或密码错误");
        }

        LoginVO vo = buildLoginVO(employee);

        // 生成 JWT Token 并存入 Redis（2小时过期）
        String token = jwtUtil.generateToken(employee.getEmployeeId());
        redisUtil.setLoginSession(token, employee.getEmployeeId(), SESSION_EXPIRE_SECONDS);
        vo.setToken(token);

        return Result.ok(vo);
    }

    /**
     * 退出登录 - 删除 Redis 中的 Session
     * POST /api/employee/logout
     */
    @PostMapping("/logout")
    public Result<Void> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            redisUtil.deleteLoginSession(authHeader.substring(7));
        }
        return Result.ok("已退出登录", null);
    }

    /**
     * 获取当前登录用户信息（用于页面刷新后会话恢复）
     * GET /api/employee/me
     */
    @GetMapping("/me")
    public Result<LoginVO> me(HttpServletRequest request) {
        String employeeId = (String) request.getAttribute("currentEmployeeId");
        Employee employee = employeeService.getOne(
                new LambdaQueryWrapper<Employee>().eq(Employee::getEmployeeId, employeeId)
        );
        if (employee == null) {
            return Result.fail("用户信息不存在");
        }
        return Result.ok(buildLoginVO(employee));
    }

    /**
     * 构建 LoginVO（登录和会话恢复共用）
     */
    private LoginVO buildLoginVO(Employee employee) {
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
        return vo;
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
