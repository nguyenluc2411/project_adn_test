package com.genx.controller;

import com.genx.dto.response.ApiResponse;
import com.genx.service.interfaces.IEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/emails")
@RequiredArgsConstructor
@Slf4j
public class EmailController {


    @Autowired
    private IEmailService emailService ;


    @PostMapping("/send")
    public ResponseEntity<ApiResponse<Void>> sendEmail(@RequestParam String to,
                                                       @RequestParam String subject,
                                                       @RequestParam String message) {
        try {
            emailService.sendNotification(to, subject, message);
            return ResponseEntity.ok(ApiResponse.success("Email sent successfully", null));
        } catch (Exception e) {
            log.error(message, e);
            return ResponseEntity
                    .internalServerError()
                    .body(ApiResponse.error(1001, "Failed to send email"));
        }
    }

    @PostMapping(value = "/send-with-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> sendEmailWithFile(@RequestParam String to,
                                                               @RequestParam String subject,
                                                               @RequestParam String message,
                                                               @RequestPart MultipartFile file) {
        try {
            emailService.sendEmailWithAttachment(to, subject, message, file);
            return ResponseEntity.ok(ApiResponse.success("Email with file sent successfully", null));
        } catch (Exception e) {
            log.error(message, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(1001, "Failed to send email with attachment"));
        }
    }

}
