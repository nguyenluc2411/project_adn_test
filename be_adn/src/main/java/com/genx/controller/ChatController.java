package com.genx.controller;

import com.genx.dto.request.MessageRequest;
import com.genx.dto.response.MessageResponse;
import com.genx.entity.Message;
import com.genx.entity.User;
import com.genx.repository.IUserRepository;
import com.genx.security.SecurityUtil;
import com.genx.service.interfaces.IChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatController {

    @Autowired
    private IChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private IUserRepository userRepository;

    @MessageMapping("/sendMessage/{roomId}")
    public void sendMessage(@DestinationVariable String roomId,
                            MessageRequest messageRequest,
                            Principal principal) {
        System.out.println("===> Received message for room: " + roomId + " | content: " + messageRequest.getContent());

        if (principal == null) {
            throw new RuntimeException("User not authenticated");
        }

        String email = principal.getName();
        User sender = userRepository.findByUsernameOrEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        messageRequest.setRoomId(roomId);


        Message saved = chatService.saveMessage(messageRequest, sender);


        MessageResponse response = MessageResponse.builder()
                .id(saved.getId())
                .content(saved.getContent())
                .senderId(sender.getId())
                .roomId(roomId)
                .timeStamp(saved.getTimeStamp())
                .build();

        messagingTemplate.convertAndSend("/topic/room/" + roomId, response);
    }

}
