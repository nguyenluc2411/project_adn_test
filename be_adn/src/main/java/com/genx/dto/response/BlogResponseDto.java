package com.genx.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;


@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class BlogResponseDto {
    private Long id;
    private String title;
    private String content;
    private String shortDescription;
    private String thumbnailUrl;
    private String slug;
    private int viewCount;
    private String authorName;
    private LocalDateTime createdAt;
}
