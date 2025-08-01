package com.genx.repository;

import com.genx.entity.Message;
import com.genx.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IMessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByRoomRoomIdOrderByTimeStampDesc(String roomId);

    Page<Message> findByRoomRoomIdOrderByTimeStampDesc(String roomId, Pageable pageable);

    List<Message> findBySender(User sender);

    @Query("SELECT m FROM Message m WHERE m.room.roomId = :roomId ORDER BY m.timeStamp DESC")
    List<Message> findRecentMessages(@Param("roomId") String roomId, Pageable pageable);
}