package com.genx.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.genx.dto.request.ChangePasswordRequest;
import com.genx.dto.request.UpdateProfileRequest;
import com.genx.dto.request.UserRequestDto;
import com.genx.dto.response.UserProfileResponse;
import com.genx.dto.response.UserResponseDto;
import com.genx.entity.Customer;
import com.genx.entity.StaffInfo;
import com.genx.entity.User;
import com.genx.enums.EAuthProvider;
import com.genx.enums.ERole;
import com.genx.mapper.UserAccountMapper;
import com.genx.mapper.UserMapper;
import com.genx.repository.ICustomerRepository;
import com.genx.repository.IRoomRepository;
import com.genx.repository.IStaffInfoRepository;
import com.genx.repository.IUserRepository;
import com.genx.service.interfaces.IUploadImageFile;
import com.genx.service.interfaces.IUserService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional(rollbackOn = Exception.class)
public class UserServiceImpl implements IUserService {

    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private UserAccountMapper userAccountMapper;

    @Autowired
    private IStaffInfoRepository staffInfoRepository;

    @Autowired
    private ICustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private IUploadImageFile uploadImageFile;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private IRoomRepository roomRepository;


    @Override
    public UserResponseDto createStaff(UserRequestDto dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username already exists.");
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already exists.");
        }

        User staff = userMapper.toEntity(dto);
        staff.setPassword(passwordEncoder.encode(dto.getPassword()));
        staff.setEnabled(true);
        staff.setAccountNonLocked(true);
        if (staff.getAuthProvider() == null) {
            staff.setAuthProvider(EAuthProvider.SYSTEM);
        }

        User saved = userRepository.save(staff);

        StaffInfo info = new StaffInfo();
        info.setUser(saved);
        info.setAvatar(dto.getAvatar());
        info.setFingerprintImageUrl(dto.getFingerprintImageUrl());
        info.setStartDate(dto.getStartDate() != null ? dto.getStartDate() : LocalDateTime.now());

        staffInfoRepository.save(info);

        return userMapper.toDTO(saved);
    }

    @Override
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    @Override
    public User getStaffWithLeastRooms() {
        List<User> staffs = userRepository.findByRole(ERole.RECORDER_STAFF);
        return staffs.stream()
                .min(Comparator.comparingInt(staff -> roomRepository.countByStaffId(staff.getId())))
                .orElse(null);
    }

    @Override
    public UserResponseDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toDTO(user);
    }

    @Override
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDto updateUser(Long id, UserRequestDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userMapper.updateEntity(user, dto);
        User updated = userRepository.save(user);
        return userMapper.toDTO(updated);
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(false);
        user.setAccountNonLocked(false);
        userRepository.save(user);
    }

    @Override
    public UserResponseDto updateUserStatus(Long id, boolean enabled, boolean accountNonLocked) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(enabled);
        user.setAccountNonLocked(accountNonLocked);
        User updated = userRepository.save(user);
        return userMapper.toDTO(updated);
    }

    @Override
    public Page<UserResponseDto> getUsersByFilter(ERole role, Boolean enabled, Boolean accountNonLocked, Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);

        List<UserResponseDto> filtered = page.getContent().stream()
                .filter(u -> role == null || u.getRole() == role)
                .filter(u -> enabled == null || u.isEnabled() == enabled)
                .filter(u -> accountNonLocked == null || u.isAccountNonLocked() == accountNonLocked)
                .map(userMapper::toDTO)
                .toList();

        return new PageImpl<>(filtered, pageable, filtered.size());
    }


    @Override
    public UserProfileResponse getUserProfileByUsername(String username) {
        User user = userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        UserProfileResponse response = userAccountMapper.fromUser(user);

        if (user.getRole().name().contains("RECORDER_STAFF")) {
            StaffInfo staffInfo = staffInfoRepository.findByUserId(user.getId());
            if (staffInfo != null) {
                response.setAvatar(staffInfo.getAvatar());
                response.setStartDate(staffInfo.getStartDate());
            }
        }

        if (user.getRole().name().equals("CUSTOMER")) {
            Customer customer = customerRepository.findByUserId(user.getId());
            if (customer != null) {
                response.setAvatar(customer.getAvatar());
                response.setDob(customer.getDob());
                response.setAddress(customer.getAddress());
            }
        }

        return response;
    }



    @Override
    public UserProfileResponse updateUserProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        userRepository.save(user);

        if (user.getRole().name().contains("RECORDER_STAFF")) {
            StaffInfo staff = staffInfoRepository.findByUserId(user.getId());
            if (staff != null) {
                if (request.getAvatar() != null) {
                    staff.setAvatar(request.getAvatar());

                }
                if (request.getStartDate() != null) {
                    staff.setStartDate(request.getStartDate());
                }
                staffInfoRepository.save(staff);
            }
        }

        if (user.getRole().name().equals("CUSTOMER")) {
            Customer customer = customerRepository.findByUserId(user.getId());
            if (customer != null) {
                if (request.getAvatar() != null) {
                    customer.setAvatar(request.getAvatar());
                }
                if (request.getDob() != null) {
                    customer.setDob(request.getDob());
                }
                if (request.getAddress() != null) {
                    customer.setAddress(request.getAddress());
                }
                customerRepository.save(customer);
            }
        }

        return getUserProfileByUsername(username);
    }


    @Override
    public String uploadAvatar(String username, MultipartFile file) {
        User user = userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        try {
            String oldAvatarUrl = null;

            if (user.getRole().name().contains("RECORDER_STAFF")) {
                StaffInfo staff = staffInfoRepository.findByUserId(user.getId());
                if (staff != null) {
                    oldAvatarUrl = staff.getAvatar();
                }
            } else if (user.getRole().name().equals("CUSTOMER")) {
                Customer customer = customerRepository.findByUserId(user.getId());
                if (customer != null) {
                    oldAvatarUrl = customer.getAvatar();
                }
            }


            if (oldAvatarUrl != null && !oldAvatarUrl.isBlank()) {
                try {
                    String publicId = extractPublicIdFromUrl(oldAvatarUrl);
                    cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                } catch (Exception e) {
                    log.warn("Không thể xóa ảnh cũ: {}", e.getMessage());
                }
            }

            String uploadedUrl = uploadImageFile.uploadImageFile(file);


            if (user.getRole().name().contains("RECORDER_STAFF")) {
                StaffInfo staff = staffInfoRepository.findByUserId(user.getId());
                if (staff != null) {
                    staff.setAvatar(uploadedUrl);
                    staffInfoRepository.save(staff);
                }
            } else if (user.getRole().name().equals("CUSTOMER")) {
                Customer customer = customerRepository.findByUserId(user.getId());
                if (customer != null) {
                    customer.setAvatar(uploadedUrl);
                    customerRepository.save(customer);
                }
            }

            return uploadedUrl;

        } catch (IOException e) {
            throw new RuntimeException("Không thể upload ảnh đại diện", e);
        }
    }

    @Override
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Mật khẩu cũ không đúng");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private String extractPublicIdFromUrl(String url) {
        if (url == null || url.isBlank()) return null;

        int folderIndex = url.indexOf("avatars/");
        if (folderIndex == -1) return null;

        String noExtension = url.substring(0, url.lastIndexOf('.'));
        return noExtension.substring(folderIndex);
    }

}
