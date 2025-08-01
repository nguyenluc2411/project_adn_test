package com.genx.service.interfaces;

import com.genx.dto.request.BlogRatingRequestDto;
import com.genx.dto.response.BlogRatingResponseDto;
import com.genx.dto.response.BlogRatingStatsResponseDto;

public interface IBlogRatingService {
    void rateBlog(Long userId, BlogRatingRequestDto dto);
    BlogRatingResponseDto getBlogRating(Long blogId);
    BlogRatingStatsResponseDto getAdminBlogRatingStats(Long blogId);
}