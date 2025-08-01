package com.genx.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class AdnResultRequest {
    private Long bookingId;
    private Map<String, String> lociResults;
    private String conclusion;
    private Long staffId;
}
