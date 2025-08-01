package com.genx.controller;

import com.genx.dto.request.RoomRequest;
import com.genx.dto.response.ApiResponse;
import com.genx.dto.response.MessageResponse;
import com.genx.dto.response.RoomResponse;
import com.genx.dto.response.UserResponse;
import com.genx.entity.Room;
import com.genx.entity.User;
import com.genx.mapper.RoomMapper;
import com.genx.mapper.UserMapper;
import com.genx.service.interfaces.IChatService;
import com.genx.service.interfaces.IRoomService;
import com.genx.service.interfaces.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
public class RoomController {

    @Autowired
    private IRoomService roomService;

    @Autowired
    private IChatService chatService;

    @Autowired
    private RoomMapper roomMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private IUserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<RoomResponse>> createRoom(@RequestBody RoomRequest request) {
        try {
            String roomId = roomService.generateRoomId(request.getCustomerId(), request.getStaffId());
            Room room = roomService.createRoom(roomId, request.getCustomerId(), request.getStaffId());
            RoomResponse response = roomMapper.toRoomResponse(room);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Room created successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1002, e.getMessage()));
        }
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<ApiResponse<RoomResponse>> joinRoom(@PathVariable String roomId, Authentication authentication) {
        try {
            Room room = roomService.getRoomById(roomId);
            if (!roomService.canUserAccessRoom(room)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(1003, "Access denied"));
            }

            RoomResponse response = roomMapper.toRoomResponse(room);
            return ResponseEntity.ok(ApiResponse.success("Room accessed successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(1004, e.getMessage()));
        }
    }


    @GetMapping("/{roomId}/messages")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessages(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        try {
            List<MessageResponse> messages = chatService.getMessagesByRoom(
                    roomId,
                    authentication.getName(),
                    page,
                    size
            );
            return ResponseEntity.ok(ApiResponse.success("Messages retrieved successfully", messages));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(1005, e.getMessage()));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getUserRooms(Authentication authentication) {
        try {
            List<Room> rooms = roomService.getUserRooms(authentication.getName());
            List<RoomResponse> responses = rooms.stream()
                    .map(roomMapper::toRoomResponse)
                    .toList();

            return ResponseEntity.ok(ApiResponse.success("Rooms retrieved successfully", responses));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1006, e.getMessage()));
        }
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<ApiResponse<Void>> deactivateRoom(@PathVariable String roomId, Authentication authentication) {
        try {
            Room room = roomService.getRoomById(roomId);
            if (!authentication.getName().equals(room.getStaff().getUsername())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(1007, "Only staff can deactivate rooms"));
            }

            roomService.deactivateRoom(roomId);
            return ResponseEntity.ok(ApiResponse.success("Room deactivated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1008, e.getMessage()));
        }
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getCustomersForStaff(Authentication authentication) {
        try {
            List<Room> rooms = roomService.getRoomsByStaffEmail(authentication.getName());
            List<RoomResponse> responses = rooms.stream()
                    .map(roomMapper::toRoomResponse)
                    .toList();

            return ResponseEntity.ok(ApiResponse.success("Customer rooms retrieved successfully", responses));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1009, e.getMessage()));
        }
    }

    @GetMapping("/staff-of-customer")
    public ResponseEntity<ApiResponse<RoomResponse>> getRoomOfCustomer(Authentication authentication) {
        try {
            String username = authentication.getName();
            Room room = roomService.getRoomByCustomerUsername(username);

            if (room == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(1009, "No room found for customer"));
            }

            RoomResponse response = roomMapper.toRoomResponse(room);
            return ResponseEntity.ok(ApiResponse.success("Room found", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1010, e.getMessage()));
        }
    }

    @GetMapping("/assign-staff")
    public ResponseEntity<ApiResponse<UserResponse>> assignSupportStaff() {
        try {
            User staff = userService.getStaffWithLeastRooms();
            if (staff == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(404, "Không có nhân viên hỗ trợ khả dụng"));
            }

            return ResponseEntity.ok(ApiResponse.success("Staff assigned", userMapper.toResponse(staff)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(9999, "Failed to assign staff"));
        }
    }



}
