package com.genx.service.impl;

import com.genx.dto.request.BlogRatingRequestDto;
import com.genx.dto.response.BlogRatingResponseDto;
import com.genx.dto.response.BlogRatingStatsResponseDto;
import com.genx.entity.BlogRate.Blog;
import com.genx.entity.BlogRate.BlogRating;
import com.genx.entity.User;
import com.genx.repository.BlogRatingRepository;
import com.genx.repository.BlogRepository;
import com.genx.repository.IUserRepository;
import com.genx.service.interfaces.IBlogRatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BlogRatingServiceImpl implements IBlogRatingService {

    @Autowired
    private final BlogRepository blogRepository;

    @Autowired
    private final IUserRepository userRepository;

    @Autowired
    private final BlogRatingRepository blogRatingRepository;

    @Override
    public void rateBlog(Long userId, BlogRatingRequestDto dto) {
        Blog blog = blogRepository.findById(dto.getBlogId())
                .orElseThrow(() -> new RuntimeException("Blog not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BlogRating rating = blogRatingRepository.findByBlogAndUser(blog, user)
                .orElse(BlogRating.builder().blog(blog).user(user).build());

        rating.setRating(dto.getRating());
        blogRatingRepository.save(rating);
    }

    @Override
    public BlogRatingResponseDto getBlogRating(Long blogId) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        List<BlogRating> ratings = blogRatingRepository.findByBlog(blog);
        double average = ratings.stream().mapToDouble(BlogRating::getRating).average().orElse(0.0);
        return BlogRatingResponseDto.builder()
                .blogId(blogId)
                .averageRating(average)
                .totalVotes(ratings.size())
                .build();
    }

    @Override
    public BlogRatingStatsResponseDto getAdminBlogRatingStats(Long blogId) {
        List<BlogRating> ratings = blogRatingRepository.findAllByBlog_Id(blogId);

        Map<Integer, Long> ratingCounts = ratings.stream()
                .collect(Collectors.groupingBy(
                        r -> (int) r.getRating(),
                        Collectors.counting()
                ));

        double average = ratings.stream()
                .mapToDouble(BlogRating::getRating)
                .average().orElse(0);

        return BlogRatingStatsResponseDto.builder()
                .id(blogId)
                .averageRating(average)
                .totalVotes(ratings.size())
                .oneStarVotes(ratingCounts.getOrDefault(1, 0L))
                .twoStarVotes(ratingCounts.getOrDefault(2, 0L))
                .threeStarVotes(ratingCounts.getOrDefault(3, 0L))
                .fourStarVotes(ratingCounts.getOrDefault(4, 0L))
                .fiveStarVotes(ratingCounts.getOrDefault(5, 0L))
                .build();
    }
}
