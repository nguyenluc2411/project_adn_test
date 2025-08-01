package com.genx.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KitStockResponseDto {
    private int totalQuantity;
    private int remainingQuantity;
    private int usedQuantity;
    private LocalDateTime lastUpdated;
}
