package com.genx.dto.request;

import com.genx.enums.EAuthProvider;
import com.genx.enums.ERole;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequestDto {

    private String fullName;
    private String gender;
    private String phoneNumber;
    private String email;
    private String username;
    private String password;
    private ERole role;
    private String avatar;
    private String fingerprintImageUrl;
    private LocalDateTime startDate;


}