package com.genx.repository;

import com.genx.entity.Service;
import com.genx.enums.ECaseType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IServiceRepository extends JpaRepository<Service, Long> {
    Service findByName(String name);

    List<Service> findByCaseType(ECaseType caseType);
    List<Service> findByEnabled(boolean enabled);

    long countByEnabled(boolean enabled);

    List<Service> findByCaseTypeAndEnabledTrue(ECaseType caseType);
}
