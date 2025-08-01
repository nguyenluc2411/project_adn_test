package com.genx.controller;

import com.genx.dto.response.ApiResponse;
import com.genx.dto.response.PaymentResponse;
import com.genx.dto.response.BookingResponse;
import com.genx.entity.Payment;
import com.genx.entity.Booking;
import com.genx.enums.EPaymentStatus;
import com.genx.mapper.PaymentMapper;
import com.genx.service.VNPayService;
import com.genx.service.interfaces.IBookingService;
import com.genx.service.interfaces.IPaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@Slf4j
@RequestMapping("/api/vnpay")
public class PaymentController {
    @Autowired
    private VNPayService vnPayService;

    @Autowired
    private IPaymentService paymentService;

    @Autowired
    private PaymentMapper paymentMapper;

    @Autowired
    private IBookingService bookingService;

    @Value("${frontendUrl}")
    private String frontendRedirect;

    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(@RequestBody BookingResponse bookingResponse, HttpServletRequest request) {
        try {
            Booking booking = bookingService.getFullRegistrationById(bookingResponse.getId());

            if (booking.getPaymentStatus() == EPaymentStatus.CANCELLED) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Booking has been cancelled"));
            }

            String paymentUrl = vnPayService.createPaymentUrl(booking, request.getRemoteAddr());
            return ResponseEntity.ok(Map.of(
                    "paymentUrl", paymentUrl,
                    "registrationId", bookingResponse.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/vnpay-return")
    public void paymentReturn(@RequestParam Map<String, String> params, HttpServletResponse response) {
        System.out.println(" Đã vào callback");
        try {
            String orderId = params.get("vnp_TxnRef");

            PaymentResponse paymentResponse = vnPayService.validatePayment(params);

            if (paymentResponse != null && "00".equals(paymentResponse.getResponseCode())) {
                bookingService.updatePaymentStatus(orderId, EPaymentStatus.PAID);
            } else {
                bookingService.updatePaymentStatus(orderId, EPaymentStatus.FAILED);
            }

            String vnpTxnRef = params.get("vnp_TxnRef");
            boolean isSuccess = paymentResponse != null && "00".equals(paymentResponse.getResponseCode());
            String redirectUrl = frontendRedirect + "/payment-result"
                    + "?vnp_TxnRef=" + vnpTxnRef
                    + "&status=" + (isSuccess ? "success" : "fail");

            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            log.error("Error message", e);
            try {
                response.sendRedirect(frontendRedirect + "/payment-result?error=1");
            } catch (IOException ioException) {
                log.error("Error message", ioException);
            }
        }
    }



    @GetMapping("/payment-status/{orderId}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String orderId) {
        try {
            Payment payment = paymentService.getPaymentByOrderId(orderId);

            Booking booking = bookingService.getBookingByPayment(payment)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            PaymentResponse dto = paymentMapper.toDTO(payment);
            dto.setPaymentStatus(booking.getPaymentStatus().name());

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/payment-ipn")
    public ResponseEntity<String> handleIPN(@RequestParam Map<String, String> params) {
        PaymentResponse response = vnPayService.validatePayment(params);
        return response != null ? ResponseEntity.ok("OK") : ResponseEntity.badRequest().body("INVALID");
    }

    @PostMapping("/retry-payment/{bookingId}")
    public ResponseEntity<ApiResponse<?>> retryPayment(@PathVariable Long bookingId, HttpServletRequest request) {
        try {
            Booking booking = bookingService.getFullRegistrationById(bookingId);

            if (booking.getPaymentStatus() == EPaymentStatus.CANCELLED) {
                return ResponseEntity.badRequest().body(
                        ApiResponse.error(4001, "Đơn hàng đã bị huỷ, không thể thanh toán lại")
                );
            }

            String paymentUrl = vnPayService.createPaymentUrl(booking, request.getRemoteAddr());

            return ResponseEntity.ok(
                    ApiResponse.success("Tạo lại thanh toán thành công",
                            Map.of("paymentUrl", paymentUrl, "bookingId", bookingId))
            );
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(4002, e.getMessage()));
        } catch (Exception e) {
            log.error("Error message", e);
            return ResponseEntity.status(500).body(ApiResponse.error(5000, "Lỗi hệ thống khi tạo lại thanh toán"));
        }
    }


}