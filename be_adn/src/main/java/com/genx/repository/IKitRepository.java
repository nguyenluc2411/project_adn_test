package com.genx.repository;

import com.genx.entity.Kit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IKitRepository extends JpaRepository<Kit, Long> {
    boolean existsByCode(String code);
}
