package com.genx.service.impl;

import com.genx.dto.request.KitStockRequestDto;
import com.genx.dto.response.KitStockResponseDto;
import com.genx.entity.KitStock;
import com.genx.mapper.KitStockMapper;
import com.genx.repository.IKitStockRepository;
import com.genx.service.interfaces.IKitStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KitStockServiceImpl implements IKitStockService {

    private final IKitStockRepository kitStockRepository;
    private final KitStockMapper kitStockMapper;

    @Override
    public List<KitStockResponseDto> getAll() {
        return kitStockRepository.findAll().stream()
                .map(kitStockMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public KitStockResponseDto getById(Long id) {
        KitStock entity = kitStockRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "KitStock not found with id: " + id));
        return kitStockMapper.toDto(entity);
    }

    @Override
    public KitStockResponseDto create(KitStockRequestDto dto) {
        final long fixedId = 1L;
        int quantityToAdd = dto.getTotalQuantity();

        KitStock entity = kitStockRepository.findById(fixedId).orElse(null);

        if (entity != null) {
            entity.setTotalQuantity(entity.getTotalQuantity() + quantityToAdd);
            entity.setRemainingQuantity(entity.getRemainingQuantity() + quantityToAdd);
        } else {
            entity = KitStock.builder()
                    .id(fixedId)
                    .totalQuantity(quantityToAdd)
                    .remainingQuantity(quantityToAdd)
                    .build();
        }

        entity.setLastUpdated(LocalDateTime.now());
        KitStock saved = kitStockRepository.save(entity);

        return kitStockMapper.toDto(saved);
    }


    @Override
    public KitStockResponseDto update(Long id, KitStockRequestDto dto) {
        KitStock existing = kitStockRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "KitStock not found with id: " + id));

        kitStockMapper.updateEntityFromDto(dto, existing);
        existing.setLastUpdated(LocalDateTime.now());

        KitStock updated = kitStockRepository.save(existing);
        return kitStockMapper.toDto(updated);
    }

    @Override
    public void delete(Long id) {
        if (!kitStockRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "KitStock not found with id: " + id);
        }
        kitStockRepository.deleteById(id);
    }
}
