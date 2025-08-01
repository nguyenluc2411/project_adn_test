package com.genx.config;

import com.genx.entity.StaffInfo;
import com.genx.enums.EAuthProvider;
import com.genx.entity.User;
import com.genx.enums.ERole;
import com.genx.repository.IUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Configuration
@Component
public class AdminAccountInitializer implements CommandLineRunner {

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminAccountInitializer(IUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        createAdminAccount();
        createStaffAccount("recordstaff", "recorder@example.com", "Recorder Staff", ERole.RECORDER_STAFF);
        createStaffAccount("labstaff", "lab@example.com", "Lab Staff", ERole.LAB_STAFF);
    }

    private void createAdminAccount() {
        String username = "admin";
        String email = "admin@example.com";

        if (!userRepository.existsByUsername(username)) {
            User admin = new User();
            admin.setUsername(username);
            admin.setEmail(email);
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(ERole.ADMIN);
            admin.setFullName("DNA-GenX");
            admin.setEnabled(true);
            admin.setAccountNonLocked(true);
            admin.setAuthProvider(EAuthProvider.SYSTEM);

            userRepository.save(admin);
            System.out.println("Admin account created.");
        } else {
            System.out.println("Admin already exists.");
        }
    }

    private void createStaffAccount(String username, String email, String fullName, ERole role) {
        if (!userRepository.existsByUsername(username)) {
            User staff = new User();
            staff.setUsername(username);
            staff.setEmail(email);
            staff.setPassword(passwordEncoder.encode("staff123"));
            staff.setRole(role);
            staff.setFullName(fullName);
            staff.setEnabled(true);
            staff.setAccountNonLocked(true);
            staff.setAuthProvider(EAuthProvider.SYSTEM);

            StaffInfo info = new StaffInfo();
            info.setUser(staff);
            info.setStartDate(LocalDateTime.now());
            staff.setStaffInfo(info);

            userRepository.save(staff);
            System.out.printf("%s account created: %s%n", role.name(), username);
        } else {
            System.out.printf("%s account already exists: %s%n", role.name(), username);
        }
    }
}
