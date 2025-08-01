package com.genx.controller;

import com.genx.dto.request.UserRequestDto;
import com.genx.dto.response.UserResponseDto;
import com.genx.enums.ERole;
import com.genx.service.interfaces.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminUserController {

    private final IUserService userService;

    @PostMapping("/staff")
    public ResponseEntity<UserResponseDto> createStaff(@RequestBody UserRequestDto request) {
        if (request.getRole() != ERole.LAB_STAFF && request.getRole() != ERole.RECORDER_STAFF ) {
            return ResponseEntity.badRequest().build();
        }
        UserResponseDto response = userService.createStaff(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/staff/{id}")
    public ResponseEntity<UserResponseDto> updateStaff(@PathVariable Long id, @RequestBody UserRequestDto request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PutMapping("/status/{id}")
    public ResponseEntity<UserResponseDto> updateStatus(@PathVariable Long id,
                                                        @RequestParam boolean enabled,
                                                        @RequestParam boolean accountNonLocked) {
        return ResponseEntity.ok(userService.updateUserStatus(id, enabled, accountNonLocked));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/filter")
    public ResponseEntity<Page<UserResponseDto>> getUsersByFilter(
            @RequestParam(required = false) ERole role,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) Boolean accountNonLocked,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(userService.getUsersByFilter(role, enabled, accountNonLocked, pageable));
    }

    @GetMapping("/customers")
    public ResponseEntity<Page<UserResponseDto>> getAllCustomers(
            @RequestParam(required = false) Boolean accountNonLocked,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(userService.getUsersByFilter(ERole.CUSTOMER, enabled, accountNonLocked, pageable));
    }
}