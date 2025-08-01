package com.genx.dto.response;
import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogRatingStatsResponseDto {
    private Long id;
    private double averageRating;
    private long totalVotes;
    private long oneStarVotes;
    private long twoStarVotes;
    private long threeStarVotes;
    private long fourStarVotes;
    private long fiveStarVotes;
}
