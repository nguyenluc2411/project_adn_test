package com.genx.entity.BlogRate;

import com.genx.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "blog_ratings", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "blog_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "blog_id", nullable = false)
    private Blog blog;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private double rating;
}