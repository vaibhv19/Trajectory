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

import com.trajectory.backend.exception.ResourceNotFoundException;
import com.trajectory.backend.exception.BadRequestException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CompanyDocumentService {

    private final CompanyDocumentRepository companyDocumentRepository;
    private final UserRepository userRepository;
    private final S3StorageService s3StorageService;

    @Value("${aws.s3.bucket.company-docs}")
    private String companyDocsBucket;

    public CompanyDocumentService(CompanyDocumentRepository companyDocumentRepository,
                                  UserRepository userRepository,
                                  S3StorageService s3StorageService) {
        this.companyDocumentRepository = companyDocumentRepository;
        this.userRepository = userRepository;
        this.s3StorageService = s3StorageService;
    }

    public List<CompanyDocumentResponse> getDocuments(UUID userId) {
        return companyDocumentRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CompanyDocumentResponse uploadDocument(UUID userId, String companyName, String documentName,
                                                  String documentType, String fileName, String contentType, byte[] bytes) {
        validateCompanyDocumentFile(contentType, bytes);
        User user = userRepository.findById(userId).orElseThrow();

        String sanitizedFileName = S3StorageService.sanitizeFilename(fileName);
        String s3Key = "company-docs/" + UUID.randomUUID() + "_" + sanitizedFileName;
        s3StorageService.uploadFile(companyDocsBucket, s3Key, bytes, contentType);

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
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        return s3StorageService.downloadFile(companyDocsBucket, document.getS3Key());
    }

    @Transactional
    public void deleteDocument(UUID userId, UUID documentId) {
        CompanyDocument document = companyDocumentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        s3StorageService.deleteFile(companyDocsBucket, document.getS3Key());
        companyDocumentRepository.delete(document);
        log.info("Deleted document {}", documentId);
    }

    private void validateCompanyDocumentFile(String contentType, byte[] bytes) {
        if (bytes == null || bytes.length > 10 * 1024 * 1024) {
            throw new BadRequestException("File size must not exceed 10MB");
        }

        if (contentType == null || !(
                contentType.equals("application/pdf") ||
                contentType.equals("application/msword") ||
                contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
                contentType.equals("image/jpeg") ||
                contentType.equals("image/png")
        )) {
            throw new BadRequestException("Allowed file types are PDF, Word documents, JPEG, and PNG");
        }
    }

    private CompanyDocumentResponse mapToResponse(CompanyDocument doc) {
        // Extract original file name from key (remove company-docs/UUID_)
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
