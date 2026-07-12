package com.trajectory.backend.service;

import com.trajectory.backend.dto.CompanyDocumentResponse;
import com.trajectory.backend.model.CompanyDocument;
import com.trajectory.backend.model.User;
import com.trajectory.backend.repository.CompanyDocumentRepository;
import com.trajectory.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CompanyDocumentService {

    private final CompanyDocumentRepository companyDocumentRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    @Value("${aws.s3.bucket.company-docs}")
    private String companyDocsBucket;

    public CompanyDocumentService(CompanyDocumentRepository companyDocumentRepository,
                                  UserRepository userRepository,
                                  StorageService storageService) {
        this.companyDocumentRepository = companyDocumentRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    public List<CompanyDocumentResponse> getDocuments(UUID userId) {
        return companyDocumentRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CompanyDocumentResponse uploadDocument(UUID userId, String companyName, String documentName,
                                                  String documentType, String fileName, byte[] bytes) {
        User user = userRepository.findById(userId).orElseThrow();

        String s3Key = userId.toString() + "/" + UUID.randomUUID() + "_" + fileName;
        storageService.uploadFile(companyDocsBucket, s3Key, bytes, "application/pdf");

        CompanyDocument document = CompanyDocument.builder()
                .user(user)
                .companyName(companyName)
                .documentName(documentName)
                .documentType(documentType)
                .s3Key(s3Key)
                .build();

        CompanyDocument saved = companyDocumentRepository.save(document);
        log.info("Uploaded document {} for company {}", saved.getDocumentName(), saved.getCompanyName());
        return mapToResponse(saved);
    }

    public byte[] downloadDocumentFile(UUID userId, UUID documentId) {
        CompanyDocument document = companyDocumentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        return storageService.downloadFile(companyDocsBucket, document.getS3Key());
    }

    @Transactional
    public void deleteDocument(UUID userId, UUID documentId) {
        CompanyDocument document = companyDocumentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        storageService.deleteFile(companyDocsBucket, document.getS3Key());
        companyDocumentRepository.delete(document);
        log.info("Deleted document {}", documentId);
    }

    private CompanyDocumentResponse mapToResponse(CompanyDocument doc) {
        // Extract original file name from key (remove userId/UUID_)
        String key = doc.getS3Key();
        String fileName = key.substring(key.lastIndexOf("_") + 1);

        return new CompanyDocumentResponse(
                doc.getId(),
                doc.getCompanyName(),
                doc.getDocumentName(),
                doc.getDocumentType(),
                fileName,
                doc.getCreatedAt()
        );
    }
}
