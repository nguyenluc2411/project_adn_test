package com.genx.service.impl;

import com.genx.dto.response.SampleCollectionHistoryResponse;
import com.genx.entity.SampleCollection;
import com.genx.entity.User;
import com.genx.enums.EParticipantSampleStatus;
import com.genx.enums.ERole;
import com.genx.enums.ESampleCollectionStatus;
import com.genx.mapper.SampleCollectionMapper;
import com.genx.repository.IParticipantRepository;
import com.genx.repository.ISampleCollectionRepository;
import com.genx.repository.IUserRepository;
import com.genx.service.interfaces.INotificationService;
import com.genx.service.interfaces.ISampleCollectionService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SampleCollectionServiceImpl implements ISampleCollectionService {

    @Autowired
    private ISampleCollectionRepository sampleCollectionRepository;

    @Autowired
    private IParticipantRepository participantRepository;

    @Autowired
    private SampleCollectionMapper sampleCollectionMapper;

    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private INotificationService notificationService;


    @Transactional
    @Override
    public void sendSamplesToLab(Long bookingId) {

        SampleCollection sampleCollection = sampleCollectionRepository.findByBooking_Id(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy quá trình thu mẫu cho booking ID: " + bookingId));

        if (sampleCollection.getStatus() != ESampleCollectionStatus.COLLECTING) {
            throw new IllegalStateException("Không thể gửi mẫu tới lab khi trạng thái hiện tại không phải là COLLECTING.");
        }

        boolean allConfirmed = participantRepository.findByBooking_Id(bookingId)
                .stream()
                .allMatch(p -> p.getSampleStatus() == EParticipantSampleStatus.CONFIRMED);

        if (!allConfirmed) {
            throw new IllegalStateException("Tất cả mẫu chưa được xác nhận. Không thể gửi đến phòng lab.");
        }

        sampleCollection.setStatus(ESampleCollectionStatus.SENT_TO_LAB);
        sampleCollection.setConfirmedAt(LocalDateTime.now());
        sampleCollectionRepository.save(sampleCollection);

        notifyLabStaffs(sampleCollection);
    }


    private void notifyLabStaffs(SampleCollection sampleCollection) {
        List<User> labStaffs = userRepository.findAllByRole(ERole.LAB_STAFF);
        String message = "Đơn #" + sampleCollection.getBooking().getCode() + " đã được gửi mẫu đến phòng lab.";

        notificationService.sendBulkNotification(
                labStaffs,
                "Mẫu mới gửi tới phòng lab",
                message,
                sampleCollection.getBooking()
        );
    }

    @Override
    public List<SampleCollectionHistoryResponse> getSampleCollectionHistory(String code) {
        List<SampleCollection> collections;

        if (code == null || code.isBlank()) {
            collections = sampleCollectionRepository.findByStatusIn(List.of(
                    ESampleCollectionStatus.SENT_TO_LAB,
                    ESampleCollectionStatus.COMPLETED
            ));
        } else {
            collections = sampleCollectionRepository.findByBooking_CodeContainingIgnoreCaseAndStatusIn(
                    code.trim(),
                    List.of(ESampleCollectionStatus.SENT_TO_LAB, ESampleCollectionStatus.COMPLETED)
            );
        }

        return collections.stream()
                .map(sampleCollectionMapper::toHistoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public void completeSampleCollection(Long bookingId) {
        SampleCollection sampleCollection = sampleCollectionRepository.findByBooking_Id(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy quá trình thu mẫu cho booking ID: " + bookingId));

        if (sampleCollection.getStatus() != ESampleCollectionStatus.SENT_TO_LAB) {
            throw new IllegalStateException("Chỉ có thể hoàn tất khi trạng thái hiện tại là SENT_TO_LAB.");
        }
        sampleCollection.setStatus(ESampleCollectionStatus.COMPLETED);
        sampleCollectionRepository.save(sampleCollection);
    }
}
