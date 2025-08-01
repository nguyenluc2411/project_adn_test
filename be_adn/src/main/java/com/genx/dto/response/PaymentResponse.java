package com.genx.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
public class PaymentResponse {
    private Long id;
    private String orderId;
    private Integer amount;
    private String transactionNo;
    private String responseCode;
    private LocalDateTime payDate;
    private String paymentStatus;
}