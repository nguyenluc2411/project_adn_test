package com.genx.dto.response;

import com.genx.enums.EBookingStatus;
import com.genx.enums.ECaseType;
import com.genx.enums.ECollectionMethod;
import com.genx.enums.EPaymentStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingSummaryResponse {
    private Long id;
    private String code;
    private String customerName;
    private String phoneNumber;
    private LocalDateTime createdAt;
    private EBookingStatus status;
    private ECaseType caseType;
    private String serviceTypeName;
    private String avatar;
    private ECollectionMethod collectionMethod;
    private EPaymentStatus paymentStatus;
}
