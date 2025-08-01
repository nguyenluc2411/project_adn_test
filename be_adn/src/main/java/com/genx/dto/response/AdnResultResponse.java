package com.genx.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;

@Data
public class AdnResultResponse {
    private Long id;
    private Long bookingId;
    private String code;
    private String trackingCode;
    private String trackingPassword;
    private LocalDateTime createdAt;
    private Map<String, String> lociResults;
    private String conclusion;
    private List<ParticipantResponse> participants;
}