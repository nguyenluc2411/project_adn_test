package com.genx.dto.request;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class BlogRequestDto {
    private String title;
    private String shortDescription;
    private String thumbnailUrl;
    private String content;
}
