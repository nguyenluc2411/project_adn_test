package com.genx.service.interfaces;

import com.genx.dto.request.MessageRequest;
import com.genx.dto.response.MessageResponse;
import com.genx.entity.Message;
import com.genx.entity.User;

import java.util.List;

public interface IChatService {

    Message saveMessage(MessageRequest request, User sender);

    List<MessageResponse> getMessagesByRoom(String roomId, String authenticatedUserEmail, int page, int size);

    List<String> getUsernamesInRoom(String roomId);
}
