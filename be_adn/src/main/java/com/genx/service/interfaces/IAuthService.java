package com.genx.service.interfaces;


import com.genx.dto.request.LoginRequest;
import com.genx.dto.request.UserCreationRequest;
import com.genx.dto.response.LoginResponse;

public interface IAuthService {

    String registerUser(UserCreationRequest request);

    LoginResponse login(LoginRequest request);

    LoginResponse loginWithGoogle(String code);

    LoginResponse refreshAccessToken(String refreshToken);

    void logout(String refreshTokenFromCookie);
}
