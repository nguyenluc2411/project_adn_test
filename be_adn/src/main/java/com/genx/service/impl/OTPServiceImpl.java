package com.genx.service.impl;

import com.genx.service.interfaces.IOTPService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class OTPServiceImpl implements IOTPService {

    private final StringRedisTemplate redisTemplate;
    private static final long EXPIRE_MINUTES = 1;

    @Override
    public String generateOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(1000000));
        String key = buildOtpKey(email);
        redisTemplate.opsForValue().set(key, otp, EXPIRE_MINUTES, TimeUnit.MINUTES);
        return otp;
    }

    @Override
    public boolean verifyOtp(String email, String inputOtp) {
        String key = buildOtpKey(email);
        String storedOtp = redisTemplate.opsForValue().get(key);

        if (storedOtp != null && storedOtp.equals(inputOtp)) {
            redisTemplate.delete(key);
            return true;
        }
        return false;
    }

    private String buildOtpKey(String email) {
        return "otp:" + email;
    }
}
