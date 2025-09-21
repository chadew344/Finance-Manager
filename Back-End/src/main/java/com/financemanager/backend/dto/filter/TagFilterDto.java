package com.financemanager.backend.dto.filter;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class TagFilterDto {
    private Long id;
    private String name;
}
