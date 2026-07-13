package com.trajectory.backend.controller;

import com.trajectory.backend.dto.ApplicationRequest;
import com.trajectory.backend.dto.ApplicationResponse;
import com.trajectory.backend.model.ApplicationStatusHistory;
import com.trajectory.backend.model.enums.ApplicationStatus;
import com.trajectory.backend.security.UserPrincipal;
import com.trajectory.backend.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public ResponseEntity<Page<ApplicationResponse>> getApplications(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<ApplicationStatus> status,
            @RequestParam(required = false) UUID profileId,
            @RequestParam(defaultValue = "false") boolean isArchived,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dateApplied,desc") String sort) {
        
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        
        Page<ApplicationResponse> response = applicationService.searchApplications(
                principal.getId(), search, status, profileId, isArchived, pageable);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> getApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        ApplicationResponse response = applicationService.getApplication(principal.getId(), id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> createApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ApplicationRequest request) {
        ApplicationResponse response = applicationService.createApplication(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationResponse> updateApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody ApplicationRequest request) {
        ApplicationResponse response = applicationService.updateApplication(principal.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        applicationService.deleteApplication(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<ApplicationStatusHistory>> getStatusHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        List<ApplicationStatusHistory> history = applicationService.getStatusHistory(principal.getId(), id);
        return ResponseEntity.ok(history);
    }
}
