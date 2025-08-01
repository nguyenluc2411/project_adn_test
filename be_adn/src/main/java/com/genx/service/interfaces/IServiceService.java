package com.genx.service.interfaces;




import com.genx.dto.request.ServiceRequestDto;
import com.genx.dto.response.ServiceResponseDto;
import com.genx.enums.ECaseType;

import java.util.List;

public interface IServiceService {
    ServiceResponseDto createService(ServiceRequestDto dto);
    List<ServiceResponseDto> getAllServices();
    List<ServiceResponseDto> getByCaseType(ECaseType caseType);
    ServiceResponseDto updateService(Long id, ServiceRequestDto dto);
    void toggleEnabled(Long id, boolean enabled);
    void deleteService(Long id);
    List<ServiceResponseDto> getEnabledServicesByCaseType(ECaseType caseType);
}
