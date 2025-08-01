package com.genx.service.impl;

import com.genx.dto.request.BookingRequest;
import com.genx.dto.response.BookingResponse;
import com.genx.dto.response.BookingSummaryResponse;
import com.genx.entity.*;
import com.genx.enums.*;
import com.genx.mapper.BookingMapper;
import com.genx.repository.*;
import com.genx.security.SecurityUtil;
import com.genx.service.interfaces.IBookingService;
import com.genx.service.interfaces.INotificationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements IBookingService {

    @Autowired
    private IBookingRepository bookingRepository;

    @Autowired
    private IStaffInfoRepository staffInfoRepository;

    @Autowired
    private BookingMapper bookingMapper;

    @Autowired
    private ISampleCollectionRepository sampleCollectionRepository;

    @Autowired
    private IServiceRepository serviceRepository;

    @Autowired
    private ICustomerRepository customerRepository;

    @Autowired
    private IPaymentRepository paymentRepository;

    @Autowired
    private INotificationService notificationService;

    @Autowired
    private IUserRepository userRepository;

    @Override
    public Page<BookingResponse> getAllBookings(Pageable pageable) {
        return bookingRepository.findAll(pageable)
                .map(bookingMapper::toResponse);
    }

    @Override
    public Page<BookingSummaryResponse> searchBookingSummaries(EBookingStatus status, String code, EPaymentStatus paymentStatus, Pageable pageable) {
        return bookingRepository.searchByStatusAndCode(status, code, paymentStatus, pageable)
                .map(bookingMapper::toSummary);
    }

    @Override
    public BookingResponse getBookingById(Long id) {
        return bookingRepository.findById(id)
                .map(bookingMapper::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with id: " + id));
    }

    @Override
    public Page<BookingResponse> searchBookings(EBookingStatus status, String code, EPaymentStatus paymentStatus, Pageable pageable) {
        return bookingRepository.searchByStatusAndCode(status, code, paymentStatus, pageable)
                .map(bookingMapper::toResponse);
    }

    @Override
    @Transactional
    public BookingResponse confirmBooking(Long id) {
        Long currentUser = SecurityUtil.getCurrentUserId()
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng hiện tại"));

        StaffInfo staffInfo = staffInfoRepository.findByUserId(currentUser);
        if (staffInfo == null) {
            throw new IllegalArgumentException("Không tìm thấy thông tin nhân viên");
        }

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with id: " + id));

        if (booking.getStatus() != EBookingStatus.PENDING) {
            throw new IllegalStateException("Chỉ có thể xác nhận đơn đang ở trạng thái PENDING");
        }
        if (booking.getPayment() == null || !booking.getPaymentStatus().equals(EPaymentStatus.PAID)) {
            throw new IllegalStateException("Không thể xác nhận đơn chưa thanh toán");
        }

        booking.setStatus(EBookingStatus.CONFIRMED);
        booking.setRecordStaff(staffInfo);
        for (Participant p : booking.getParticipants()) {
            p.setSampleStatus(EParticipantSampleStatus.PENDING);
        }

        if (sampleCollectionRepository.findByBooking_Id(booking.getId()).isEmpty()) {
            SampleCollection sc = new SampleCollection();
            sc.setBooking(booking);
            sc.setStatus(ESampleCollectionStatus.COLLECTING);
            sc.setCollectedAt(LocalDateTime.now());
            sampleCollectionRepository.save(sc);
        }

        User customerUser = booking.getCustomer().getUser();
        notifyCustomerBookingConfirmed(customerUser, booking);

        notificationService.markOtherNotificationsAsHandled(booking, staffInfo.getUser());

        return bookingMapper.toResponse(bookingRepository.save(booking));
    }



    @Override
    public Booking getFullRegistrationById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found with id: " + id));
    }

    @Override
    public Page<BookingResponse> getRegistrationsByStatus(EPaymentStatus status, Pageable pageable) {
        Long customerId = SecurityUtil.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user đang đăng nhập"));

        return bookingRepository.findByCustomerIdAndPaymentStatus(customerId, status, pageable)
                .map(bookingMapper::toDTO);
    }

    @Override
    public List<BookingResponse> getAllApplicationsSentToLab() {
        return bookingRepository.findBySampleCollectionStatus(ESampleCollectionStatus.SENT_TO_LAB)
                .stream()
                .map(bookingMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getAllCompletedApplications() {
        return bookingRepository.findBySampleCollectionStatus(ESampleCollectionStatus.COMPLETED)
                .stream()
                .map(bookingMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponse createRegistration(BookingRequest bookingRequest) {
        try {
            Integer numParticipants = bookingRequest.getNumberOfParticipants();
            if (numParticipants == null || numParticipants < 1) {
                throw new IllegalArgumentException("Number of participants must be greater than 0");
            }

            com.genx.entity.Service service = serviceRepository.findById(bookingRequest.getServiceId())
                    .orElseThrow(() -> new EntityNotFoundException("Service not found with id: " + bookingRequest.getServiceId()));

            Booking booking = bookingMapper.toEntity(bookingRequest);
            booking.setService(service);
            booking.setPaymentStatus(EPaymentStatus.UNPAID);
            booking.setStatus(EBookingStatus.PENDING);

            User user = SecurityUtil.getCurrentUser()
                    .orElseThrow(() -> new RuntimeException("Không có người dùng đăng nhập"));
            Customer customer = customerRepository.findById(user.getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy customer từ user"));
            booking.setCustomer(customer);

            if (booking.getParticipants() != null) {
                booking.getParticipants().forEach(p -> p.setBooking(booking));
            }

            Booking savedBooking = bookingRepository.save(booking);

            Payment payment = new Payment();
            payment.setAmount(service.getPrice().intValue() * savedBooking.getNumberOfParticipants());
            payment.setBooking(savedBooking);
            Payment savedPayment = paymentRepository.save(payment);

            savedBooking.setPayment(savedPayment);
            bookingRepository.save(savedBooking);

            return bookingMapper.toDTO(savedBooking);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create registration: " + e.getMessage(), e);
        }
    }


    @Override
    @Transactional
    public BookingResponse updatePaymentStatus(String orderId, EPaymentStatus status) {
        Booking booking = bookingRepository.findByPaymentOrderId(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found with id: " + orderId));

        booking.setPaymentStatus(status);
        Booking updatedBooking = bookingRepository.save(booking);
        return bookingMapper.toDTO(updatedBooking);
    }

    @Override
    @Transactional
    public BookingResponse updateRegistration(Long id, BookingRequest bookingRequest) {
        Booking existingBooking = bookingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found with id: " + id));

        if (existingBooking.getPaymentStatus() == EPaymentStatus.PAID) {
            throw new IllegalStateException("Cannot update paid booking");
        }

        com.genx.entity.Service service = serviceRepository.findById(bookingRequest.getServiceId())
                .orElseThrow(() -> new EntityNotFoundException("Service not found with id: " + bookingRequest.getServiceId()));

        Booking booking = bookingMapper.toEntity(bookingRequest);
        booking.setId(id);
        booking.setService(service);
        booking.setPayment(existingBooking.getPayment());
        booking.setPaymentStatus(existingBooking.getPaymentStatus());
        Booking updatedBooking = bookingRepository.save(booking);
        return bookingMapper.toDTO(updatedBooking);
    }

    @Override
    public BookingResponse cancelRegistration(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        booking.setPaymentStatus(EPaymentStatus.CANCELLED);
        booking.setStatus(EBookingStatus.CANCELED);

        try {
            Booking saved = bookingRepository.save(booking);

            if (booking.getRecordStaff() != null && booking.getRecordStaff().getUser() != null) {
                User staffUser = booking.getRecordStaff().getUser();
                String message = String.format("Đơn đăng ký #%s của khách hàng đã bị hủy. ", booking.getCode());
                notificationService.sendNotification(
                        staffUser,
                        "Đơn đã bị hủy",
                        message,
                        booking
                );
            }

            return bookingMapper.toDTO(saved);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("Cannot cancel this booking. Invalid status transition.");
        }
    }

    @Override
    public Page<BookingResponse> getAllRegistrations(Pageable pageable) {
        Long customerId = SecurityUtil.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user đang đăng nhập"));

        return bookingRepository.findByCustomerId(customerId, pageable)
                .map(bookingMapper::toDTO);
    }

    @Override
    public Optional<Booking> getBookingByPayment(Payment payment) {
        return bookingRepository.findByPayment(payment);
    }

    @Override
    public Page<BookingResponse> searchBySampleStatus(ESampleCollectionStatus status, String code, Pageable pageable) {
        return bookingRepository
                .searchBySampleCollectionStatusAndCodeLike(status, code, pageable)
                .map(bookingMapper::toDTO);
    }

    private void notifyCustomerBookingConfirmed(User customerUser, Booking booking) {
        String message = String.format("Đơn đăng ký #%s của bạn đã được xác nhận. ", booking.getCode());
        notificationService.sendNotification(customerUser, "Đơn đã được xác nhận", message, booking);
    }
}