package com.financemanager.backend.service.impl;

import com.financemanager.backend.dto.TagDto;
import com.financemanager.backend.entity.Tag;
import com.financemanager.backend.entity.UserAccount;
import com.financemanager.backend.exception.BusinessException;
import com.financemanager.backend.exception.ErrorCode;
import com.financemanager.backend.mapper.TagMapper;
import com.financemanager.backend.repository.TagRepository;
import com.financemanager.backend.repository.UserAccountRepository;
import com.financemanager.backend.service.TagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TagServiceImpl implements TagService {
    private final TagRepository tagRepository;
    private final TagMapper tagMapper;
    private final UserAccountRepository userAccountRepository;

    @Override
    public TagDto create(TagDto tagDto,  Long userAccountId) {
        UserAccount userAccount = getCurrentUserAccount(userAccountId);
        Tag tag = tagMapper.toEntity(tagDto);
        tag.setUserAccount(userAccount);

        Tag savedTag = tagRepository.save(tag);
        return tagMapper.toDto(savedTag);
    }

    @Override
    public Optional<TagDto> findById(Long id) {
        return tagRepository.findById(id)
                .map(tagMapper::toDto);
    }

    @Override
    public List<TagDto> findAll() {
        return tagRepository.findAll().stream()
                .map(tagMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TagDto> findTagsUserAccountWise(Long userAccountId) {
        getCurrentUserAccount(userAccountId);
        return tagRepository.findByUserAccount_Id(userAccountId).stream()
                .map(tagMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.TAG_NOT_FOUND, "Tag not found.");
        }
        tagRepository.deleteById(id);
    }

    private UserAccount getCurrentUserAccount(Long userAccountId) {
        return userAccountRepository.findById(userAccountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_ACCOUNT_NOT_FOUND, "User account not found"));
    }
}
