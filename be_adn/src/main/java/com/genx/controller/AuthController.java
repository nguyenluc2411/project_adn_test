package com.genx.controller;

import com.genx.dto.request.GoogleLoginRequest;
import com.genx.dto.request.GoogleUserRequest;
import com.genx.dto.request.LoginRequest;
import com.genx.dto.request.UserCreationRequest;
import com.genx.dto.response.ApiResponse;
import com.genx.dto.response.LoginResponse;
import com.genx.service.impl.AuthServiceImpl;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthServiceImpl authService;

    @Value("${jwt.refresh-expiration}")
    private int refreshTokenExpiration;

    @Value("${cookie.secure}")
    private boolean secureCookie;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid UserCreationRequest request) {
        return ResponseEntity.ok(authService.registerUser(request));
    }


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(request);

        Cookie refreshCookie = new Cookie("refreshToken", loginResponse.getRefreshToken());
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(secureCookie);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(refreshTokenExpiration / 1000); // 7 ngày

        response.addCookie(refreshCookie);

        return ResponseEntity.ok(loginResponse);
    }


    @GetMapping("/callback")
    public ResponseEntity<Void> googleCallback(@RequestParam("code") String code,
                                               HttpServletResponse httpResponse) throws IOException, IOException {
        LoginResponse response = authService.loginWithGoogle(code);

        Cookie refreshCookie = new Cookie("refreshToken", response.getRefreshToken());
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(secureCookie);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(refreshTokenExpiration / 1000);

        httpResponse.addCookie(refreshCookie);
        String redirectUrl = "http://localhost:3000/oauth2/success?access_token=" + response.getAccessToken();
        httpResponse.sendRedirect(redirectUrl);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/login-google")
    public ResponseEntity<LoginResponse> googleLogin(@RequestBody GoogleLoginRequest request, HttpServletResponse response) {
        LoginResponse loginResponse = authService.loginWithGoogle(request.getCode());

        Cookie refreshCookie = new Cookie("refreshToken", loginResponse.getRefreshToken());
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(secureCookie);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(refreshTokenExpiration);

        response.addCookie(refreshCookie);
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/google-register")
    public ResponseEntity<ApiResponse<Boolean>> completeGoogleRegister(
            @RequestBody @Valid GoogleUserRequest request
    ) {
        authService.completeGoogleRegister(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<Boolean>builder()
                        .code(1000)
                        .message("Đăng ký thành công. Vui lòng đăng nhập lại.")
                        .result(true)
                        .build());
    }


    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@CookieValue("refreshToken") String refreshToken, HttpServletResponse response) {
        LoginResponse loginResponse = authService.refreshAccessToken(refreshToken);

        Cookie refreshCookie = new Cookie("refreshToken", loginResponse.getRefreshToken());
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(secureCookie);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(refreshTokenExpiration / 1000);

        response.addCookie(refreshCookie);

        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Boolean>> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken
    ) {

        authService.logout(refreshToken);


        ResponseCookie clearedCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(secureCookie)
                .path("/")
                .maxAge(0)
                .build();


        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearedCookie.toString())
                .body(ApiResponse.<Boolean>builder()
                        .code(1000)
                        .message("Đăng xuất thành công")
                        .result(true)
                        .build());
    }
}