package com.genx.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class UpdateProfileRequest {
    private String fullName;
    private String phoneNumber;
    private String gender;
    private String avatar;
    private LocalDate dob;
    private String address;
    private LocalDateTime startDate;
}
