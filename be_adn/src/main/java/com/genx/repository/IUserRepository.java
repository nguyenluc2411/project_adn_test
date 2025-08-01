package com.genx.repository;
import com.genx.entity.User;
import com.genx.enums.ERole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;



@Repository
public interface IUserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u WHERE u.username = :username OR u.email = :username")
    Optional<User> findByUsernameOrEmail(@Param("username") String username);

    Optional<User> findByEmail(String email);

    List<User> findAllByRole(ERole role);

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);


    long countByRole(ERole role);

    long countByRoleIn(List<ERole> roles);

    List<User> findByRole(ERole role);
}
