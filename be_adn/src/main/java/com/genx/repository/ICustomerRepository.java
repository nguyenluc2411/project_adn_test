package com.genx.repository;

import com.genx.entity.Customer;
import com.genx.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ICustomerRepository extends JpaRepository<Customer, Long> {
    Customer findByUserId(Long userId);

    Optional<Customer> findByUser(User user);
}
