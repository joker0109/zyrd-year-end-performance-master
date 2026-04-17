package com.company.performance.vo;

import lombok.Data;
import java.util.List;
import java.util.Map;

/**
 * 韩雪专属投票详情VO（二维矩阵）
 */
@Data
public class VoteDetailVO {

    /** 所有投票人列表 */
    private List<PersonInfo> voters;
    /** 所有被投票人列表 */
    private List<PersonInfo> targets;
    /**
     * 投票矩阵：Map<投票人ID, Map<被投票人ID, 评分等级>>
     */
    private Map<String, Map<String, String>> votes;
    /**
     * 评分结果：Map<被投票人ID, {score, grade, gradeName}>
     */
    private Map<String, ResultSummary> results;

    @Data
    public static class PersonInfo {
        private String id;
        private String name;
        private String department;
        private Integer level;
        private String levelName;
    }

    @Data
    public static class ResultSummary {
        private Double score;
        private String grade;
        private String gradeName;
    }
}
