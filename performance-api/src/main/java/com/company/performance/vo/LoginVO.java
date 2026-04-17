package com.company.performance.vo;

import lombok.Data;
import java.util.Map;

/**
 * 登录返回VO
 */
@Data
public class LoginVO {

    private String employeeId;
    private String name;
    private String department;
    private Integer level;
    private String levelName;

    /** 是否是系统管理员 */
    private Boolean isAdmin;
    /** 是否可查看结果页签 */
    private Boolean canViewResult;
    /** 是否可查看统计页签 */
    private Boolean canViewStats;
    /** 是否可查看投票详情页签（韩雪专属） */
    private Boolean canViewVoteDetail;

    /** 是否已提交投票 */
    private Boolean isSubmitted;
    /**
     * 已提交的投票详情（已提交时返回，用于前端回显）
     * Map<被投票人ID, 评分等级>
     */
    private Map<String, String> myVotes;
}
