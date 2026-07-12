package com.trajectory.backend.controller;

import com.trajectory.backend.dto.ApplicationResponse;
import com.trajectory.backend.dto.OutreachRequest;
import com.trajectory.backend.dto.OutreachResponse;
import com.trajectory.backend.model.enums.OutreachStatus;
import com.trajectory.backend.security.UserPrincipal;
import com.trajectory.backend.service.OutreachService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/outreach")
public class OutreachController {

    private final OutreachService outreachService;

    public OutreachController(OutreachService outreachService) {
        this.outreachService = outreachService;
    }

    @GetMapping
    public ResponseEntity<List<OutreachResponse>> getOutreach(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) OutreachStatus status) {
        List<OutreachResponse> response = outreachService.getOutreachList(principal.getId(), search, status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OutreachResponse> getOutreachById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        OutreachResponse response = outreachService.getOutreach(principal.getId(), id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<OutreachResponse> createOutreach(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody OutreachRequest request) {
        OutreachResponse response = outreachService.createOutreach(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OutreachResponse> updateOutreach(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody OutreachRequest request) {
        OutreachResponse response = outreachService.updateOutreach(principal.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOutreach(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        outreachService.deleteOutreach(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/convert")
    public ResponseEntity<ApplicationResponse> convertToApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        
        String profileIdStr = body.get("profileId");
        if (profileIdStr == null) {
            return ResponseEntity.badRequest().build();
        }

        UUID profileId = UUID.fromString(profileIdStr);
        ApplicationResponse response = outreachService.convertToApplication(principal.getId(), id, profileId);
        return ResponseEntity.ok(response);
    }
}
