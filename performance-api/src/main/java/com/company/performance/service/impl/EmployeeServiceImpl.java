package com.company.performance.service.impl;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.company.performance.entity.Employee;
import com.company.performance.mapper.EmployeeMapper;
import com.company.performance.service.EmployeeService;
import com.company.performance.utils.MD5Util;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 员工服务实现类
 */
@Service
public class EmployeeServiceImpl extends ServiceImpl<EmployeeMapper, Employee> implements EmployeeService {

    @Override
    public Employee login(String username, String password) {
        Employee employee = baseMapper.selectByUsername(username);
        if (employee == null) {
            return null;
        }
        // 密码MD5校验
        String encryptedPassword = MD5Util.encrypt(password);
        if (!encryptedPassword.equals(employee.getPassword())) {
            return null;
        }
        return employee;
    }

    @Override
    public Employee getByUsername(String username) {
        return baseMapper.selectByUsername(username);
    }

    @Override
    public List<Employee> getAllVotableEmployees() {
        return baseMapper.selectAllVotableEmployees();
    }

    @Override
    public List<Employee> getByLevel(Integer level) {
        return baseMapper.selectByLevel(level);
    }

    @Override
    public List<Employee> getVoteTargets(String voterId) {
        // 获取所有参与评分的员工（排除董事长）
        List<Employee> allEmployees = baseMapper.selectAllVotableEmployees();
        // 过滤掉自己
        return allEmployees.stream()
                .filter(e -> !e.getEmployeeId().equals(voterId))
                .collect(Collectors.toList());
    }

    @Override
    public String changePassword(String employeeId, String oldPassword, String newPassword, String confirmPassword) {
        // 1. 查询员工是否存在
        Employee employee = baseMapper.selectByEmployeeId(employeeId);
        if (employee == null) {
            return "员工不存在";
        }
        // 2. 校验旧密码
        if (!MD5Util.verify(oldPassword, employee.getPassword())) {
            return "旧密码错误";
        }
        // 3. 新密码与确认密码是否一致
        if (!newPassword.equals(confirmPassword)) {
            return "新密码与确认密码不一致";
        }
        // 4. 新密码不能与旧密码相同
        if (oldPassword.equals(newPassword)) {
            return "新密码不能与旧密码相同";
        }
        // 5. 更新密码
        String encryptedNewPwd = MD5Util.encrypt(newPassword);
        baseMapper.update(null, new LambdaUpdateWrapper<Employee>()
                .eq(Employee::getEmployeeId, employeeId)
                .set(Employee::getPassword, encryptedNewPwd));
        return null; // null 表示成功
    }
}