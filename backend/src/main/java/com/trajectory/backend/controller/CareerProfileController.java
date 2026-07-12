package com.trajectory.backend.controller;

import com.trajectory.backend.dto.CareerProfileRequest;
import com.trajectory.backend.dto.CareerProfileResponse;
import com.trajectory.backend.security.UserPrincipal;
import com.trajectory.backend.service.CareerProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
public class CareerProfileController {

    private final CareerProfileService careerProfileService;

    public CareerProfileController(CareerProfileService careerProfileService) {
        this.careerProfileService = careerProfileService;
    }

    @GetMapping
    public ResponseEntity<List<CareerProfileResponse>> getProfiles(@AuthenticationPrincipal UserPrincipal principal) {
        List<CareerProfileResponse> response = careerProfileService.getProfiles(principal.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<CareerProfileResponse> createProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CareerProfileRequest request) {
        CareerProfileResponse response = careerProfileService.createProfile(principal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CareerProfileResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody CareerProfileRequest request) {
        CareerProfileResponse response = careerProfileService.updateProfile(principal.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        careerProfileService.deleteProfile(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
