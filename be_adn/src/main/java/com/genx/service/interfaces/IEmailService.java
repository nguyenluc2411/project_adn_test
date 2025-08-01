package com.genx.service.interfaces;

import org.springframework.web.multipart.MultipartFile;

public interface IEmailService {

    void sendOtp(String to, String otp);

    void sendNotification(String to, String subject, String message);

    void sendEmailWithAttachment(String to, String subject, String message, MultipartFile file) throws Exception;

}
