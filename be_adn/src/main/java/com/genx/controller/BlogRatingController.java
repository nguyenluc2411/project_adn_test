package com.genx.controller;

import com.genx.dto.request.BlogRatingRequestDto;
import com.genx.dto.response.BlogRatingResponseDto;
import com.genx.dto.response.BlogRatingStatsResponseDto;
import com.genx.entity.User;
import com.genx.service.interfaces.IBlogRatingService;
import com.genx.service.interfaces.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogRatingController {

    private final IBlogRatingService blogRatingService;
    private final IUserService userService;

    @PostMapping("/rate")
    public ResponseEntity<Void> rateBlog(@RequestBody BlogRatingRequestDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userService.getUserByUsername(username);
        blogRatingService.rateBlog(user.getId(), dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{blogId}/rating")
    public ResponseEntity<BlogRatingResponseDto> getRating(@PathVariable Long blogId) {
        return ResponseEntity.ok(blogRatingService.getBlogRating(blogId));
    }

    @GetMapping("/{blogId}/ratings-stats")
    public ResponseEntity<BlogRatingStatsResponseDto> getRatingStats(@PathVariable Long blogId) {
        return ResponseEntity.ok(blogRatingService.getAdminBlogRatingStats(blogId));
    }
}