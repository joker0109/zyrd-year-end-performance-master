package com.company.performance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.company.performance.entity.Vote;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 投票记录数据访问层
 */
@Mapper
public interface VoteMapper extends BaseMapper<Vote> {

    /**
     * 查询某投票人的所有投票
     */
    @Select("SELECT * FROM votes WHERE vote_session_id = #{sessionId} AND voter_id = #{voterId}")
    List<Vote> selectByVoterId(@Param("sessionId") Long sessionId, @Param("voterId") String voterId);

    /**
     * 查询某被评人的所有投票
     */
    @Select("SELECT * FROM votes WHERE vote_session_id = #{sessionId} AND target_id = #{targetId}")
    List<Vote> selectByTargetId(@Param("sessionId") Long sessionId, @Param("targetId") String targetId);

    /**
     * 查询某批次所有投票
     */
    @Select("SELECT * FROM votes WHERE vote_session_id = #{sessionId}")
    List<Vote> selectBySessionId(@Param("sessionId") Long sessionId);

    /**
     * 统计某员工被投各等级票数
     */
    @Select("SELECT grade, COUNT(*) as count FROM votes WHERE vote_session_id = #{sessionId} AND target_id = #{targetId} GROUP BY grade")
    List<java.util.Map<String, Object>> countGradesByTargetId(@Param("sessionId") Long sessionId, @Param("targetId") String targetId);
}
