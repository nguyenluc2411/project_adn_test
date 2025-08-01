package com.genx.mapper;

import com.genx.dto.request.BookingRequest;
import com.genx.dto.response.BookingResponse;
import com.genx.dto.response.BookingSummaryResponse;
import com.genx.entity.Booking;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = ParticipantMapper.class)
public interface BookingMapper {

    @Mapping(target = "caseType", source = "service.caseType")
    @Mapping(target = "id", source = "id")
    @Mapping(source = "service.id", target = "serviceId")
    @Mapping(source = "collectionMethod", target = "collectionMethod")
    @Mapping(source = "paymentStatus", target = "paymentStatus")
    @Mapping(source = "phoneNumber", target = "phoneNumber")
    @Mapping(source = "email", target = "email")
    @Mapping(source = "appointmentDate", target = "appointmentDate")
    @Mapping(source = "participants", target = "participants")
    @Mapping(source = "numberOfParticipants", target = "numberOfParticipants")
    @Mapping(source = "booking.createdAt", target = "createdAt")
    @Mapping(target = "customerName", source = "customer.user.fullName")
    @Mapping(target = "serviceTypeName", source = "service.name")
    @Mapping(target = "servicePrice", source = "service.price")
    @Mapping(target = "recordStaffName", source = "recordStaff.user.fullName")
    @Named("toDTO")
    BookingResponse toDTO(Booking booking);



    @Mapping(source = "serviceId", target = "service.id")
    Booking toEntity(BookingRequest bookingRequest);


    @Mapping(source = "numberOfParticipants", target = "numberOfParticipants")
    @Mapping(target = "caseType", source = "service.caseType")
    @Mapping(target = "id", source = "id")
    @Mapping(target = "customerName", source = "customer.user.fullName")
    @Mapping(target = "recordStaffName", source = "recordStaff.user.fullName")
    @Mapping(target = "serviceId", source = "service.id")
    @Mapping(target = "serviceTypeName", source = "service.name")
    @Mapping(target = "servicePrice", source = "service.price")
    @Mapping(target = "collectionMethod", source = "collectionMethod")
    @Mapping(source = "participants", target = "participants")
    @Mapping(
            target = "sampleCollectionStatus",
            expression = "java(booking.getSampleCollection() != null ? booking.getSampleCollection().getStatus() : null)"
    )
    @Named("toResponse")
    BookingResponse toResponse(Booking booking);


    @Mapping(target = "caseType", source = "service.caseType")
    @Mapping(target = "serviceTypeName", source = "service.name")
    @Mapping(target = "customerName", source = "customer.user.fullName")
    @Mapping(target = "avatar", source = "customer.avatar")
    @Mapping(source = "paymentStatus", target = "paymentStatus")
    BookingSummaryResponse toSummary(Booking booking);
}