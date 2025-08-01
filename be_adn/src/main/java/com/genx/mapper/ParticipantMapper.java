package com.genx.mapper;
import com.genx.dto.response.ParticipantResponse;
import com.genx.entity.Participant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface ParticipantMapper {
    @Mapping(source = "fullName", target = "fullName")
    @Mapping(source = "gender", target = "gender")
    @Mapping(source = "yearOfBirth", target = "yearOfBirth")
    @Mapping(source = "identityNumber", target = "identityNumber")
    @Mapping(source = "issueDate", target = "issueDate")
    @Mapping(source = "issuePlace", target = "issuePlace")
    @Mapping(source = "relationship", target = "relationship")
    Participant toEntity(ParticipantResponse participantResponse);


    @Mapping(source = "kit.code", target = "kitCode")
    @Mapping(source = "kit.status", target = "kitStatus")
    @Mapping(source = "kit.assignedBy.fullName", target = "kitAssignedByName")
    @Mapping(source = "kit.assignedAt", target = "kitAssignedAt")
    @Mapping(source = "sampleStatus", target = "sampleStatus")
    @Mapping(source = "sampleType", target = "sampleType")
    @Mapping(source = "fingerprintImageUrl", target = "fingerprintImageUrl")
    ParticipantResponse toResponse(Participant participant);
}