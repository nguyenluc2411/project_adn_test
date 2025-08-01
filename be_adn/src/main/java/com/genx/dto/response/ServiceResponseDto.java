package com.genx.dto.response;

import com.genx.enums.ECaseType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceResponseDto {
    private Long id;
    private String name;
    private Double price;
    private ECaseType caseType;
    private boolean enabled;
}