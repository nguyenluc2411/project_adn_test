package com.genx.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
public class PaymentRequest {
    private Long bookingId;
    private String orderId;
    private Integer amount;
    private String transactionNo;
    private String responseCode;
    private LocalDateTime payDate;

}