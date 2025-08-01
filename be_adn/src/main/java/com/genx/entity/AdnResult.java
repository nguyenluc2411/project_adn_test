package com.genx.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "adn_result")
@Data
@Getter
@Setter
@Builder
public class AdnResult {

    @Id
    private Long id;

    private LocalDateTime createdAt;

    private String conclusion;

    @OneToOne
    @MapsId
    @JoinColumn(name = "booking_id", referencedColumnName = "id")
    private Booking booking;

    @ElementCollection
    @CollectionTable(name = "adn_locus_result", joinColumns = @JoinColumn(name = "adn_result_id"))
    @MapKeyColumn(name = "locus_name")
    @Column(name = "locus_value")
    private Map<String, String> lociResults = new HashMap<>();

    @ManyToOne
    @JoinColumn(name = "entered_by")
    private StaffInfo enteredBy;

    @Column(name = "tracking_code", unique = true, nullable = false)
    private String trackingCode;

    @Column(name = "tracking_password", nullable = false)
    private String trackingPassword;

    @Column(name = "tracking_password_encrypted")
    private String trackingPasswordEncrypted;

}
