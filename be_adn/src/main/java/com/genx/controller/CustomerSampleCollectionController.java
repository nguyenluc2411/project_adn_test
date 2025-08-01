package com.genx.controller;

import com.genx.dto.request.KitCodeRequest;
import com.genx.dto.response.ParticipantResponse;
import com.genx.service.interfaces.IParticipantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customer/sample-collection")
public class CustomerSampleCollectionController {

    @Autowired
    private IParticipantService participantService;


    @PutMapping("/participants/{id}/kit-code")
    public ParticipantResponse enterKitCodeByCustomer(@PathVariable("id") Long participantId,
                                                      @RequestBody KitCodeRequest request
                                                     ) {
        return participantService.enterKitCodeByCustomer(participantId, request);
    }
}