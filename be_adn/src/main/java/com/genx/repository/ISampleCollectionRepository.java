package com.genx.repository;

import com.genx.entity.SampleCollection;
import com.genx.enums.ESampleCollectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ISampleCollectionRepository extends JpaRepository<SampleCollection, Long> {

    Optional<SampleCollection> findByBooking_Id(Long bookingId);

    List<SampleCollection> findByStatusIn(List<ESampleCollectionStatus> statuses);

    List<SampleCollection> findByBooking_CodeContainingIgnoreCaseAndStatusIn(String code, List<ESampleCollectionStatus> statuses);

}
