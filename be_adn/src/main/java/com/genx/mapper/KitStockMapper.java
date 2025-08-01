package com.genx.mapper;

import com.genx.dto.request.KitStockRequestDto;
import com.genx.dto.response.KitStockResponseDto;
import com.genx.entity.KitStock;
import org.mapstruct.*;


@Mapper(componentModel = "spring")
public interface KitStockMapper {


    @Mapping(target = "usedQuantity", expression = "java(entity.getTotalQuantity() - entity.getRemainingQuantity())")
    KitStockResponseDto toDto(KitStock entity);


    KitStock toEntity(KitStockRequestDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(KitStockRequestDto dto, @MappingTarget KitStock entity);
}