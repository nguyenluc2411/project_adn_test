package com.genx.service.interfaces;

import com.genx.dto.request.KitStockRequestDto;
import com.genx.dto.response.KitStockResponseDto;

import java.util.List;

public interface IKitStockService {
    List<KitStockResponseDto> getAll();
    KitStockResponseDto getById(Long id);
    KitStockResponseDto create(KitStockRequestDto dto);
    KitStockResponseDto update(Long id, KitStockRequestDto dto);
    void delete(Long id);
}