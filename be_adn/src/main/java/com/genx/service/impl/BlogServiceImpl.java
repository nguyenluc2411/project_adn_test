package com.genx.service.impl;



import com.genx.dto.request.BlogRequestDto;
import com.genx.dto.response.BlogResponseDto;
import com.genx.entity.BlogRate.Blog;
import com.genx.entity.User;
import com.genx.mapper.BlogMapper;
import com.genx.repository.BlogRatingRepository;
import com.genx.repository.BlogRepository;
import com.genx.repository.IUserRepository;
import com.genx.service.interfaces.IBlogService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BlogServiceImpl implements IBlogService {

    @Autowired
    private final BlogRepository blogRepository;

    @Autowired
    private final IUserRepository userRepository;

    @Autowired
    private final BlogMapper blogMapper;

    @Autowired
    private final BlogRatingRepository blogRatingRepository;

    @Override
    public BlogResponseDto createBlog(BlogRequestDto dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Blog blog = blogMapper.toEntity(dto);
        blog.setCreatedAt(LocalDateTime.now());
        blog.setCreatedBy(user);

        return blogMapper.toResponseDto(blogRepository.save(blog));
    }

    @Override
    public List<BlogResponseDto> getAllBlogs() {
        return blogRepository.findAll().stream()
                .map(blogMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BlogResponseDto getBlogById(Long id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found with id: " + id));

        blog.setViewCount(blog.getViewCount() + 1);
        blogRepository.save(blog);

        return blogMapper.toResponseDto(blog);
    }


    private String generateSlug(String title) {
        return title == null ? null :
                title.toLowerCase()
                        .replaceAll("[^a-z0-9\\s]", "")
                        .replaceAll("\\s+", "-");
    }
    @Override
    public BlogResponseDto updateBlog(Long id, BlogRequestDto dto) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        blog.setTitle(dto.getTitle());
        blog.setShortDescription(dto.getShortDescription());
        blog.setThumbnailUrl(dto.getThumbnailUrl());
        blog.setContent(dto.getContent());
        blog.setSlug(generateSlug(dto.getTitle()));
        blog.setCreatedAt(LocalDateTime.now());

        return blogMapper.toResponseDto(blogRepository.save(blog));
    }

    @Transactional
    @Override
    public void deleteBlog(Long id) {
        System.out.println("🔍 Start deleteBlog ID = " + id);
        if (!blogRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found");
        }
        blogRatingRepository.deleteByBlog_Id(id);
        blogRepository.deleteById(id);
    }

    @Override
    public Page<BlogResponseDto> getAllBlogs(Pageable pageable) {
        return blogRepository.findAll(pageable)
                .map(blogMapper::toResponseDto);
    }


}
