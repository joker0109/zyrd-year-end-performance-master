package com.company.performance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.company.performance.entity.OperationLog;
import org.apache.ibatis.annotations.Mapper;

/**
 * 操作日志数据访问层
 */
@Mapper
public interface OperationLogMapper extends BaseMapper<OperationLog> {
}
