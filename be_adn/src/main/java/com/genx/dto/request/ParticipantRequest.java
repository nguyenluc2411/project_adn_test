package com.genx.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ParticipantRequest {

    private String fullName;
    private String gender;
    private String yearOfBirth;
    private String identityNumber;
    private String issueDate;
    private String issuePlace;
    private String relationship;
}