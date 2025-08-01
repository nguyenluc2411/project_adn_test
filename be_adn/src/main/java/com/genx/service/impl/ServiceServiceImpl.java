package com.genx.service.impl;



import com.genx.dto.request.ServiceRequestDto;
import com.genx.dto.response.ServiceResponseDto;
import com.genx.entity.Service;
import com.genx.enums.ECaseType;
import com.genx.mapper.ServiceMapper;
import com.genx.repository.IServiceRepository;
import com.genx.service.interfaces.IServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;


import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ServiceServiceImpl implements IServiceService {

    @Autowired
    private final IServiceRepository serviceRepository;

    @Autowired
    private final ServiceMapper mapper;

    @Override
    public ServiceResponseDto createService(ServiceRequestDto dto) {
        Service service = mapper.toEntity(dto);
        service.setEnabled(dto.getEnabled() != null ? dto.getEnabled() : true);
        return mapper.toDTO(serviceRepository.save(service));
    }

    @Override
    public List<ServiceResponseDto> getAllServices() {
        return serviceRepository.findAll()
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceResponseDto> getByCaseType(ECaseType caseType) {
        return serviceRepository.findByCaseType(caseType)
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceResponseDto updateService(Long id, ServiceRequestDto dto) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        mapper.updateEntity(service, dto);
        return mapper.toDTO(serviceRepository.save(service));
    }

    @Override
    public void toggleEnabled(Long id, boolean enabled) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        service.setEnabled(enabled);
        serviceRepository.save(service);
    }

    @Override
    public void deleteService(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        serviceRepository.delete(service);
    }

    @Override
    public List<ServiceResponseDto> getEnabledServicesByCaseType(ECaseType caseType) {
        List<Service> services = serviceRepository.findByCaseTypeAndEnabledTrue(caseType);
        return services.stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }
}
