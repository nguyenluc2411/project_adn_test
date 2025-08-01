package com.genx.service.interfaces;

import com.genx.dto.request.BookingRequest;
import com.genx.dto.response.BookingResponse;
import com.genx.dto.response.BookingSummaryResponse;
import com.genx.entity.Booking;
import com.genx.entity.Payment;
import com.genx.entity.Booking;
import com.genx.enums.EBookingStatus;
import com.genx.enums.EPaymentStatus;
import com.genx.enums.ESampleCollectionStatus;
import com.genx.enums.EPaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface IBookingService {
    Page<BookingResponse> getAllBookings(Pageable pageable);

    Page<BookingSummaryResponse> searchBookingSummaries(EBookingStatus status, String code, EPaymentStatus paymentStatus, Pageable pageable);

    BookingResponse getBookingById(Long id);

    BookingResponse confirmBooking(Long id);

    Page<BookingResponse> searchBookings(EBookingStatus status, String code, EPaymentStatus paymentStatus, Pageable pageable);

    Booking getFullRegistrationById(Long id);

    Page<BookingResponse> getRegistrationsByStatus(EPaymentStatus status, Pageable pageable);

    List<BookingResponse> getAllApplicationsSentToLab();

    List<BookingResponse> getAllCompletedApplications();

    BookingResponse createRegistration(BookingRequest bookingRequest);

    BookingResponse updateRegistration(Long id, BookingRequest bookingRequest);

    BookingResponse cancelRegistration(Long id);

    Page<BookingResponse> getAllRegistrations(Pageable pageable);

    BookingResponse updatePaymentStatus(String orderId, EPaymentStatus status);

    Optional<Booking> getBookingByPayment(Payment payment);

    Page<BookingResponse> searchBySampleStatus(
            ESampleCollectionStatus status,
            String code,
            Pageable pageable
    );

}