package com.genx.mapper;

import com.genx.dto.response.MessageResponse;
import com.genx.entity.Message;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MessageMapper {

    @Mapping(source = "sender.id", target = "senderId")
    @Mapping(source = "room.roomId", target = "roomId")
    MessageResponse toDto(Message message);
}