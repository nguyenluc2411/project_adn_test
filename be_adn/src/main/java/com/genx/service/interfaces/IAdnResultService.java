package com.genx.service.interfaces;


import com.genx.dto.request.AdnResultRequest;
import com.genx.dto.response.ParticipantResponse;
import com.genx.entity.AdnResult;

import java.util.List;

public interface IAdnResultService {

    AdnResult saveAdnResult(AdnResultRequest request);

    byte[] exportResultToPdf(Long bookingId) throws Exception;

    List<ParticipantResponse> getParticipantsByBookingId(Long id);

    AdnResult lookupResult(String trackingCode, String trackingPassword);

    void resendTrackingPassword(Long bookingId);
}