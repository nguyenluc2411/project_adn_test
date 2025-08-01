package com.genx.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BlogRatingRequestDto {
    private Long blogId;
    private int rating;
}