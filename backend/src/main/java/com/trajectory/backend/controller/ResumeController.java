package com.trajectory.backend.controller;

import com.trajectory.backend.dto.ResumeResponse;
import com.trajectory.backend.security.UserPrincipal;
import com.trajectory.backend.service.ResumeService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @GetMapping("/profile/{profileId}")
    public ResponseEntity<List<ResumeResponse>> getResumes(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID profileId) {
        List<ResumeResponse> resumes = resumeService.getResumesForProfile(principal.getId(), profileId);
        return ResponseEntity.ok(resumes);
    }

    @PostMapping("/profile/{profileId}")
    public ResponseEntity<ResumeResponse> uploadResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID profileId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "changelog", required = false) String changelog) throws IOException {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        ResumeResponse response = resumeService.uploadResume(
                principal.getId(), 
                profileId, 
                file.getOriginalFilename(), 
                file.getBytes(), 
                changelog
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        byte[] bytes = resumeService.downloadResumeFile(principal.getId(), id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"resume.pdf\"")
                .body(bytes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        resumeService.deleteResume(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
