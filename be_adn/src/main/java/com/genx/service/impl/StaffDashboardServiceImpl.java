package com.genx.service.impl;

import com.genx.dto.response.BookingSummaryResponse;
import com.genx.mapper.BookingMapper;
import com.genx.repository.IBookingRepository;
import com.genx.repository.ICustomerRepository;
import com.genx.repository.IPaymentRepository;
import com.genx.service.interfaces.IStaffDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StaffDashboardServiceImpl implements IStaffDashboardService {

    @Autowired
    private IBookingRepository bookingRepository;

    @Autowired
    private ICustomerRepository customerRepository;

    @Autowired
    private IPaymentRepository paymentRepository;

    @Autowired
    private BookingMapper bookingMapper;

    @Override
    public Long getTotalRevenue() {
        return paymentRepository.sumSuccessfulPaymentAmount().orElse(0L);
    }

    @Override
    public Long getTotalBookings() {
        return bookingRepository.count();
    }

    @Override
    public Long getTotalCustomers() {
        return customerRepository.count();
    }

    @Override
    public List<BookingSummaryResponse> getLatestBookings() {
        return bookingRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(bookingMapper::toSummary)
                .toList();
    }
}
