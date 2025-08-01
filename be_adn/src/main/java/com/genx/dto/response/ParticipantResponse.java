package com.genx.dto.response;

import com.genx.enums.ESampleType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
public class ParticipantResponse {
    private Long id;
    private String fullName;
    private String gender;
    private String yearOfBirth;
    private String identityNumber;
    private String issueDate;
    private String issuePlace;
    private String relationship;
    private String kitCode;
    private String kitStatus;
    private String kitAssignedByName;
    private LocalDateTime kitAssignedAt;
    private String sampleStatus;
    private ESampleType sampleType;
    private String fingerprintImageUrl;
}