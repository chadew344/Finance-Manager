package com.financemanager.backend.dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class TagDto {
    private Long id;
    private String name;
}
