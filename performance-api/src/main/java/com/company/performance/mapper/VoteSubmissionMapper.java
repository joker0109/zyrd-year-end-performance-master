package com.company.performance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.company.performance.entity.VoteSubmission;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 投票提交记录数据访问层
 */
@Mapper
public interface VoteSubmissionMapper extends BaseMapper<VoteSubmission> {

    /**
     * 查询某投票人的提交记录
     */
    @Select("SELECT * FROM vote_submissions WHERE vote_session_id = #{sessionId} AND voter_id = #{voterId}")
    VoteSubmission selectByVoterId(@Param("sessionId") Long sessionId, @Param("voterId") String voterId);

    /**
     * 检查是否已提交
     */
    @Select("SELECT COUNT(*) FROM vote_submissions WHERE vote_session_id = #{sessionId} AND voter_id = #{voterId} AND is_submitted = 1")
    Integer checkSubmitted(@Param("sessionId") Long sessionId, @Param("voterId") String voterId);
}
