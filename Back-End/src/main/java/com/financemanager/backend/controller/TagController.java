package com.financemanager.backend.controller;

import com.financemanager.backend.dto.TagDto;
import com.financemanager.backend.service.TagService;
import com.financemanager.backend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tag")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class TagController {
    private final TagService tagService;

    @PostMapping("/{userAccountId}")
    public ResponseEntity<APIResponse<TagDto>> create(@RequestBody TagDto tagDto,  @PathVariable Long userAccountId) {
        TagDto createdTag = tagService.create(tagDto, userAccountId);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new APIResponse<>(
                        HttpStatus.CREATED.value(),
                        "Tag created successfully.",
                        createdTag
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse<TagDto>> findById(@PathVariable Long id) {
        return tagService.findById(id)
                .map(tagDto -> ResponseEntity.ok(new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Tag fetched successfully.",
                        tagDto
                )))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new APIResponse<>(
                        HttpStatus.NOT_FOUND.value(),
                        "Tag not found.",
                        null
                )));
    }

    @GetMapping("/{id}/tags")
    public ResponseEntity<APIResponse<List<TagDto>>> findTagsUserAccountWise(@PathVariable Long id) {
        List<TagDto> tags = tagService.findTagsUserAccountWise(id);
        return ResponseEntity.ok(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Tags fetched successfully.",
                        tags
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<APIResponse<String>> delete(@PathVariable Long id) {
        tagService.delete(id);
        return ResponseEntity.ok(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Tag deleted successfully.",
                        null
                )
        );
    }
}
