package com.genx.service.impl;

import com.genx.entity.Room;
import com.genx.entity.User;
import com.genx.enums.ERole;
import com.genx.repository.IRoomRepository;
import com.genx.repository.IUserRepository;
import com.genx.security.SecurityUtil;
import com.genx.service.interfaces.IRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class RoomServiceImpl implements IRoomService {

    @Autowired
    private IRoomRepository roomRepository;

    @Autowired
    private IUserRepository userRepository;


    @Override
    public Room getRoomByCustomerUsername(String username) {
        return roomRepository.findByCustomerUsername(username)
                .orElse(null);
    }

    @Override
    public Room createRoom(String roomId, Long customerId, Long staffId) {
        if (roomRepository.findByRoomId(roomId).isPresent()) {
            throw new RuntimeException("Room already exists with ID: " + roomId);
        }
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        if (!customer.getRole().equals(ERole.CUSTOMER)) {
            throw new RuntimeException("User is not a CUSTOMER");
        }

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        if (!staff.getRole().equals(ERole.RECORDER_STAFF)) {
            throw new RuntimeException("User is not a STAFF");
        }
        Room room = new Room();
        room.setRoomId(roomId);
        room.setCustomer(customer);
        room.setStaff(staff);

        return roomRepository.save(room);
    }

    @Override
    public Room getRoomById(String roomId) {
        return roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found with ID: " + roomId));
    }

    @Override
    public List<Room> getUserRooms(String userId) {
        return roomRepository.findUserRooms(userId);
    }

    @Override
    public List<Room> getActiveRooms() {
        return roomRepository.findByIsActiveTrueOrderByLastMessageAtDesc();
    }

    @Override
    public void deactivateRoom(String roomId) {
        Room room = getRoomById(roomId);
        room.setIsActive(false);
        roomRepository.save(room);
    }

    @Override
    public boolean canUserAccessRoom(Room room) {
        if (room == null) return false;

        Optional<Long> currentUserIdOpt = SecurityUtil.getCurrentUserId();
        if (currentUserIdOpt.isEmpty()) return false;

        Long userId = currentUserIdOpt.get();

        return (room.getCustomer() != null && Objects.equals(userId, room.getCustomer().getId())) ||
                (room.getStaff() != null && Objects.equals(userId, room.getStaff().getId()));
    }


    @Override
    public String generateRoomId(Long id1, Long id2) {
        long smaller = Math.min(id1, id2);
        long larger = Math.max(id1, id2);
        return "room_" + smaller + "_" + larger;
    }

    @Override
    public List<Room> getRoomsByStaffEmail(String email) {
        User staff = userRepository.findByUsernameOrEmail(email)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        return roomRepository.findByStaffId(staff.getId());
    }


}