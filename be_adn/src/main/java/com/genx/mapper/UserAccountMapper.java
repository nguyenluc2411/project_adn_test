package com.genx.mapper;

import com.genx.dto.response.UserProfileResponse;
import com.genx.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface UserAccountMapper {
    @Mappings({
            @Mapping(target = "fullName", source = "fullName"),
            @Mapping(target = "email", source = "email"),
            @Mapping(target = "phoneNumber", source = "phoneNumber"),
            @Mapping(target = "gender", source = "gender"),
            @Mapping(target = "role", expression = "java(user.getRole().name())"),
            @Mapping(target = "dob", ignore = true),
            @Mapping(target = "address", ignore = true),
            @Mapping(target = "avatar", ignore = true),
            @Mapping(target = "startDate", ignore = true)
    })
    UserProfileResponse fromUser(User user);
}
