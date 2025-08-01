package com.genx.service.impl;

import com.genx.dto.request.MessageRequest;
import com.genx.dto.response.MessageResponse;
import com.genx.entity.Message;
import com.genx.entity.Room;
import com.genx.entity.User;
import com.genx.repository.IMessageRepository;
import com.genx.repository.IRoomRepository;
import com.genx.service.interfaces.IChatService;
import com.genx.service.interfaces.IRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatServiceImpl implements IChatService {

    private final IMessageRepository messageRepository;
    private final IRoomRepository roomRepository;
    private final IRoomService roomService;

    @Override
    public Message saveMessage(MessageRequest request, User sender) {
        Room room = roomRepository.findByRoomId(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found: " + request.getRoomId()));
        if (room == null || !canUserAccessRoom(room, sender)) {
            throw new RuntimeException("Room not found or access denied");
        }

        Message message = new Message();
        message.setSender(sender);
        message.setRoom(room);
        message.setContent(request.getContent());
        message.setTimeStamp(LocalDateTime.now());

        room.setLastMessageAt(LocalDateTime.now());
        roomRepository.save(room);

        return messageRepository.save(message);
    }

    @Override
    public List<MessageResponse> getMessagesByRoom(String roomId, String authenticatedUserEmail, int page, int size) {
        Room room = roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));

        if (!roomService.canUserAccessRoom(room)) {
            throw new RuntimeException("User not authorized to access this room");
        }

        Pageable pageable = PageRequest.of(page, size);
        List<Message> messages = messageRepository.findByRoomRoomIdOrderByTimeStampDesc(roomId);

        return messages.stream()
                .map(msg -> MessageResponse.builder()
                        .id(msg.getId())
                        .content(msg.getContent())
                        .senderId(msg.getSender().getId())
                        .roomId(roomId)
                        .timeStamp(msg.getTimeStamp())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getUsernamesInRoom(String roomId) {
        Room room = roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));

        return List.of(
                room.getCustomer().getUsername(),
                room.getStaff().getUsername()
        );
    }

    private boolean canUserAccessRoom(Room room, User user) {
        return user.getId().equals(room.getCustomer().getId()) || user.getId().equals(room.getStaff().getId());
    }
}
