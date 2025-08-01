package com.genx.service;

import com.genx.config.JwtConfig;
import com.genx.entity.RefreshToken;
import com.genx.entity.User;
import com.genx.repository.IRefreshTokenRepository;
import com.genx.repository.IUserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

@Service
@Transactional(rollbackOn = Exception.class)
public class JwtService {

    @Autowired
    private JwtConfig jwtConfig;

    @Autowired
    private IRefreshTokenRepository refreshTokenRepository;

    @Autowired
    private IUserRepository userRepository;


    public String generateToken(String username, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getExpiration());

        SecretKey key = Keys.hmacShaKeyFor(jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public void  validateToken(String token) {

            SecretKey key = Keys.hmacShaKeyFor(jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8));
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
    }

    public String getUsernameFromToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8));
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }


    public String generateRefreshToken(String username, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getRefreshExpiration());

        SecretKey key = Keys.hmacShaKeyFor(jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8));
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }


    public boolean isRefreshTokenExpired(String token) {
        try {
            Date expiry = parseToken(token).getExpiration();
            return expiry.before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    public RefreshToken createRefreshToken(User user) {
        if (user == null || user.getUsername() == null || user.getRole() == null) {
            throw new IllegalArgumentException("Invalid user data");
        }

        String tokenStr = generateRefreshToken(user.getUsername(), user.getRole().name());

        RefreshToken token = refreshTokenRepository.findByUser(user)
            .orElse(new RefreshToken());

        token.setUser(user);
        token.setRefreshToken(tokenStr);
        token.setExpiryDate(Instant.now().plusSeconds(jwtConfig.getRefreshExpiration() / 1000));

        return refreshTokenRepository.save(token);
    }

    public String generateAccessToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + email));

        return generateToken(user.getUsername(), user.getRole().name());
    }

}