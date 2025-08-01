package com.genx.service.interfaces;

import com.genx.entity.Room;
import java.util.List;

public interface IRoomService {
    Room getRoomByCustomerUsername(String username);
    Room createRoom(String roomId, Long customerId, Long staffId);
    Room getRoomById(String roomId);
    List<Room> getUserRooms(String userId);
    List<Room> getActiveRooms();
    void deactivateRoom(String roomId);
    boolean canUserAccessRoom(Room room);
    String generateRoomId(Long id1, Long id2);
    List<Room> getRoomsByStaffEmail(String email);
}