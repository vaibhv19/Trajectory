package com.trajectory.backend.controller;

import com.trajectory.backend.dto.CompanyDocumentResponse;
import com.trajectory.backend.security.UserPrincipal;
import com.trajectory.backend.service.CompanyDocumentService;
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
@RequestMapping("/api/documents")
public class CompanyDocumentController {

    private final CompanyDocumentService companyDocumentService;

    public CompanyDocumentController(CompanyDocumentService companyDocumentService) {
        this.companyDocumentService = companyDocumentService;
    }

    @GetMapping
    public ResponseEntity<List<CompanyDocumentResponse>> getDocuments(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<CompanyDocumentResponse> documents = companyDocumentService.getDocuments(principal.getId());
        return ResponseEntity.ok(documents);
    }

    @PostMapping
    public ResponseEntity<CompanyDocumentResponse> uploadDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file,
            @RequestParam("companyName") String companyName,
            @RequestParam("documentName") String documentName,
            @RequestParam(value = "documentType", required = false) String documentType) throws IOException {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        CompanyDocumentResponse response = companyDocumentService.uploadDocument(
                principal.getId(),
                companyName,
                documentName,
                documentType,
                file.getOriginalFilename(),
                file.getBytes()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        byte[] bytes = companyDocumentService.downloadDocumentFile(principal.getId(), id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"document.pdf\"")
                .body(bytes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        companyDocumentService.deleteDocument(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
