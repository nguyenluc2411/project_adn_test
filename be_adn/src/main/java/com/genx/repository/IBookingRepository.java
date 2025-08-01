package com.genx.repository;

import com.genx.entity.Booking;
import com.genx.entity.Payment;
import com.genx.enums.EPaymentStatus;
import com.genx.enums.EBookingStatus;
import com.genx.enums.ESampleCollectionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface IBookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByPaymentStatus(EPaymentStatus status);

    @Query("""
    SELECT b FROM Booking b
    WHERE (:status IS NULL OR b.status = :status)
      AND (:code IS NULL OR LOWER(b.code) LIKE LOWER(CONCAT('%', :code, '%')))
      AND (:paymentStatus IS NULL OR b.paymentStatus = :paymentStatus)
""")
    Page<Booking> searchByStatusAndCode(
            @Param("status") EBookingStatus status,
            @Param("code") String code,
            @Param("paymentStatus") EPaymentStatus paymentStatus,
            Pageable pageable
    );

    @Query("""
    SELECT b FROM Booking b
    WHERE b.sampleCollection.status = :collectionStatus
      AND (:code IS NULL OR LOWER(b.code) LIKE LOWER(CONCAT('%', :code, '%')))
""")
    Page<Booking> searchBySampleCollectionStatusAndCodeLike(
            @Param("collectionStatus") ESampleCollectionStatus status,
            @Param("code") String code,
            Pageable pageable
    );

    Optional<Booking> findByPayment(Payment payment);

    Optional<Booking> findByPaymentOrderId(String orderId);

    Page<Booking> findByCustomerId(Long customerId, Pageable pageable);

    Page<Booking> findByCustomerIdAndPaymentStatus(Long customerId, EPaymentStatus status, Pageable pageable);

    List<Booking> findBySampleCollectionStatus(ESampleCollectionStatus status);

    boolean existsByCode(String code);

    List<Booking> findTop5ByOrderByCreatedAtDesc();




    @Query("SELECT SUM(b.payment.amount) FROM Booking b WHERE b.paymentStatus = :status AND YEAR(b.createdAt) = :year AND MONTH(b.createdAt) = :month AND DAY(b.createdAt) = :day")
    Optional<Long> sumRevenueByExactDate(@Param("status") EPaymentStatus status,
                                         @Param("day") int day,
                                         @Param("month") int month,
                                         @Param("year") int year);

    @Query("SELECT SUM(b.payment.amount) FROM Booking b WHERE b.paymentStatus = :status AND MONTH(b.createdAt) = :month AND YEAR(b.createdAt) = :year")
    Optional<Long> sumRevenueByMonthAndYear(@Param("status") EPaymentStatus status,
                                            @Param("month") int month,
                                            @Param("year") int year);

    @Query("SELECT SUM(b.payment.amount) FROM Booking b WHERE b.paymentStatus = :status AND YEAR(b.createdAt) = :year")
    Optional<Long> sumRevenueByYear(@Param("status") EPaymentStatus status,
                                    @Param("year") int year);


    long countByPaymentStatus(EPaymentStatus status);



}