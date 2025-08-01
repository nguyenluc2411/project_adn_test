package com.genx.controller;

import com.genx.dto.request.KitStockRequestDto;
import com.genx.dto.response.KitStockResponseDto;
import com.genx.service.interfaces.IKitStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/kit-stock")
@RequiredArgsConstructor
public class AdminKitStockController {

    private final IKitStockService kitStockService;

    @GetMapping
    public ResponseEntity<List<KitStockResponseDto>> getAll() {
        return ResponseEntity.ok(kitStockService.getAll());
    }


    @PostMapping
    public ResponseEntity<KitStockResponseDto> create(@RequestBody KitStockRequestDto requestDto) {
        return ResponseEntity.ok(kitStockService.create(requestDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<KitStockResponseDto> update(@PathVariable Long id,
                                                      @RequestBody KitStockRequestDto requestDto) {
        return ResponseEntity.ok(kitStockService.update(id, requestDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        kitStockService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
