package com.genx.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoomResponse {
    private String roomId;
    private Long customerId;
    private String customerName;
    private Long staffId;
    private String staffName;
}