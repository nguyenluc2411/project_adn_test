package com.genx.mapper;


import com.genx.dto.request.ServiceRequestDto;
import com.genx.dto.response.ServiceResponseDto;

import com.genx.entity.Service;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ServiceMapper {

    Service toEntity(ServiceRequestDto dto);

    ServiceResponseDto toDTO(Service service);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget Service service, ServiceRequestDto dto);
}