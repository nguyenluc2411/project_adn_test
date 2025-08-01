package com.genx.service;

import com.genx.config.VNPayConfig;
import com.genx.dto.response.PaymentResponse;
import com.genx.entity.Booking;
import com.genx.entity.Payment;
import com.genx.entity.User;
import com.genx.enums.EPaymentStatus;
import com.genx.enums.ERole;
import com.genx.mapper.PaymentMapper;
import com.genx.repository.IPaymentRepository;
import com.genx.repository.IBookingRepository;
import com.genx.repository.IUserRepository;
import com.genx.service.interfaces.INotificationService;
import jakarta.persistence.EntityNotFoundException;
import org.apache.commons.codec.digest.HmacAlgorithms;
import org.apache.commons.codec.digest.HmacUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class VNPayService {
    private final VNPayConfig vnPayConfig;
    private final IBookingRepository IBookingRepository;
    private final IPaymentRepository IPaymentRepository;
    private final PaymentMapper paymentMapper;

    @Autowired
    private IPaymentRepository paymentRepository;

    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private INotificationService notificationService;

    @Autowired
    public VNPayService(VNPayConfig vnPayConfig,
                        IBookingRepository IBookingRepository,
                        IPaymentRepository IPaymentRepository,
                        PaymentMapper paymentMapper) {
        this.vnPayConfig = vnPayConfig;
        this.IBookingRepository = IBookingRepository;
        this.IPaymentRepository = IPaymentRepository;
        this.paymentMapper = paymentMapper;
    }

    private void notifyRecorderStaffs(Booking booking) {
        List<User> staffs = userRepository.findAllByRole(ERole.RECORDER_STAFF);

        String customerName = booking.getCustomer().getUser().getFullName();
        String message = "Khách hàng " + customerName + " vừa thanh toán thành công đơn #" + booking.getCode();

        notificationService.sendBulkNotification(staffs, "Đơn đăng ký đã thanh toán", message, booking);
    }

    @Transactional
    public String createPaymentUrl(Booking booking, String ip) {
        try {
            if (booking == null) {
                throw new IllegalArgumentException("Booking cannot be null");
            }
            if (booking.getId() == null) {
                booking = IBookingRepository.save(booking);
            }

            Payment payment = booking.getPayment();
            EPaymentStatus status = booking.getPaymentStatus();

            if (payment != null && (status == EPaymentStatus.PAID || "00".equals(payment.getResponseCode()))) {
                throw new IllegalStateException("Đơn hàng đã được thanh toán thành công");
            }

            String txnRef = booking.getId() + "_" + System.currentTimeMillis();
            long amount = calculateAmount(booking);

            if (payment == null) {
                payment = new Payment();
                payment.setBooking(booking);
            }

            payment.setAmount((int)(amount/100));
            payment.setPayDate(LocalDateTime.now());
            payment.setOrderId(txnRef);
            payment.setBooking(booking);

            payment = IPaymentRepository.save(payment);
            booking.setPayment(payment);
            IBookingRepository.save(booking);

            Map<String, String> vnp_Params = buildVNPayParams(booking, amount, ip, txnRef);
            return buildPaymentUrl(vnp_Params);
        } catch (Exception e) {
            System.err.println("Error creating payment URL: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create payment URL: " + e.getMessage(), e);
        }
    }

    private long calculateAmount(Booking booking) {
        if (booking == null) {
            throw new IllegalArgumentException("Booking cannot be null");
        }
        Integer participants = booking.getNumberOfParticipants();
        if (participants == null || participants < 2) {
            throw new IllegalArgumentException("Number of participants must be greater than 2");
        }

        Double basePrice = booking.getService().getPrice();
        if (basePrice == null || basePrice <= 0) {
            throw new IllegalArgumentException("Service price must be greater than 0");
        }

        double total = basePrice;
        if (participants > 1) {
            total += basePrice * 0.9 * (participants - 1);
        }

        return Math.round(total * 100);
    }

    private Map<String, String> buildVNPayParams(Booking booking, long amount, String ip, String txnRef) {
        String createDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_BankCode", "");
        vnp_Params.put("vnp_CreateDate", createDate);
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_IpAddr", ip);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don xet nghiem:" + txnRef);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_TxnRef", txnRef);

        return new TreeMap<>(vnp_Params);
    }

    private String buildPaymentUrl(Map<String, String> vnp_Params) {
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));

                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));

                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = vnPayConfig.getPayUrl() + "?" + query;
        String vnp_SecureHash = HmacUtils.hmacSha512Hex(vnPayConfig.getHashSecret(), hashData.toString());
        return queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;
    }

    @Transactional
    public PaymentResponse validatePayment(Map<String, String> params) {
        try {
            String vnp_SecureHash = params.get("vnp_SecureHash");
            String vnp_TxnRef = params.get("vnp_TxnRef");

            if (vnp_SecureHash == null || vnp_TxnRef == null) return null;

            String[] refParts = vnp_TxnRef.split("_");
            if (refParts.length != 2) return null;
            Long bookingId = Long.valueOf(refParts[0]);

            Booking booking = IBookingRepository.findById(bookingId).orElse(null);
            if (booking == null) return null;

            boolean isValid = validatePaymentResponse(params);

            Optional<Payment> existing = IPaymentRepository.findByOrderId(vnp_TxnRef);
            if (existing.isPresent()) {
                Payment payment = existing.get();

                boolean changed = false;
                if (payment.getTransactionNo() == null && params.get("vnp_TransactionNo") != null) {
                    payment.setTransactionNo(params.get("vnp_TransactionNo"));
                    changed = true;
                }
                if (params.get("vnp_ResponseCode") != null &&
                        !params.get("vnp_ResponseCode").equals(payment.getResponseCode())) {
                    payment.setResponseCode(params.get("vnp_ResponseCode"));
                    changed = true;
                }
                if (payment.getPayDate() == null && params.get("vnp_PayDate") != null) {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
                    payment.setPayDate(LocalDateTime.parse(params.get("vnp_PayDate"), formatter));
                    changed = true;
                }

                if (changed) IPaymentRepository.save(payment);

                EPaymentStatus currentStatus = booking.getPaymentStatus();
                booking.setPaymentStatus(isValid ? EPaymentStatus.PAID : EPaymentStatus.FAILED);
                IBookingRepository.save(booking);

                if (isValid && currentStatus != EPaymentStatus.PAID) {
                    notifyRecorderStaffs(booking);
                }

                return paymentMapper.toDTO(payment);
            }

            Payment payment = createPayment(params);
            payment.setOrderId(vnp_TxnRef);

            Payment savedPayment = IPaymentRepository.save(payment);

            booking.setPayment(savedPayment);
            booking.setPaymentStatus(isValid ? EPaymentStatus.PAID : EPaymentStatus.FAILED);
            IBookingRepository.save(booking);

            if (isValid) {
                notifyRecorderStaffs(booking);
            }

            return paymentMapper.toDTO(savedPayment);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private Payment createPayment(Map<String, String> params) {
        System.out.println("VNPay callback params: " + params);
        Payment payment = new Payment();
        payment.setOrderId(params.get("vnp_TxnRef"));
        payment.setAmount(Integer.parseInt(params.getOrDefault("vnp_Amount", "0")) / 100);
        payment.setTransactionNo(params.get("vnp_TransactionNo"));
        payment.setResponseCode(params.get("vnp_ResponseCode"));

        String payDateStr = params.get("vnp_PayDate");
        if (payDateStr != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            payment.setPayDate(LocalDateTime.parse(payDateStr, formatter));
        }

        return payment;
    }

    private boolean validatePaymentResponse(Map<String, String> params) {
        System.out.println("VNPay callback received:");
        params.forEach((k, v) -> System.out.println(k + " = " + v));

        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String vnp_TransactionStatus = params.get("vnp_TransactionStatus");

        boolean isSuccess = "00".equals(vnp_ResponseCode) &&
                ("00".equals(vnp_TransactionStatus) || vnp_TransactionStatus == null);
        System.out.println("Hash OK, Transaction Status OK? " + isSuccess);
        return isSuccess;

    }

}