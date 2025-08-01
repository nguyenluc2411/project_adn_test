package com.genx.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class SampleCollectionHistoryResponse {
    private Long collectionId;
    private String bookingCode;
    private String customerName;
    private String collectionOption;
    private String collectedByName;
    private String status;
    private String note;
    private LocalDateTime collectedAt;
    private LocalDateTime confirmedAt;
    private List<ParticipantResponse> participants;
}
