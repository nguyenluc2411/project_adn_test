package com.genx.service.interfaces;

import com.genx.dto.request.ChangePasswordRequest;
import com.genx.dto.request.UpdateProfileRequest;
import com.genx.dto.request.UserRequestDto;
import com.genx.dto.response.UserProfileResponse;
import com.genx.dto.response.UserResponseDto;
import com.genx.entity.User;
import com.genx.enums.ERole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IUserService {

    UserProfileResponse getUserProfileByUsername(String username);

    UserProfileResponse updateUserProfile(String username, UpdateProfileRequest request);

    String uploadAvatar(String username, MultipartFile file);

    void changePassword(String username, ChangePasswordRequest request);

    UserResponseDto createStaff(UserRequestDto dto);
    UserResponseDto getUserById(Long id);
    List<UserResponseDto> getAllUsers();
    UserResponseDto updateUser(Long id, UserRequestDto dto);
    void deleteUser(Long id);
    UserResponseDto updateUserStatus(Long id, boolean enabled, boolean accountNonLocked);
    Page<UserResponseDto> getUsersByFilter(ERole role, Boolean enabled, Boolean accountNonLocked, Pageable pageable);
    User getUserByUsername(String username);
    User getStaffWithLeastRooms();
}
