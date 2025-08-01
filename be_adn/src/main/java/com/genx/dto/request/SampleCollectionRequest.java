package com.genx.dto.request;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SampleCollectionRequest {
    private Long bookingId;
    private Long collectedById;
    private String note;
}
