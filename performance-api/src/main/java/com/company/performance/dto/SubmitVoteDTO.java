package com.company.performance.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.Map;

/**
 * 提交投票请求DTO
 */
@Data
public class SubmitVoteDTO {

    /** 投票人员工ID */
    @NotBlank(message = "投票人ID不能为空")
    private String voterId;

    /**
     * 投票内容：Map<被投票人ID, 评分等级(A/B/C/D)>
     */
    @NotEmpty(message = "投票内容不能为空")
    private Map<String, String> votes;
}
