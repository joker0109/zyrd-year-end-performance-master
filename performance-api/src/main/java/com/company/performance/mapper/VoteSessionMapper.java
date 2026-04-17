package com.company.performance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.company.performance.entity.VoteSession;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 投票批次数据访问层
 */
@Mapper
public interface VoteSessionMapper extends BaseMapper<VoteSession> {

    /**
     * 根据年度查询投票批次
     */
    @Select("SELECT * FROM vote_sessions WHERE year = #{year}")
    VoteSession selectByYear(@Param("year") Integer year);

    /**
     * 查询当前进行中的投票批次
     */
    @Select("SELECT * FROM vote_sessions WHERE status = 1 ORDER BY id DESC LIMIT 1")
    VoteSession selectCurrentSession();
}
