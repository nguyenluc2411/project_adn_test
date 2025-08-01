package com.genx.controller;


import com.genx.dto.request.KitCodeRequest;
import com.genx.dto.response.ApiResponse;
import com.genx.dto.response.ParticipantResponse;
import com.genx.dto.response.SampleCollectionHistoryResponse;
import com.genx.service.interfaces.IParticipantService;
import com.genx.service.interfaces.ISampleCollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/staff/sample-collection")
public class StaffSampleCollectionController {

    @Autowired
    private IParticipantService participantService;

    @Autowired
    private ISampleCollectionService sampleCollectionService;

    @PostMapping("/participants/{id}/prepare-kit")
    public ParticipantResponse prepareKitForParticipant(@PathVariable Long id) {
        return participantService.prepareKitForParticipant(id);
    }

    @DeleteMapping("/participants/{id}/cancel-kit")
    public ParticipantResponse cancelPreparedKit(@PathVariable Long id) {
        return participantService.cancelPreparedKit(id);
    }

    @PutMapping("/participants/{id}/assign-kit")
    public ParticipantResponse assignKitToParticipant(@PathVariable Long id) {
        return participantService.assignKitToParticipant(id);
    }


    @PutMapping("/participants/{id}/send-kit")
    public ParticipantResponse sendKitToCustomer(@PathVariable Long id) {
        return participantService.sendKitToCustomer(id);
    }



    @PutMapping("/participants/{id}/kit-code")
    public ParticipantResponse enterKitCode(@PathVariable("id") Long participantId,
                                            @ModelAttribute KitCodeRequest request) {
        return participantService.enterKitCodeByStaff(participantId, request);
    }

    @PutMapping("/{participantId}/confirm")
    public ParticipantResponse confirmSampleCollection(@PathVariable Long participantId) {
        return participantService.confirmCollectedSample(participantId);
    }

    @PutMapping("/bookings/{bookingId}/send-to-lab")
    public ApiResponse<String> sendToLab(@PathVariable Long bookingId) {
        sampleCollectionService.sendSamplesToLab(bookingId);
        return ApiResponse.<String>builder()
                .message("Gửi mẫu đến phòng lab thành công.")
                .result("OK")
                .build();
    }

    @GetMapping("/history")
    public List<SampleCollectionHistoryResponse> getSampleCollectionHistory(
            @RequestParam(name = "code", required = false) String code) {
        return sampleCollectionService.getSampleCollectionHistory(code);
    }

}
