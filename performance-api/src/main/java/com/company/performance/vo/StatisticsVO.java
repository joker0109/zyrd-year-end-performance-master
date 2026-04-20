package com.company.performance.vo;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

/**
 * 统计数据VO
 */
@Data
public class StatisticsVO {

    /** 参评总人数 */
    private Integer totalCount;
    /** 已提交投票人数 */
    private Integer votedCount;
    /** 优秀(A)人数 */
    @JsonProperty("aCount")
    private Integer aCount;
    /** 良好(B)人数 */
    @JsonProperty("bCount")
    private Integer bCount;
    /** 合格(C)人数 */
    @JsonProperty("cCount")
    private Integer cCount;
    /** 不合格(D)人数 */
    @JsonProperty("dCount")
    private Integer dCount;

    /** 得分排名列表（按得分降序） */
    private List<ScoreRankItem> scoreRanking;

    @Data
    @AllArgsConstructor
    public static class ScoreRankItem {
        private String employeeId;
        private String name;
        private String department;
        private Integer level;
        private String levelName;
        private Double score;
        private String grade;
        private String gradeName;
    }
}
