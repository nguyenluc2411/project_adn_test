package com.genx.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
@Entity
@Table(name = "payment")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", unique = true)
    private String orderId;

    @Column(name = "amount")
    private int amount;

    @Column(name = "transaction_no")
    private String transactionNo;

    @Column(name = "response_code")
    private String responseCode;

    @Column(name = "pay_date")
    private LocalDateTime payDate;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = true, unique = true)
    private Booking booking;

}
