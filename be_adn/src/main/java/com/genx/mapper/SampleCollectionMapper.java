package com.genx.mapper;

import com.genx.dto.response.SampleCollectionHistoryResponse;
import com.genx.dto.response.SampleCollectionResponse;
import com.genx.entity.SampleCollection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.Named;

@Mapper(componentModel = "spring", uses = { ParticipantMapper.class })
public interface SampleCollectionMapper {

    @Mapping(target = "collectionId", source = "id")
    @Mapping(target = "bookingRegistrantName", source = "booking.customer.user.fullName")
    @Mapping(target = "collectedByName", source = "collectedBy.user.fullName")
    SampleCollectionResponse toResponse(SampleCollection entity);



    @Named("toHistoryResponse")
    @Mappings({
            @Mapping(target = "collectionId", source = "id"),
            @Mapping(target = "bookingCode", source = "booking.code"),
            @Mapping(target = "customerName", source = "booking.customer.user.fullName"),
            @Mapping(target = "collectionOption", source = "booking.collectionMethod"),
            @Mapping(target = "collectedByName", source = "collectedBy.user.fullName"),
            @Mapping(target = "status", source = "status"),
            @Mapping(target = "note", source = "note"),
            @Mapping(target = "collectedAt", source = "collectedAt"),
            @Mapping(target = "confirmedAt", source = "confirmedAt"),
            @Mapping(target = "participants", source = "booking.participants")
    })
    SampleCollectionHistoryResponse toHistoryResponse(SampleCollection entity);

}
