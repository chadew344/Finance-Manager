package com.financemanager.backend.mapper;

import com.financemanager.backend.dto.TagDto;
import com.financemanager.backend.entity.Tag;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;

@Mapper(componentModel = "spring")
public interface TagMapper {

    TagDto toDto(Tag tag);

    @Mapping(target = "id", ignore = true)
    Tag toEntity(TagDto tagDto);

    Set<TagDto> toDtoSet(Set<Tag> tags);

    Set<Tag> toEntitySet(Set<TagDto> tagDtos);
}