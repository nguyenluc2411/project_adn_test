package com.genx.service.impl;

import com.genx.dto.request.KitCodeRequest;
import com.genx.dto.response.ParticipantResponse;
import com.genx.entity.*;
import com.genx.enums.EBookingStatus;
import com.genx.enums.ECollectionMethod;
import com.genx.enums.EKitStatus;
import com.genx.enums.EParticipantSampleStatus;
import com.genx.mapper.ParticipantMapper;
import com.genx.repository.IParticipantRepository;
import com.genx.repository.IKitRepository;
import com.genx.repository.IKitStockRepository;
import com.genx.security.SecurityUtil;
import com.genx.service.interfaces.INotificationService;
import com.genx.service.interfaces.IParticipantService;
import com.genx.service.interfaces.IUploadImageFile;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Random;

@Service
public class ParticipantServiceImpl implements IParticipantService {

    @Autowired
    private IParticipantRepository participantRepository;

    @Autowired
    private ParticipantMapper participantMapper;

    @Autowired
    private INotificationService notificationService;

    @Autowired
    private IKitRepository kitRepository;

    @Autowired
    private IKitStockRepository kitStockRepository;

    @Autowired
    private IUploadImageFile uploadImageFile;


    @Override
    public ParticipantResponse sendKitToCustomer(Long participantId) {
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy participant"));

        if (participant.getSampleStatus() != EParticipantSampleStatus.PENDING) {
            throw new IllegalStateException("Không thể gửi kit ở trạng thái hiện tại");
        }

        Kit kit = participant.getKit();
        if (kit == null) {
            throw new IllegalStateException("Chưa chuẩn bị bộ kit. Hãy tạo trước khi gửi.");
        }

        if (kit.getStatus() != EKitStatus.CREATED) {
            throw new IllegalStateException("Bộ kit không ở trạng thái có thể gửi.");
        }

        User currentUser = SecurityUtil.getCurrentUser()
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy người dùng đăng nhập"));

        kit.setStatus(EKitStatus.ASSIGNED);
        kit.setAssignedAt(LocalDateTime.now());
        kit.setAssignedBy(currentUser);
        kitRepository.save(kit);

        participant.setSampleStatus(EParticipantSampleStatus.KIT_SENT);
        Participant saved = participantRepository.save(participant);

        checkAndNotifyIfAllKitSent(saved.getBooking());

        return participantMapper.toResponse(saved);
    }

    @Override
    public ParticipantResponse assignKitToParticipant(Long participantId) {
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy participant"));
        Kit kit = participant.getKit();

        if (kit.getStatus() != EKitStatus.CREATED) {
            throw new IllegalStateException("Kit chưa đuược tạo");
        }
        User currentUser = SecurityUtil.getCurrentUser()
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy người dùng đăng nhập"));

        kit.setStatus(EKitStatus.ASSIGNED);
        kit.setAssignedAt(LocalDateTime.now());
        kit.setAssignedBy(currentUser);
        kitRepository.save(kit);
        participant.setSampleStatus(EParticipantSampleStatus.WAITING_FOR_COLLECTION);
        Participant saved = participantRepository.save(participant);

        checkAndNotifyIfAllKitSent(saved.getBooking());

        return participantMapper.toResponse(saved);
    }


    @Override
    public String uploadFingerprintImage(Long participantId, MultipartFile file) throws IOException {
        String url = uploadImageFile.uploadImageFile(file);

        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy participant với ID: " + participantId));

        participant.setFingerprintImageUrl(url);
        participantRepository.save(participant);

        return url;
    }



    @Override
    public ParticipantResponse enterKitCodeByStaff(Long participantId, KitCodeRequest request) {
        User currentUser = SecurityUtil.getCurrentUser()
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy người dùng đăng nhập"));

        return handleEnterKitCode(participantId, request, currentUser, false);
    }

    @Override
    public ParticipantResponse enterKitCodeByCustomer(Long participantId, KitCodeRequest request) {
        User currentUser = SecurityUtil.getCurrentUser()
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy người dùng đăng nhập"));

        return handleEnterKitCode(participantId, request, currentUser, true);
    }


    @Override
    public ParticipantResponse confirmCollectedSample(Long participantId) {
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người tham gia với ID: " + participantId));

        if (participant.getSampleStatus() != EParticipantSampleStatus.WAITING_FOR_COLLECTION) {
            throw new IllegalStateException("Không thể xác nhận thu mẫu vì trạng thái hiện tại không phải là CHỜ THU MẪU.");
        }

        participant.setSampleStatus(EParticipantSampleStatus.CONFIRMED);
        return participantMapper.toResponse(participantRepository.save(participant));
    }

    @Override
    public ParticipantResponse prepareKitForParticipant(Long participantId) {
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy participant"));

        if (participant.getKit() != null) {
            throw new IllegalStateException("Participant này đã được gán kit.");
        }

        KitStock stock = kitStockRepository.findById(1L)
                .orElseThrow(() -> new IllegalStateException("KitStock không tồn tại"));

        if (stock.getRemainingQuantity() <= 0) {
            throw new IllegalStateException("Hết bộ kit. Không thể tạo thêm.");
        }

        stock.setRemainingQuantity(stock.getRemainingQuantity() - 1);
        stock.setLastUpdated(LocalDateTime.now());
        kitStockRepository.save(stock);

        User currentUser = SecurityUtil.getCurrentUser()
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy người dùng đăng nhập"));

        Kit kit = new Kit();
        kit.setCode(generateUniqueKitCode());
        kit.setStatus(EKitStatus.CREATED);
        kit.setAssignedAt(LocalDateTime.now());
        kit.setAssignedBy(currentUser);
        kit.setParticipant(participant);

        participant.setKit(kit);

        kitRepository.save(kit);
        Participant saved = participantRepository.save(participant);

        return participantMapper.toResponse(saved);
    }


    @Override
    public ParticipantResponse cancelPreparedKit(Long participantId) {
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy participant"));

        Kit kit = participant.getKit();
        if (kit == null || kit.getStatus() != EKitStatus.CREATED) {
            throw new IllegalStateException("Không thể huỷ vì kit chưa được tạo hoặc đã được gửi.");
        }

        participant.setKit(null);
        participantRepository.save(participant);
        kitRepository.delete(kit);

        KitStock stock = kitStockRepository.findById(1L)
                .orElseThrow(() -> new IllegalStateException("KitStock không tồn tại"));

        stock.setRemainingQuantity(stock.getRemainingQuantity() + 1);
        stock.setLastUpdated(LocalDateTime.now());
        kitStockRepository.save(stock);

        return participantMapper.toResponse(participant);
    }




    private ParticipantResponse handleEnterKitCode(Long participantId, KitCodeRequest request, User currentUser, boolean isCustomer) {
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người tham gia với ID: " + participantId));

        if (participant.getBooking() == null || participant.getBooking().getStatus() != EBookingStatus.CONFIRMED) {
            throw new IllegalStateException("Không thể nhập mã kit vì booking chưa được xác nhận.");
        }

        if (participant.getKit() == null) {
            throw new IllegalStateException("Không tìm thấy mã kit được gán cho người tham gia.");
        }

        if (request.getSampleType() == null) {
            throw new IllegalArgumentException("Mẫu không được tìm thấy.");
        }

        if (isCustomer) {
            String ownerUsername = participant.getBooking().getCustomer().getUser().getUsername();
            if (!currentUser.getUsername().equals(ownerUsername)) {
                throw new SecurityException("Bạn không có quyền nhập mã kit cho người tham gia này.");
            }

            ECollectionMethod method = participant.getBooking().getCollectionMethod();
            if (method == ECollectionMethod.HOME) {
                if (participant.getSampleStatus() != EParticipantSampleStatus.KIT_SENT) {
                    throw new IllegalStateException("Bạn chỉ có thể nhập thông tin mẫu khi kit đã được gửi.");
                }
            }
        }


        participant.setSampleType(request.getSampleType());

        if (isCustomer) {
            participant.setSampleStatus(EParticipantSampleStatus.WAITING_FOR_COLLECTION);
        } else {
            ECollectionMethod method = participant.getBooking().getCollectionMethod();
            if (method == null) {
                throw new IllegalStateException("Không xác định được hình thức thu mẫu.");
            }
            switch (method) {
                case HOME -> participant.setSampleStatus(EParticipantSampleStatus.WAITING_FOR_COLLECTION);
                case HOSPITAL -> participant.setSampleStatus(EParticipantSampleStatus.CONFIRMED);
            }
        }

        if (request.getFingerprintImage() != null && !request.getFingerprintImage().isEmpty()) {
            String imageUrl = null;
            try {
                imageUrl = uploadImageFile.uploadImageFile(request.getFingerprintImage());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            participant.setFingerprintImageUrl(imageUrl);
        }

        Participant saved = participantRepository.save(participant);

        if (isCustomer && participant.getBooking().getCollectionMethod() == ECollectionMethod.HOME) {
            notifyStaffIfAllKitsEnteredByCustomer(participant.getBooking());
        }

        return participantMapper.toResponse(saved);
    }


    private void notifyStaffIfAllKitsEnteredByCustomer(Booking booking) {
        boolean allKitsEntered = participantRepository.findByBooking_Id(booking.getId())
                .stream()
                .allMatch(p -> p.getSampleStatus() == EParticipantSampleStatus.WAITING_FOR_COLLECTION);

        if (allKitsEntered && booking.getCollectionMethod() == ECollectionMethod.HOME) {
            User staff = booking.getRecordStaff().getUser();
            notificationService.sendNotification(
                    staff,
                    "Khách đã thu mẫu xong",
                    "Đơn #" + booking.getCode() + " đã được khách hoàn tất thu mẫu. Vui lòng kiểm tra và xử lý mẫu gửi đến.",
                    booking
            );
        }
    }



    private String generateUniqueKitCode() {
        String code;
        do {
            code = "KIT-" + LocalDate.now().getYear() + "-" + randomAlphaNumeric(8);
        } while (kitRepository.existsByCode(code));
        return code;
    }

    private String randomAlphaNumeric(int length) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new SecureRandom();
        for (int i = 0; i < length; i++) {
            sb.append(characters.charAt(random.nextInt(characters.length())));
        }
        return sb.toString();
    }


    private void checkAndNotifyIfAllKitSent(Booking booking) {
        boolean allKitSent = participantRepository.findByBooking_Id(booking.getId())
                .stream()
                .allMatch(p -> p.getSampleStatus() == EParticipantSampleStatus.KIT_SENT);

        if (allKitSent) {
            User customer = booking.getCustomer().getUser();

            notificationService.sendNotification(
                    customer,
                    "Tất cả bộ kit đã được gửi đi",
                    "Tất cả các bộ kit trong đơn đăng ký " +  booking.getCode() + " đã được gửi đến địa chỉ của bạn. \n" +
                            "Vui lòng truy cập trang \"Hướng dẫn thu mẫu\" để chuẩn bị đúng cách khi nhận được bộ kit.\n",
                    booking
            );
        }
    }

}
