package com.genx.dto.response;

import com.genx.enums.ENotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private ENotificationType type;
    private boolean isRead;
    private LocalDateTime createdAt;

    private Long bookingId;
    private String bookingCode;
}
