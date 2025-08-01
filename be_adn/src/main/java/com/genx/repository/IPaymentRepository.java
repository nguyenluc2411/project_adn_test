package com.genx.repository;

import com.genx.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IPaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(String orderId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.responseCode = '00'")
    Optional<Long> sumSuccessfulPaymentAmount();
}