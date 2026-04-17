package com.company.performance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.company.performance.entity.SystemAdmin;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 系统管理员数据访问层
 */
@Mapper
public interface SystemAdminMapper extends BaseMapper<SystemAdmin> {

    /**
     * 根据员工ID查询管理员配置
     */
    @Select("SELECT * FROM system_admins WHERE employee_id = #{employeeId}")
    SystemAdmin selectByEmployeeId(@Param("employeeId") String employeeId);
}
