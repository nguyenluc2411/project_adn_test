package com.genx.service.interfaces;



import com.genx.dto.request.BlogRequestDto;
import com.genx.dto.response.BlogResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IBlogService {
    BlogResponseDto createBlog(BlogRequestDto dto, Long userId);
    List<BlogResponseDto> getAllBlogs();
    BlogResponseDto getBlogById(Long id);
    BlogResponseDto updateBlog(Long id, BlogRequestDto dto);
    void deleteBlog(Long id);
    Page<BlogResponseDto> getAllBlogs(Pageable pageable);
}