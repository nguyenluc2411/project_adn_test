package com.genx.repository;

import com.genx.entity.StaffInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IStaffInfoRepository extends JpaRepository<StaffInfo, Long> {

    StaffInfo findByUserId(Long userId);

}
