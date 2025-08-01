package com.genx.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "kit_stock")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KitStock {

    @Id
    private Long id = 1L;

    @Column(name = "total_quantity", nullable = false)
    private int totalQuantity;

    @Column(name = "remaining_quantity", nullable = false)
    private int remainingQuantity;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
}
