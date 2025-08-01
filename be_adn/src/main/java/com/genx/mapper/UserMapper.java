package com.genx.mapper;

import com.genx.dto.request.UserRequestDto;
import com.genx.dto.response.UserResponseDto;
import com.genx.dto.request.UserCreationRequest;
import com.genx.dto.response.UserResponse;
import com.genx.entity.User;
import org.mapstruct.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "id", source = "id")
    @Mapping(source = "staffInfo.avatar", target = "avatar")
    @Mapping(source = "staffInfo.fingerprintImageUrl", target = "fingerprintImageUrl")
    @Mapping(source = "staffInfo.startDate", target = "startDate")
    @Mapping(source = "enabled", target = "enabled")
    @Mapping(source = "accountNonLocked", target = "accountNonLocked")
    UserResponseDto toDTO(User user);
    @Mapping(target = "role", expression = "java(com.genx.enums.ERole.CUSTOMER)")
    @Mapping(target = "enabled", constant = "true")
    @Mapping(target = "accountNonLocked", constant = "true")
    @Mapping(target = "authProvider", expression = "java(com.genx.enums.EAuthProvider.SYSTEM)")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toEntity(UserCreationRequest dto);

    User toEntity(UserRequestDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget User user, UserRequestDto dto);

    @Mapping(target = "id", source = "id")
    UserResponse toResponse(User user);
}
