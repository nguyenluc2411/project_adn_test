package com.genx.dto.request;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleUserRequest{
    @Email(message = "Email phải hợp lệ")
    private String email;

    @Column(columnDefinition = "VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
            regexp = "^(03[2-9]|08[1-9]|09[0|1|3|4|6|7|8|9]|07[0|6|7|8|9]|086)\\d{7}$",
            message = "Số điện thoại không hợp lệ"
    )
    private String phoneNumber;

}
