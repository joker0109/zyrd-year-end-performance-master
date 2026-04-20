package com.company.performance.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.company.performance.entity.Employee;

import java.util.List;

/**
 * 员工服务接口
 */
public interface EmployeeService extends IService<Employee> {

    /**
     * 用户登录（手机号 + 密码）
     */
    Employee login(String phone, String password);

    /**
     * 根据用户名查询员工
     */
    Employee getByUsername(String username);

    /**
     * 获取所有参与评分的员工（排除董事长）
     */
    List<Employee> getAllVotableEmployees();

    /**
     * 根据层级获取员工
     */
    List<Employee> getByLevel(Integer level);

    /**
     * 获取某员工需要评分的人员列表（排除自己和董事长）
     */
    List<Employee> getVoteTargets(String voterId);

    /**
     * 修改密码
     *
     * @param employeeId      员工ID
     * @param oldPassword     旧密码（明文）
     * @param newPassword     新密码（明文）
     * @param confirmPassword 确认新密码（明文）
     * @return 修改结果描述，null 表示成功
     */
    String changePassword(String employeeId, String oldPassword, String newPassword, String confirmPassword);
}
