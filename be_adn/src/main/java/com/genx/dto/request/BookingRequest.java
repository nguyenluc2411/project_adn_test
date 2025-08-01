package com.genx.dto.request;

import com.genx.dto.response.ParticipantResponse;
import com.genx.enums.EPaymentStatus;
import com.genx.enums.ECollectionMethod;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class BookingRequest {

    private String fullName;
    private String phoneNumber;
    private String address;
    private String email;
    private ECollectionMethod collectionMethod;
    private String appointmentDate;
    private Integer numberOfParticipants;
    private EPaymentStatus paymentStatus;
    private Long serviceId;
    private List<ParticipantResponse> participants;
    private LocalDateTime createdAt;

}