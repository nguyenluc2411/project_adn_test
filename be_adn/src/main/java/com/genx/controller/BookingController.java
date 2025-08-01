package com.genx.controller;


import com.genx.dto.request.BookingRequest;
import com.genx.dto.response.BookingResponse;
import com.genx.dto.response.ServiceResponseDto;
import com.genx.enums.ECaseType;
import com.genx.enums.EPaymentStatus;
import com.genx.service.interfaces.IBookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
public class BookingController {

    @Autowired
    private IBookingService bookingService;

    @Autowired
    private com.genx.service.interfaces.IServiceService serviceService;

    @GetMapping("/services")
    public List<ServiceResponseDto> getServicesByCaseType(@RequestParam ECaseType caseType) {
        return serviceService.getEnabledServicesByCaseType(caseType);
    }

  @PostMapping("/register")
  public ResponseEntity<BookingResponse> createRegistration(@RequestBody BookingRequest bookingRequest) {
      BookingResponse savedRegistration = bookingService.createRegistration(bookingRequest);
      return ResponseEntity.ok(savedRegistration);
  }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getRegistration(@PathVariable Long id) {
        BookingResponse registration = bookingService.getBookingById(id);
        return ResponseEntity.ok(registration);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelRegistration(@PathVariable Long id) {
        BookingResponse cancelledRegistration = bookingService.cancelRegistration(id);
        return ResponseEntity.ok(cancelledRegistration);
    }
    @GetMapping
    public ResponseEntity<Page<BookingResponse>> getAllRegistrations(
            @RequestParam(required = false) EPaymentStatus status,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<BookingResponse> registrations;
        if (status != null) {
            registrations = bookingService.getRegistrationsByStatus(status, pageable);
        } else {
            registrations = bookingService.getAllRegistrations(pageable);
        }
        return ResponseEntity.ok(registrations);
    }


}
