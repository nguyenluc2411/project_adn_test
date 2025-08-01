package com.genx.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SampleCollectionResponse {
    private Long collectionId;
    private Long bookingId;
    private String bookingRegistrantName;
    private String collectedByName;
    private String status;
    private String note;
    private LocalDateTime collectedAt;
    private LocalDateTime confirmedAt;
}
