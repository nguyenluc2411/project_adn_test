package com.genx.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BlogRatingResponseDto {
    private Long blogId;
    private double averageRating;
    private long totalVotes;
}