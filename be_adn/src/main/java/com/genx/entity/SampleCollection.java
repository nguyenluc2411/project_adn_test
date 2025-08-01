package com.genx.entity;

import com.genx.enums.ESampleCollectionStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sample_collection")
@Data
@Getter
@Setter
public class SampleCollection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "booking_id", unique = true)
    private Booking booking;

    @ManyToOne
    @JoinColumn(name = "collected_by")
    private StaffInfo collectedBy;

    private LocalDateTime collectedAt;

    private LocalDateTime confirmedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ESampleCollectionStatus status;

    @Column(length = 500)
    private String note;

    @OneToOne
    @JoinColumn(name = "adn_result_id")
    private AdnResult adnResult;
}
