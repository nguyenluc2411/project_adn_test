
package com.genx.controller;
import com.genx.dto.request.AdnResultRequest;
import com.genx.dto.request.LookupResultRequest;
import com.genx.dto.response.AdnResultResponse;
import com.genx.dto.response.BookingResponse;
import com.genx.dto.response.ParticipantResponse;
import com.genx.entity.AdnResult;
import com.genx.entity.Participant;
import com.genx.enums.ESampleCollectionStatus;
import com.genx.repository.IParticipantRepository;
import com.genx.security.SecurityUtil;
import com.genx.service.interfaces.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
@RestController
@RequestMapping("/api/adn-results")
@RequiredArgsConstructor
public class AdnResultController {
    @Autowired
    private IParticipantService participantService;

    @Autowired
    private  IAdnResultService adnResultService;

    @Autowired
     private IBookingService bookingService;

    @Autowired
    private ISampleCollectionService sampleCollectionService;

    @PostMapping
    public ResponseEntity<AdnResultResponse> saveResult(@RequestBody AdnResultRequest request) {
        Long userId = SecurityUtil.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Không xác định được người dùng"));
        request.setStaffId(userId);

        AdnResult result = adnResultService.saveAdnResult(request);
        AdnResultResponse response = new AdnResultResponse();
        response.setTrackingCode(result.getTrackingCode());
        response.setTrackingPassword(result.getTrackingPassword());
        response.setConclusion(result.getConclusion());
        response.setLociResults(result.getLociResults());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/export/{bookingId}")
    public ResponseEntity<byte[]> exportResult(@PathVariable Long bookingId) throws Exception {
        byte[] pdf = adnResultService.exportResultToPdf(bookingId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("adn_result_" + bookingId + ".pdf").build());
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    @GetMapping("/booking/{id}/participants")
    public ResponseEntity<List<ParticipantResponse>> getParticipants(@PathVariable Long id) {
        return ResponseEntity.ok(adnResultService.getParticipantsByBookingId(id));
    }

    @PostMapping("/participants/{id}/fingerprint")
    public ResponseEntity<String> uploadFingerprintImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            String url = participantService.uploadFingerprintImage(id, file);
            return ResponseEntity.ok(url);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload image: " + e.getMessage());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @GetMapping("/get-all-sent-to-lab")
    public ResponseEntity<List<BookingResponse>> getAllSentToLabBookings() {
        List<BookingResponse> registrations = bookingService.getAllApplicationsSentToLab();
        return ResponseEntity.ok(registrations);
    }
    @PostMapping("/complete-sample/{id}")
    public ResponseEntity<String> completeSampleCollection(@PathVariable Long id) {
        sampleCollectionService.completeSampleCollection(id);
        return ResponseEntity.ok("Trạng thái thu mẫu đã được cập nhật thành COMPLETED.");
    }

    @GetMapping("/get-all-completed-booking")
    public ResponseEntity<List<BookingResponse>> getAllCompletedLabBookings() {
        List<BookingResponse> registrations = bookingService.getAllCompletedApplications();
        return ResponseEntity.ok(registrations);
    }
    @GetMapping("/lab/search-bookings")
    public ResponseEntity<Page<BookingResponse>> searchLabBookings(
            @RequestParam ESampleCollectionStatus status,
            @RequestParam(required = false) String code,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(bookingService.searchBySampleStatus(status, code, pageable));
    }


    @PostMapping("/lookup")
    public ResponseEntity<AdnResultResponse> lookupResult(@RequestBody @Valid LookupResultRequest request) {
        AdnResult result = adnResultService.lookupResult(
                request.getTrackingCode(),
                request.getTrackingPassword()
        );

        AdnResultResponse response = new AdnResultResponse();
        response.setTrackingCode(result.getTrackingCode());
        response.setConclusion(result.getConclusion());
        response.setLociResults(result.getLociResults());
        response.setBookingId(result.getBooking().getId());
        response.setCreatedAt(result.getCreatedAt());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-tracking-info/{bookingId}")
    public ResponseEntity<String> resendTrackingInfo(@PathVariable Long bookingId) {
        adnResultService.resendTrackingPassword(bookingId);
        return ResponseEntity.ok("Mã tra cứu đã được gửi lại cho khách hàng.");
    }


}