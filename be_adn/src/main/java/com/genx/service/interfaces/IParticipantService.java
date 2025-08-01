package com.genx.service.interfaces;

import com.genx.dto.request.KitCodeRequest;
import com.genx.dto.response.ParticipantResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface IParticipantService{

    ParticipantResponse cancelPreparedKit(Long participantId);

    ParticipantResponse prepareKitForParticipant(Long participantId);

    ParticipantResponse sendKitToCustomer(Long participantId);

    ParticipantResponse assignKitToParticipant(Long participantId);

    ParticipantResponse confirmCollectedSample(Long participantId);

    ParticipantResponse enterKitCodeByStaff(Long participantId, KitCodeRequest request);

    ParticipantResponse enterKitCodeByCustomer(Long participantId, KitCodeRequest request);

    String uploadFingerprintImage(Long participantId, MultipartFile file) throws IOException;
}
