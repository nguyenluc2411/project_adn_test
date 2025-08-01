package com.genx.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "staff_info")
@Getter
@Setter
public class StaffInfo {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(name = "fingerprint_image_url")
    private String fingerprintImageUrl;

    @Column(length = 255, nullable = true)
    private String avatar;

    @Column(nullable = true)
    private LocalDateTime startDate;
}
