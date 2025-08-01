package com.genx.repository;

import com.genx.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IRoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomId(String roomId);

    List<Room> findByStaffId(Long staffId);

    List<Room> findByCustomer_Id(Long customerId);

    List<Room> findByStaff_Id(Long staffId);


    @Query("SELECT r FROM Room r WHERE r.customer.username = :userId OR r.staff.username = :userId")
    List<Room> findUserRooms(@Param("userId") String userId);

    List<Room> findByIsActiveTrueOrderByLastMessageAtDesc();

    @Query("SELECT r FROM Room r WHERE r.customer.username = :username AND r.isActive = true")
    Optional<Room> findByCustomerUsername(@Param("username") String username);

    @Query("SELECT COUNT(r) FROM Room r WHERE r.staff.id = :staffId AND r.isActive = true")
    int countByStaffId(@Param("staffId") Long staffId);

}