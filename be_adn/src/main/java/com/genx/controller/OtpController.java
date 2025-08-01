package com.genx.controller;

import com.genx.dto.response.ApiResponse;
import com.genx.service.JwtService;
import com.genx.service.interfaces.IEmailService;
import com.genx.service.interfaces.IOTPService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/otp")
@RequiredArgsConstructor
@Slf4j
public class OtpController {

    @Autowired
    private  IOTPService otpService;

    @Autowired
    private  IEmailService emailService;

    @Autowired
    private JwtService jwtService;

    @GetMapping("/send")
    public ResponseEntity<ApiResponse<Void>> sendOtpToEmail(@RequestParam String email) {
        String otp = otpService.generateOtp(email);
        try {
            emailService.sendOtp(email, otp);
            return ResponseEntity.ok(ApiResponse.success("OTP sent to " + email, null));
        } catch (Exception e) {
            log.error("Failed to send OTP to {}", email, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(1002, "Failed to send OTP"));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<String>> verifyOtp(@RequestParam String email,
                                                         @RequestParam String otp) {
        boolean isValid = otpService.verifyOtp(email, otp);
        if (isValid) {
            String jwt = jwtService.generateAccessToken(email);
            return ResponseEntity.ok(ApiResponse.success("OTP verified", jwt));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(1003, "Invalid OTP"));
        }
    }

}
