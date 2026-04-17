package com.company.performance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.company.performance.entity.Score;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 评分结果数据访问层
 */
@Mapper
public interface ScoreMapper extends BaseMapper<Score> {

    /**
     * 根据员工ID查询评分结果
     */
    @Select("SELECT * FROM scores WHERE vote_session_id = #{sessionId} AND employee_id = #{employeeId}")
    Score selectByEmployeeId(@Param("sessionId") Long sessionId, @Param("employeeId") String employeeId);

    /**
     * 查询某批次所有评分结果（按得分降序）
     */
    @Select("SELECT * FROM scores WHERE vote_session_id = #{sessionId} ORDER BY total_score DESC")
    List<Score> selectAllBySessionIdOrderByScore(@Param("sessionId") Long sessionId);

    /**
     * 统计各等级人数
     */
    @Select("SELECT final_grade, COUNT(*) as count FROM scores WHERE vote_session_id = #{sessionId} GROUP BY final_grade")
    List<java.util.Map<String, Object>> countByGrade(@Param("sessionId") Long sessionId);
}
