package com.genx.service.impl;

import com.genx.config.GoogleAuthConfig;
import com.genx.config.JwtConfig;
import com.genx.dto.request.GoogleUserRequest;
import com.genx.dto.request.LoginRequest;
import com.genx.dto.request.UserCreationRequest;
import com.genx.dto.response.LoginResponse;
import com.genx.entity.Customer;
import com.genx.entity.RefreshToken;
import com.genx.entity.User;
import com.genx.enums.EAuthProvider;
import com.genx.enums.ERole;
import com.genx.exception.CustomException;
import com.genx.mapper.UserMapper;
import com.genx.repository.IAuthRepository;
import com.genx.repository.ICustomerRepository;
import com.genx.repository.IRefreshTokenRepository;
import com.genx.security.CustomUserDetails;
import com.genx.service.JwtService;
import com.genx.service.interfaces.IAuthService;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import io.jsonwebtoken.Claims;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Transactional(rollbackOn = Exception.class)
public class AuthServiceImpl implements IAuthService {

    @Autowired
    private IAuthRepository userRepository;

    @Autowired
    private IRefreshTokenRepository refreshTokenRepository;

    @Autowired
    private JwtService jwtService;


    @Autowired
    private ICustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private GoogleAuthConfig googleAuthConfig;

    @Autowired
    private UserMapper userMapper;

    @Override
    public String registerUser(UserCreationRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }


        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);
        Customer customer = new Customer();
        customer.setUser(user);
        customerRepository.save(customer);

        return "User registered successfully";
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameOrEmail(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        if (!user.isEnabled() || !user.isAccountNonLocked())
            throw new RuntimeException("Tài khoản bị vô hiệu hóa hoặc bị khóa");

        return buildLoginResponse(user);
    }


    @Override
    public LoginResponse loginWithGoogle(String code) {
        try {
            GoogleTokenResponse tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance(),
                    "https://oauth2.googleapis.com/token",
                    googleAuthConfig.getClientId(),
                    googleAuthConfig.getClientSecret(),
                    code,
                    googleAuthConfig.getRedirectUri()
            ).execute();

            GoogleIdToken idToken = tokenResponse.parseIdToken();
            if (idToken == null) throw new RuntimeException("ID Token không hợp lệ");

            String email = idToken.getPayload().getEmail();

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setUsername(email.split("@")[0]);
                newUser.setRole(ERole.CUSTOMER);
                newUser.setPassword(null);
                newUser.setAuthProvider(EAuthProvider.GOOGLE);
                newUser.setEnabled(true);
                newUser.setAccountNonLocked(true);
                User savedUser = userRepository.save(newUser);

                Customer customer = new Customer();
                customer.setUser(savedUser);
                customerRepository.save(customer);

                return savedUser;
            });

            if (!user.isEnabled() || !user.isAccountNonLocked())
                throw new RuntimeException("Tài khoản bị vô hiệu hóa hoặc khóa");

            if (user.getAuthProvider() != EAuthProvider.GOOGLE)
                throw new RuntimeException("Vui lòng đăng nhập bằng " + user.getAuthProvider());

            return buildLoginResponse(user);

        } catch (Exception e) {
            throw new RuntimeException("Google login failed", e);
        }
    }

    private LoginResponse buildLoginResponse(User user) {
        String accessToken = jwtService.generateToken(user.getUsername(), user.getRole().name());
        RefreshToken refreshToken = jwtService.createRefreshToken(user);

        Customer customer = customerRepository.findByUser(user).orElse(null);
        String avatar = customer != null ? customer.getAvatar() : null;

        return LoginResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .accessToken(accessToken)
                .refreshToken(refreshToken.getRefreshToken())
                .email(user.getEmail())
                .role(user.getRole().name())
                .avatar(avatar)
                .build();
    }
    public void completeGoogleRegister(GoogleUserRequest request) {
        Optional<User> optional = userRepository.findByEmail(request.getEmail());
        if (optional.isEmpty()) {
            throw new CustomException("Không tìm thấy tài khoản Google này", 400);
        }

        User user = optional.get();

        if (user.getPhoneNumber() != null) {
            throw new CustomException("Tài khoản đã được hoàn tất trước đó", 400);
        }

        user.setPhoneNumber(request.getPhoneNumber());
        user.setFullName(request.getFullName());

        userRepository.save(user);
    }




    @Override
    public LoginResponse refreshAccessToken(String refreshToken) {
        RefreshToken token = refreshTokenRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new CustomException("Refresh token không hợp lệ", 401));

        if (jwtService.isRefreshTokenExpired(refreshToken))
            throw new CustomException("Refresh token đã hết hạn", 401);

        User user = token.getUser();

        if (!user.isEnabled() || !user.isAccountNonLocked())
            throw new CustomException("Tài khoản bị vô hiệu hóa hoặc khóa", 403);

        return buildLoginResponse(user);
    }



    @Override
    public void logout(String refreshTokenFromCookie) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            Long userId = userDetails.getUser().getId();
            int deleted = refreshTokenRepository.deleteByUserId(userId);
            SecurityContextHolder.clearContext();

            if (deleted == 0) {
                throw new CustomException("Không tìm thấy token để xóa", 400);
            }

            return;
        }

        if (refreshTokenFromCookie != null && !refreshTokenFromCookie.isBlank()) {
            Claims claims;
            try {
                claims = jwtService.parseToken(refreshTokenFromCookie);
            } catch (Exception e) {
                throw new CustomException("Refresh token không hợp lệ", 400);
            }

            String subject = claims.getSubject();
            User user = userRepository.findByUsernameOrEmail(subject)
                    .orElseThrow(() -> new CustomException("User không tồn tại", 404));

            int deleted = refreshTokenRepository.deleteByUser(user);

            if (deleted == 0) {
                throw new CustomException("Refresh token đã bị thu hồi hoặc không tồn tại", 400);
            }

            return;
        }
        throw new CustomException("Không thể xác định người dùng để logout", 400);
    }

}



