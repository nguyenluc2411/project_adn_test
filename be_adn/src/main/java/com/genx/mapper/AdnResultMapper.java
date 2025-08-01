package com.genx.mapper;

import com.genx.dto.response.AdnResultResponse;
import com.genx.entity.AdnResult;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = ParticipantMapper.class)
public interface AdnResultMapper {

    @Mapping(target = "participants", ignore = true)
    @Mapping(target = "code", ignore = true)
    AdnResultResponse toDto(AdnResult entity);

    AdnResult toEntity(AdnResultResponse dto);

}