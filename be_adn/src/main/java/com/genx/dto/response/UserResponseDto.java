package com.genx.dto.response;

import com.genx.enums.ERole;
import com.genx.enums.EAuthProvider;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {
    private long id;
    private String fullName;
    private String gender;
    private String phoneNumber;
    private String email;
    private String username;
    private ERole role;
    private boolean enabled;
    private boolean accountNonLocked;
    private String avatar;
    private String fingerprintImageUrl;
    private LocalDateTime startDate;

}