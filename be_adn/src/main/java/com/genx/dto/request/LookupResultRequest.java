package com.genx.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LookupResultRequest {

    @NotBlank(message = "Mã tra cứu không được để trống")
    private String trackingCode;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String trackingPassword;
}
