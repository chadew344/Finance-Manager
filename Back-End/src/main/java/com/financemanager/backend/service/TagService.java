package com.financemanager.backend.service;

import com.financemanager.backend.dto.CategoryDto;
import com.financemanager.backend.dto.TagDto;

import java.util.List;
import java.util.Optional;

public interface TagService {
    TagDto create(TagDto tagDto, Long userAccountId);

    Optional<TagDto> findById(Long id);

    List<TagDto> findAll();

     List<TagDto> findTagsUserAccountWise(Long userAccountId);

    void delete(Long id);
}
