package com.genx.mapper;

import com.genx.dto.request.BlogRequestDto;
import com.genx.dto.response.BlogResponseDto;
import com.genx.entity.BlogRate.Blog;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface BlogMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "authorName", source = "createdBy.fullName")
    @Mapping(target = "viewCount", source = "viewCount")
    @Mapping(target = "content", source = "content")
    BlogResponseDto toResponseDto(Blog blog);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "slug", source = "title", qualifiedByName = "generateSlug")
    @Mapping(target = "viewCount", ignore = true)
    Blog toEntity(BlogRequestDto dto);

    @Named("generateSlug")
    default String slugify(String title) {
        return title == null ? null :
                title.toLowerCase()
                        .replaceAll("[^a-z0-9\\s]", "")
                        .replaceAll("\\s+", "-");
    }
}