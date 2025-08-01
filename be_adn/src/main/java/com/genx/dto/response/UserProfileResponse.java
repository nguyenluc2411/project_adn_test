package com.genx.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class UserProfileResponse {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String gender;
    private String avatar;
    private String role;
    private String address;
    private LocalDate dob;
    private LocalDateTime startDate;
}
