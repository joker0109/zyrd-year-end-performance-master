package com.company.performance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.company.performance.entity.SystemConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 系统配置数据访问层
 */
@Mapper
public interface SystemConfigMapper extends BaseMapper<SystemConfig> {

    /**
     * 根据key查询配置
     */
    @Select("SELECT * FROM system_config WHERE config_key = #{key}")
    SystemConfig selectByKey(@Param("key") String key);

    /**
     * 根据key查询配置值
     */
    @Select("SELECT config_value FROM system_config WHERE config_key = #{key}")
    String selectValueByKey(@Param("key") String key);
}
