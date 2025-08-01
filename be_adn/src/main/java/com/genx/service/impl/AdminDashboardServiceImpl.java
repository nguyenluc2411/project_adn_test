package com.genx.service.impl;

import com.genx.dto.AdminDashboardDto;
import com.genx.enums.ERole;
import com.genx.enums.EPaymentStatus;
import com.genx.mapper.BookingMapper;
import com.genx.repository.*;
import com.genx.service.interfaces.IAdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements IAdminDashboardService {

    private final IUserRepository userRepository;
    private final IServiceRepository serviceRepository;
    private final BlogRepository blogRepository;
    private final IPaymentRepository paymentRepository;
    private final IBookingRepository bookingRepository;
    private final BookingMapper bookingMapper;

    @Override
    public AdminDashboardDto getDashboardData() {
        long totalUsers = userRepository.count();
        long totalStaff = userRepository.countByRoleIn(List.of(ERole.LAB_STAFF, ERole.RECORDER_STAFF));
        long totalCustomers = userRepository.countByRole(ERole.CUSTOMER);
        long totalServices = serviceRepository.countByEnabled(true);
        long totalBlogs = blogRepository.count();
        long totalPayments = bookingRepository.countByPaymentStatus(EPaymentStatus.PAID);
        long totalRevenue = paymentRepository.sumSuccessfulPaymentAmount().orElse(0L);

        return new AdminDashboardDto(
                totalUsers,
                totalStaff,
                totalCustomers,
                totalServices,
                totalBlogs,
                totalPayments,
                totalRevenue
        );
    }

    @Override
    public Long getRevenueByExacDate(Integer day, Integer month, Integer year) {
        EPaymentStatus status = EPaymentStatus.PAID;
        if (day == null && month == null && year == null) {
            LocalDate today = LocalDate.now();
            return bookingRepository.sumRevenueByExactDate(
                    status,
                    today.getDayOfMonth(),
                    today.getMonthValue(),
                    today.getYear()
            ).orElse(0L);
        }

        if (day != null && month != null && year != null) {
            return bookingRepository.sumRevenueByExactDate(status, day, month, year).orElse(0L);
        }


        if (day == null && month != null && year != null) {
            return bookingRepository.sumRevenueByMonthAndYear(status, month, year).orElse(0L);
        }

        if (day == null && month == null) {
            return bookingRepository.sumRevenueByYear(status, year).orElse(0L);
        }

        return 0L;
    }
}
