package com.genx.dto.request;

import com.genx.enums.ECaseType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequestDto {
    private Long id;
    private String name;
    private Double price;
    private ECaseType caseType;
    private Boolean enabled;
}