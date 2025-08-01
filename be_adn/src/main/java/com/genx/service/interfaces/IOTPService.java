package com.genx.service.interfaces;

public interface IOTPService {

    String generateOtp(String email);

    boolean verifyOtp(String email, String inputOtp);
}
