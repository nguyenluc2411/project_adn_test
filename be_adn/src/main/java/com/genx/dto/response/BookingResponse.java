package com.genx.dto.response;

import com.genx.enums.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
@Getter
@Setter
public class BookingResponse {
    private Long id;
    private String code;
    private String customerName;
    private String recordStaffName;
    private String phoneNumber;
    private String email;
    private Double servicePrice;
    private ECollectionMethod collectionMethod;
    private String appointmentDate;
    private Integer numberOfParticipants;
    private EPaymentStatus paymentStatus;
    private Long serviceId;
    private String serviceTypeName;
    private List<ParticipantResponse> participants;
    private ESampleCollectionStatus sampleCollectionStatus;
    private LocalDateTime createdAt;
    private EBookingStatus status;
    private ECaseType caseType;
}