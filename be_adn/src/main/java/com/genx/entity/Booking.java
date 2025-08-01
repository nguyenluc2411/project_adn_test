package com.genx.entity;

import com.genx.enums.EBookingStatus;
import com.genx.enums.EPaymentStatus;
import com.genx.enums.ECollectionMethod;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Builder
@Table(name = "booking")
public class Booking extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(name = "email")
    private String email;

    @Column(name = "identity_number", nullable = true, length = 100)
    private String identityNumber;

    @Column(name = "appointment_date")
    private String appointmentDate;

    @Column(name = "number_of_participants")
    private Integer numberOfParticipants;

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "record_staff_id")
    private StaffInfo recordStaff;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private Service service;

    @Enumerated(EnumType.STRING)
    @Column(name = "option_collect", nullable = false)
    private ECollectionMethod collectionMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private EPaymentStatus paymentStatus;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private EBookingStatus status = EBookingStatus.PENDING;

    @Column(name = "note", length = 500)
    private String note;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Participant> participants = new ArrayList<>();

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    private SampleCollection sampleCollection;

    @PrePersist
    public void generateCode() {
        if (this.code == null) {
            String datePart = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
            String randomPart = String.format("%06d", (int)(Math.random() * 1_000_000));
            this.code = "BK" + datePart + "_" + randomPart;
        }
    }

}