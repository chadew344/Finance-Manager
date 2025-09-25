package com.financemanager.backend.service.impl;

import com.financemanager.backend.dto.TagDto;
import com.financemanager.backend.dto.filter.CategoryFilterDto;
import com.financemanager.backend.dto.filter.FilterDto;
import com.financemanager.backend.dto.filter.FinancialAccFilterDto;
import com.financemanager.backend.dto.filter.TagFilterDto;
import com.financemanager.backend.dto.transaction.TransactionDto;
import com.financemanager.backend.dto.transaction.TransactionLoadResponse;
import com.financemanager.backend.dto.transaction.TransactionTransferRequest;
import com.financemanager.backend.entity.Category;
import com.financemanager.backend.entity.FinancialAccount;
import com.financemanager.backend.entity.Tag;
import com.financemanager.backend.entity.Transaction;
import com.financemanager.backend.enumeration.TransactionType;
import com.financemanager.backend.exception.BusinessException;
import com.financemanager.backend.exception.ErrorCode;
import com.financemanager.backend.mapper.TagMapper;
import com.financemanager.backend.mapper.TransactionMapper;
import com.financemanager.backend.repository.*;
import com.financemanager.backend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionServiceImpl implements TransactionService {
    private final UserAccountRepository userAccountRepository;
    private final TransactionRepository transactionRepository;
    private final FinancialAccountRepository financialAccountRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final TransactionMapper transactionMapper;
    private final TagMapper tagMapper;

//    @Override
//    public TransactionDto create(TransactionDto transactionDto) {
//        // Step 1: Validate that the related entities exist
//        if (!financialAccountRepository.existsById(transactionDto.getFinancialAccountId())) {
//            throw new BusinessException(ErrorCode.INTERNAL_EXCEPTION, "Financial account not found.");
//        }
//        if (!categoryRepository.existsById(transactionDto.getCategoryId())) {
//            throw new BusinessException(ErrorCode.INTERNAL_EXCEPTION, "Category not found.");
//        }
//
//        // Step 2: Convert DTO to Entity
//        Transaction transaction = transactionMapper.toEntity(transactionDto);
//
//        // Step 3: Fetch the related entities from the database and set them
//        transaction.setFinancialAccount(financialAccountRepository.getReferenceById(transactionDto.getFinancialAccountId()));
//        transaction.setCategory(categoryRepository.getReferenceById(transactionDto.getCategoryId()));
//
//        if (transactionDto.getTags() != null && !transactionDto.getTags().isEmpty()) {
//            // Corrected code: Use StreamSupport to get a stream from the Iterable
//            Iterable<Tag> tagsFromDb = tagRepository.findAllById(
//                    transactionDto.getTags().stream().map(TagDto::getId).collect(Collectors.toList())
//            );
//
//            transaction.setTags(
//                    StreamSupport.stream(tagsFromDb.spliterator(), false)
//                            .collect(Collectors.toSet())
//            );
//        }
//
//        // Step 4: Save the transaction
//        Transaction savedTransaction = transactionRepository.save(transaction);
//        return transactionMapper.toDto(savedTransaction);
//    }

    @Transactional
    @Override
    public TransactionDto create(TransactionDto transactionDto, Long userAccountId) {
        FinancialAccount financialAccount = financialAccountRepository.findById(transactionDto.getFinancialAccountId())
                .orElseThrow(() -> new BusinessException(ErrorCode.FINANCIAL_ACCOUNT_NOT_FOUND, "Financial account not found."));

        if (!financialAccount.getUserAccount().getId().equals(userAccountId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS, "You are not authorized to use this financial account.");
        }

        Category category = categoryRepository.findById(transactionDto.getCategoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND, "Category not found."));

        if (!category.getUserAccount().getId().equals(userAccountId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS, "You are not authorized to use this category.");
        }

        Set<Tag> tags = new HashSet<>();
        if (transactionDto.getTagIds() != null && !transactionDto.getTagIds().isEmpty()) {
            tags = new HashSet<>(tagRepository.findAllById(transactionDto.getTagIds()));
            if (tags.stream().anyMatch(tag -> !tag.getUserAccount().getId().equals(userAccountId))) {
                throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS, "One or more tags are not authorized.");
            }
        }

        Transaction transaction = new Transaction();
        transaction.setDescription(transactionDto.getDescription());
        transaction.setAmount(transactionDto.getAmount());
        transaction.setTransactionDate(transactionDto.getTransactionDate());
        transaction.setTransactionType(transactionDto.getTransactionType());

        transaction.setFinancialAccount(financialAccount);
        transaction.setCategory(category);
        transaction.setTags(tags);

        Transaction savedTransaction = transactionRepository.save(transaction);

        FinancialAccount financialAccountAfterTransaction = processTransaction(savedTransaction,  financialAccount);
        financialAccountRepository.save(financialAccountAfterTransaction);

        return transactionMapper.toDto(savedTransaction);
    }


    @Override
    public TransactionDto findById(Long id) {
        return transactionRepository.findById(id)
                .map(transactionMapper::toDto)
                .orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_EXCEPTION, "Transaction not found."));
    }

    @Override
    public List<TransactionDto> findByFinancialAccountId(Long financialAccountId) {
        return transactionRepository.findByFinancialAccount_Id(financialAccountId)
                .stream()
                .map(transactionMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TransactionDto> findByFinancialAccountIdAndDateBetween(
            Long financialAccountId, LocalDateTime startDate, LocalDateTime endDate) {
        return transactionRepository.findByFinancialAccount_IdAndTransactionDateBetween(financialAccountId, startDate, endDate)
                .stream()
                .map(transactionMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.TRANSACTION_NOT_FOUND, "Transaction not found.");
        }
        transactionRepository.deleteById(id);
    }

    @Override
    public FilterDto initializeFiltersAccountWise(Long id) {
        try {
            log.info("Initializing filters for user account ID: {}", id);

            if (!userAccountRepository.existsById(id)) {
                log.warn("User account not found for ID: {}", id);
                throw new BusinessException(ErrorCode.USER_ACCOUNT_NOT_FOUND, "User account not found.");
            }

            List<CategoryFilterDto> categoryFilterDto = getCategoriesOfTheAccount(id);
            List<TagFilterDto> tagFilterDtos = getTagsOfTheAccount(id);
            List<FinancialAccFilterDto> financialAccFilterDtos = getFinancialAccountFilterDtos(id);

            FilterDto result = FilterDto.builder()
                    .categories(categoryFilterDto)
                    .tags(tagFilterDtos)
                    .financialAccounts(financialAccFilterDtos)
                    .build();

            log.info("Successfully initialized filters for user account ID: {}", id);
            return result;

        } catch (BusinessException e) {
            log.error("Business exception while initializing filters for user ID {}: {}", id, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while initializing filters for user ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to initialize filters", e);
        }
    }

    @Override
    public TransactionDto createTransfer(TransactionTransferRequest transactionRequest, Long userAccountId) {
        return null;
    }

    private List<CategoryFilterDto> getCategoriesOfTheAccount(Long userAccountId) {
        try {
            log.debug("Fetching categories for user account ID: {}", userAccountId);
            Set<Category> categories = categoryRepository.findByUserAccount_Id(userAccountId);
            List<CategoryFilterDto> categoryFilterDto = new ArrayList<>();

            if (!categories.isEmpty()) {
                for (Category category : categories) {
                    log.debug("{} = {}", category.getId(), category.getName());
                    categoryFilterDto.add(
                            CategoryFilterDto.builder()
                                    .id(category.getId())
                                    .name(category.getName())
                                    .transactionType(category.getTransactionType())
                                    .build()
                    );
                }
            }
            log.debug("Found {} categories for user account ID: {}", categoryFilterDto.size(), userAccountId);
            return categoryFilterDto;
        } catch (Exception e) {
            log.error("Error fetching categories for user account ID {}: {}", userAccountId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch categories", e);
        }
    }

    private List<TagFilterDto> getTagsOfTheAccount(Long userAccountId) {
        try {
            log.debug("Fetching tags for user account ID: {}", userAccountId);
            Set<Tag> tags = tagRepository.findByUserAccount_Id(userAccountId);
            List<TagFilterDto> tagFilterDto = new ArrayList<>();

            if (!tags.isEmpty()) {
                for (Tag tag : tags) {
                    log.debug("{} = {}", tag.getId(), tag.getName());
                    tagFilterDto.add(
                            TagFilterDto.builder()
                                    .id(tag.getId())
                                    .name(tag.getName())
                                    .build()
                    );
                }
            }
            log.debug("Found {} tags for user account ID: {}", tagFilterDto.size(), userAccountId);
            return tagFilterDto;
        } catch (Exception e) {
            log.error("Error fetching tags for user account ID {}: {}", userAccountId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch tags", e);
        }
    }

    private List<FinancialAccFilterDto> getFinancialAccountFilterDtos(Long userAccountId) {
        try {
            log.debug("Fetching financial accounts for user account ID: {}", userAccountId);
            List<FinancialAccount> financialAccounts = financialAccountRepository.findByUserAccount_Id(userAccountId);
            List<FinancialAccFilterDto> financialAccFilterDtos = new ArrayList<>();

            if (!financialAccounts.isEmpty()) {
                for (FinancialAccount financialAccount : financialAccounts) {
                    log.debug("{} = {}", financialAccount.getId(), financialAccount.getAccountName());
                    financialAccFilterDtos.add(
                            FinancialAccFilterDto.builder()
                                    .id(financialAccount.getId())
                                    .name(financialAccount.getAccountName())
                                    .build());
                }
            }
            log.debug("Found {} financial accounts for user account ID: {}", financialAccFilterDtos.size(), userAccountId);
            return financialAccFilterDtos;
        } catch (Exception e) {
            log.error("Error fetching financial accounts for user account ID {}: {}", userAccountId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch financial accounts", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<TransactionDto> getTransactionsByUserAccount(Long userId, Pageable pageable) {
        Page<Transaction> transactionsPage = transactionRepository.findByFinancialAccount_UserAccount_Id(userId, pageable);
        return transactionsPage.map(transactionMapper::toDto);
    }

    @Override
    public List<TransactionLoadResponse> getTransactionsByUserAccount(Long userId) {
        List<Transaction> transactionList =  transactionRepository.findByFinancialAccount_UserAccount_Id(userId);

        List<TransactionLoadResponse> transactionLoadResponseList = new ArrayList<>();

        for (Transaction transaction : transactionList) {
            transactionLoadResponseList.add(
                    TransactionLoadResponse.builder()
                            .id(transaction.getId())
                            .description(transaction.getDescription())
                            .transactionType(transaction.getTransactionType())
                            .amount(transaction.getAmount())
                            .transactionDate(transaction.getTransactionDate())
                            .financialAccountId(transaction.getFinancialAccount().getId())
                            .financialAccountName(transaction.getFinancialAccount().getAccountName())
                            .categoryId(transaction.getCategory().getId())
                            .categoryName(transaction.getCategory().getName())
                            .tags(getTags(transaction.getTags()))
                            .build()
            );
        }

        return transactionLoadResponseList;
    }


    private List<TagDto> getTags(Set<Tag> tags){
        if (tags == null) return Collections.emptyList();
        return tags.stream()
                .map(tagMapper::toDto)
                .collect(Collectors.toList());
    }

    private FinancialAccount processTransaction(Transaction transaction, FinancialAccount financialAccount) {
        TransactionType transactionType = transaction.getTransactionType();

        BigDecimal amount = transaction.getAmount();
        BigDecimal balance = financialAccount.getBalance();

        if (balance.compareTo(BigDecimal.ZERO) <= 0 && transactionType == TransactionType.EXPENSE) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_BALANCE, "Insufficient Balance to proceed transaction.");
        }

        BigDecimal balanceAfter = switch (transactionType) {
            case INCOME -> balance.add(amount);
            case EXPENSE, TRANSFER -> balance.subtract(amount);
        };

        financialAccount.setBalance(balanceAfter);

        return financialAccount;
    }


}


