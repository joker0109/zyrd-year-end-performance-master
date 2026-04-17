package com.company.performance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.company.performance.entity.Employee;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 员工数据访问层
 */
@Mapper
public interface EmployeeMapper extends BaseMapper<Employee> {

    /**
     * 根据用户名查询员工
     */
    @Select("SELECT * FROM employees WHERE username = #{username} AND status = 1 AND is_deleted = 0")
    Employee selectByUsername(@Param("username") String username);

    /**
     * 查询所有参与评分的员工（排除董事长）
     */
    @Select("SELECT * FROM employees WHERE level != 1 AND status = 1 AND is_deleted = 0 ORDER BY level, employee_id")
    List<Employee> selectAllVotableEmployees();

    /**
     * 根据层级查询员工
     */
    @Select("SELECT * FROM employees WHERE level = #{level} AND status = 1 AND is_deleted = 0 ORDER BY employee_id")
    List<Employee> selectByLevel(@Param("level") Integer level);

    /**
     * 根据员工编号查询员工
     */
    @Select("SELECT * FROM employees WHERE employee_id = #{employeeId} AND is_deleted = 0")
    Employee selectByEmployeeId(@Param("employeeId") String employeeId);
}
