package com.genx.controller;

import com.genx.dto.request.ChangePasswordRequest;
import com.genx.dto.request.UpdateProfileRequest;
import com.genx.dto.response.ApiResponse;
import com.genx.dto.response.UserProfileResponse;
import com.genx.service.interfaces.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/account")
public class UserAccountController {

    @Autowired
    private IUserService userService;

    @GetMapping("/profile")
    public UserProfileResponse getMyProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserProfileByUsername(username);
    }

    @PutMapping("/profile")
    public UserProfileResponse updateMyProfile(@RequestBody UpdateProfileRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.updateUserProfile(username, request);
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String avatarUrl = userService.uploadAvatar(username, file);
        return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'RECORDER_STAFF', 'ADMIN')")
    @PutMapping("/password")
    public ApiResponse<String> changePassword(@RequestBody ChangePasswordRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        userService.changePassword(username, request);
        return ApiResponse.<String>builder()
                .message("Đổi mật khẩu thành công")
                .result("OK")
                .build();
    }
}
