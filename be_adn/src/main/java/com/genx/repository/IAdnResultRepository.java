package com.genx.repository;

import com.genx.entity.AdnResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Optional;

@Repository
public interface IAdnResultRepository extends JpaRepository<AdnResult, Long> {

    Optional<AdnResult> findByBooking_Id(Long bookingId);

    Optional<AdnResult> findByTrackingCodeAndTrackingPassword(String trackingCode, String trackingPassword);

    Optional<AdnResult> findByTrackingCode(String trackingCode);

}
