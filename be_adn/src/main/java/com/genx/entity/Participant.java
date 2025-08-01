package com.genx.entity;

import com.genx.enums.EParticipantSampleStatus;
import com.genx.enums.ESampleType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "participant")
@Getter
@Setter
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "participant_id")
    private Long id;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "gender")
    private String gender;

    @Column(name = "year_of_birth")
    private String yearOfBirth;

    @Column(name = "identity_number", length = 50)
    private String identityNumber;

    @Column(name = "issue_date")
    private String issueDate;

    @Column(name = "issue_place")
    private String issuePlace;

    @Column(name = "relationship")
    private String relationship;
    
    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @OneToOne
    @JoinColumn(name = "kit_id")
    private Kit kit;

    @Enumerated(EnumType.STRING)
    @Column(name = "sample_status")
    private EParticipantSampleStatus sampleStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "sample_type")
    private ESampleType sampleType;

    @Column(name = "fingerprint_image_url")
    private String fingerprintImageUrl;

}