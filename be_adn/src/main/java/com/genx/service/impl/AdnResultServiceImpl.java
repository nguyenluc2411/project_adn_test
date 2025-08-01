
package com.genx.service.impl;

import com.genx.dto.request.AdnResultRequest;
import com.genx.dto.response.ParticipantResponse;
import com.genx.entity.*;
import com.genx.enums.ESampleCollectionStatus;
import com.genx.repository.IAdnResultRepository;
import com.genx.repository.IBookingRepository;
import com.genx.repository.IStaffInfoRepository;
import com.genx.security.AESUtil;
import com.genx.service.interfaces.IAdnResultService;
import com.genx.service.interfaces.INotificationService;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdnResultServiceImpl implements IAdnResultService {

    @Autowired
    private IAdnResultRepository adnResultRepository;

    @Autowired
    private IBookingRepository bookingRepository;

    @Autowired
    private IStaffInfoRepository staffInfoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AESUtil aesUtil;

    @Autowired
    private INotificationService notificationService;

    @Override
    public AdnResult saveAdnResult(AdnResultRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        StaffInfo staff = staffInfoRepository.findById(request.getStaffId())
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        String trackingCode = generateTrackingCode();
        String trackingPasswordPlain = generateTrackingPassword();
        String trackingPasswordHash = passwordEncoder.encode(trackingPasswordPlain);
        String trackingPasswordEncrypted = aesUtil.encrypt(trackingPasswordPlain);

        AdnResult result = AdnResult.builder()
                .booking(booking)
                .enteredBy(staff)
                .trackingCode(trackingCode)
                .trackingPassword(trackingPasswordHash)
                .trackingPasswordEncrypted(trackingPasswordEncrypted)
                .conclusion(request.getConclusion())
                .lociResults(request.getLociResults())
                .createdAt(LocalDateTime.now())
                .build();

        AdnResult saved = adnResultRepository.save(result);

        User customer = booking.getCustomer().getUser();
        String title = "Mã tra cứu kết quả ADN đã sẵn sàng";
        String message = "Mã tra cứu: " + saved.getTrackingCode() +
                "\n Mật khẩu: " + trackingPasswordPlain +
                "\n Mã hồ sơ (booking): " + booking.getCode() +
                "\nBạn có thể dùng thông tin này để xem kết quả xét nghiệm ADN của bạn.";

        notificationService.sendNotification(customer, title, message, booking);


        return saved;
    }

    private String generateTrackingCode() {
        return "DNA-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateTrackingPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        Random rnd = new Random();
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    @Override
    public AdnResult lookupResult(String trackingCode, String inputPassword) {
        AdnResult result = adnResultRepository.findByTrackingCode(trackingCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kết quả với mã tra cứu"));

        if (!passwordEncoder.matches(inputPassword, result.getTrackingPassword())) {
            throw new RuntimeException("Mật khẩu không đúng");
        }

        return result;
    }


    public byte[] exportResultToPdf(Long bookingId) throws Exception {
        AdnResult result = adnResultRepository.findByBooking_Id(bookingId)
                .orElseThrow(() -> new RuntimeException("Result not found"));
        Booking booking = result.getBooking();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, out);
        document.open();

        BaseFont baseFont = BaseFont.createFont("fonts/arial.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        Font titleFont = new Font(baseFont, 12, Font.ITALIC);
        Font headerFont = new Font(baseFont, 12, Font.BOLD);
        Font normalFont = new Font(baseFont, 11);

        Paragraph govTitle = new Paragraph("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", headerFont);
        govTitle.setAlignment(Element.ALIGN_CENTER);
        document.add(govTitle);

        Paragraph slogan = new Paragraph("Độc lập - Tự do - Hạnh phúc", headerFont);
        slogan.setAlignment(Element.ALIGN_CENTER);
        slogan.setSpacingAfter(15f);
        document.add(slogan);

        Paragraph mainTitle = new Paragraph("PHIẾU KẾT QUẢ XÉT NGHIỆM ADN", titleFont);
        mainTitle.setAlignment(Element.ALIGN_CENTER);
        mainTitle.setSpacingAfter(20f);
        document.add(mainTitle);

        document.add(new Paragraph("THÔNG TIN NGƯỜI ĐẠI DIỆN", headerFont));
        document.add(new Paragraph("Họ tên: " + booking.getCustomer().getUser().getFullName(), normalFont));
        document.add(new Paragraph("Số điện thoại: " + booking.getPhoneNumber(), normalFont));
        document.add(new Paragraph("Email: " + booking.getEmail(), normalFont));
        String collectionMethod = booking.getCollectionMethod().name();
        if( collectionMethod.equalsIgnoreCase("HOSPITAL") ) {
            document.add(new Paragraph("Ngày hẹn: " +
                    (booking.getAppointmentDate() != null ? booking.getAppointmentDate().toString() : "Không rõ"), normalFont));
            document.add(Chunk.NEWLINE);
        }

        String caseType = booking.getService().getCaseType().name();
        if(caseType.equalsIgnoreCase("CIVIL")){
            caseType="Dân sự";
        }else if(caseType.equalsIgnoreCase("ADMINISTRATIVE")) {
            caseType = "Hành chính";
        }
        document.add(new Paragraph("Loại hồ sơ: " + (caseType != null ? caseType : "Không rõ"), normalFont));
        document.add(Chunk.NEWLINE);

        document.add(new Paragraph("DANH SÁCH NGƯỜI THAM GIA", headerFont));
        PdfPTable participantTable;
        if ("ADMINISTRATIVE".equalsIgnoreCase(caseType)) {
            participantTable = new PdfPTable(5);
            participantTable.setWidthPercentage(100);
            participantTable.setSpacingBefore(10f);
            participantTable.addCell(new PdfPCell(new Phrase("Họ tên", normalFont)));
            participantTable.addCell(new PdfPCell(new Phrase("Kit Code", normalFont)));
            participantTable.addCell(new PdfPCell(new Phrase("Mối quan hệ", normalFont)));
            participantTable.addCell(new PdfPCell(new Phrase("CMND/CCCD", normalFont)));
            participantTable.addCell(new PdfPCell(new Phrase("Vân tay", normalFont)));

            for (var p : booking.getParticipants()) {
                participantTable.addCell(new PdfPCell(new Phrase(p.getFullName(), normalFont)));
                participantTable.addCell(new PdfPCell(new Phrase(p.getKit().getCode(), normalFont)));
                participantTable.addCell(new PdfPCell(new Phrase(p.getRelationship(), normalFont)));
                participantTable.addCell(new PdfPCell(new Phrase(p.getIdentityNumber() != null ? p.getIdentityNumber() : "Không có", normalFont)));

                if (p.getFingerprintImageUrl() != null && !p.getFingerprintImageUrl().isEmpty()) {
                    try {
                        Image fingerprintImg = Image.getInstance(new URL(p.getFingerprintImageUrl()));
                        fingerprintImg.scaleToFit(50, 50);
                        PdfPCell imgCell = new PdfPCell(fingerprintImg, true);
                        imgCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                        participantTable.addCell(imgCell);
                    } catch (Exception e) {
                        participantTable.addCell(new PdfPCell(new Phrase("Lỗi ảnh", normalFont)));
                    }
                } else {
                    participantTable.addCell(new PdfPCell(new Phrase("Không", normalFont)));
                }
            }
        } else {
            participantTable = new PdfPTable(3);
            participantTable.setWidthPercentage(100);
            participantTable.setSpacingBefore(10f);
            participantTable.addCell(new PdfPCell(new Phrase("Họ tên", normalFont)));
            participantTable.addCell(new PdfPCell(new Phrase("Kit Code", normalFont)));
            participantTable.addCell(new PdfPCell(new Phrase("Mối quan hệ", normalFont)));

            for (var p : booking.getParticipants()) {
                participantTable.addCell(new PdfPCell(new Phrase(p.getFullName(), normalFont)));
                participantTable.addCell(new PdfPCell(new Phrase(p.getKit().getCode(), normalFont)));
                participantTable.addCell(new PdfPCell(new Phrase(p.getRelationship(), normalFont)));
            }
        }
        document.add(participantTable);
        document.add(Chunk.NEWLINE);

        document.add(new Paragraph("KẾT QUẢ XÉT NGHIỆM (THEO LOCUS)", headerFont));
        List<Participant> participants = booking.getParticipants();
        int participantCount = participants.size();

        PdfPTable lociTable = new PdfPTable(1 + participantCount);
        lociTable.setWidthPercentage(100);
        lociTable.setSpacingBefore(10f);

        lociTable.addCell("Locus");
        for (Participant p : participants) {
            lociTable.addCell(new Phrase(p.getFullName(), normalFont));
        }

        for (var entry : result.getLociResults().entrySet()) {
            lociTable.addCell(entry.getKey());
            String[] values = entry.getValue().split(",");
            for (int i = 0; i < participantCount; i++) {
                lociTable.addCell(i < values.length ? values[i] : "");
            }
        }
        document.add(lociTable);
        document.add(Chunk.NEWLINE);

        Paragraph conclusion = new Paragraph("KẾT LUẬN:", headerFont);
        conclusion.setSpacingBefore(15f);
        document.add(conclusion);


        Paragraph conclusionText = new Paragraph(result.getConclusion().toUpperCase(), titleFont);
        conclusionText.setSpacingBefore(5f);
        conclusionText.setAlignment(Element.ALIGN_LEFT);
        document.add(conclusionText);



        Paragraph signTitle = new Paragraph(" ", normalFont); // khoảng trắng
        signTitle.setSpacingBefore(25f);
        document.add(signTitle);

        PdfPTable titleTable = new PdfPTable(3);
        titleTable.setWidthPercentage(100);
        titleTable.setSpacingAfter(5f);

        PdfPCell cellTitle1 = new PdfPCell(new Phrase("HỘI ĐỒNG KHOA HỌC", headerFont));
        PdfPCell cellTitle2 = new PdfPCell(new Phrase("GIÁM ĐỐC CÔNG TY", headerFont));
        PdfPCell cellTitle3 = new PdfPCell(new Phrase("CÔNG TY CHỊU TRÁCH NHIỆM", headerFont));

        for (PdfPCell cell : List.of(cellTitle1, cellTitle2, cellTitle3)) {
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setBorder(Rectangle.NO_BORDER);
        }
        titleTable.addCell(cellTitle1);
        titleTable.addCell(cellTitle2);
        titleTable.addCell(cellTitle3);
        document.add(titleTable);

        Image sign1 = Image.getInstance("src/main/resources/images/sign_vu.png");
        Image sign2 = Image.getInstance( "src/main/resources/images/sign_huy.png");
        Image redStamp = Image.getInstance("src/main/resources/images/stamp_red.png");

        float imageWidth = 120f;
        float imageHeight = 50f;

        sign1.scaleToFit(imageWidth, imageHeight);
        sign2.scaleToFit(imageWidth, imageHeight);
        redStamp.scaleToFit(imageWidth, imageHeight);

        PdfPCell cell1 = new PdfPCell(sign1, true);
        PdfPCell cell2 = new PdfPCell(sign2, true);
        PdfPCell cell3 = new PdfPCell(redStamp, true);

        for (PdfPCell cell : List.of(cell1, cell2, cell3)) {
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setBorder(Rectangle.NO_BORDER);
        }

        PdfPTable signTable = new PdfPTable(3);
        signTable.setWidthPercentage(100);
        signTable.setSpacingBefore(5f);
        signTable.addCell(cell1);
        signTable.addCell(cell2);
        signTable.addCell(cell3);

        document.add(signTable);

        document.close();
        return out.toByteArray();
    }



    @Override
    public List<ParticipantResponse> getParticipantsByBookingId(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking"));

        SampleCollection collection = booking.getSampleCollection();

        if (collection == null || collection.getStatus() != ESampleCollectionStatus.SENT_TO_LAB) {
            throw new RuntimeException("Chỉ lấy participants khi mẫu đã được gửi đến phòng lab");
        }

        return booking.getParticipants().stream()
                .map(p -> {
                    ParticipantResponse dto = new ParticipantResponse();
                    dto.setFullName(p.getFullName());
                    dto.setKitCode(p.getKit().getCode());
                    dto.setRelationship(p.getRelationship());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public void resendTrackingPassword(Long bookingId) {
        AdnResult result = adnResultRepository.findByBooking_Id(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kết quả"));


        String decryptedPassword = aesUtil.decrypt(result.getTrackingPasswordEncrypted());

        Booking booking = result.getBooking();
        User customer = booking.getCustomer().getUser();

        String message = " Gửi lại mã tra cứu ADN:\n" +
                "Mã tra cứu: *" + result.getTrackingCode() + "*\n" +
                "Mật khẩu: *" + decryptedPassword + "*\n" +
                "Vui lòng sử dụng thông tin trên để tra cứu kết quả xét nghiệm.";

        notificationService.sendNotification(customer, "Gửi lại mã tra cứu ADN", message, booking);
    }



}