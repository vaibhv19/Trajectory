package com.trajectory.backend.service;

import com.trajectory.backend.dto.ResumeResponse;
import com.trajectory.backend.model.CareerProfile;
import com.trajectory.backend.model.Resume;
import com.trajectory.backend.repository.CareerProfileRepository;
import com.trajectory.backend.repository.ResumeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.trajectory.backend.exception.ResourceNotFoundException;
import com.trajectory.backend.exception.BadRequestException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final CareerProfileRepository careerProfileRepository;
    private final S3StorageService s3StorageService;

    @Value("${aws.s3.bucket.resumes}")
    private String resumesBucket;

    public ResumeService(ResumeRepository resumeRepository,
                         CareerProfileRepository careerProfileRepository,
                         S3StorageService s3StorageService) {
        this.resumeRepository = resumeRepository;
        this.careerProfileRepository = careerProfileRepository;
        this.s3StorageService = s3StorageService;
    }

    @Transactional(readOnly = true)
    public List<ResumeResponse> getResumesForProfile(UUID userId, UUID profileId) {
        // Validate profile ownership
        careerProfileRepository.findById(profileId)
                .filter(p -> p.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Career profile not found"));

        return resumeRepository.findByCareerProfileIdOrderByVersionNumberDesc(profileId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ResumeResponse uploadResume(UUID userId, UUID profileId, String fileName, String contentType, byte[] bytes, String changelog) {
        validateResumeFile(contentType, bytes);

        CareerProfile profile = careerProfileRepository.findById(profileId)
                .filter(p -> p.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Career profile not found"));

        // Determine next version number
        Optional<Resume> latestResume = resumeRepository.findFirstByCareerProfileIdOrderByVersionNumberDesc(profileId);
        int nextVersion = latestResume.map(resume -> resume.getVersionNumber() + 1).orElse(1);

        // Upload file to S3 under resumes/ folder
        String sanitizedFileName = S3StorageService.sanitizeFilename(fileName);
        String s3Key = "resumes/" + UUID.randomUUID() + "_" + sanitizedFileName;
        s3StorageService.uploadFile(resumesBucket, s3Key, bytes, contentType);

        Resume resume = Resume.builder()
                .careerProfile(profile)
                .versionNumber(nextVersion)
                .s3Key(s3Key)
                .fileName(fileName)
                .changelog(changelog)
                .build();

        Resume saved = resumeRepository.save(resume);
        log.info("Saved resume v{} for profile {}", nextVersion, profile.getTitle());
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public byte[] downloadResumeFile(UUID userId, UUID resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .filter(r -> r.getCareerProfile().getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        return s3StorageService.downloadFile(resumesBucket, resume.getS3Key());
    }

    @Transactional
    public void deleteResume(UUID userId, UUID resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .filter(r -> r.getCareerProfile().getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        // Delete from S3
        s3StorageService.deleteFile(resumesBucket, resume.getS3Key());

        // Delete from database
        resumeRepository.delete(resume);
        log.info("Deleted resume v{} for profile ID: {}", resume.getVersionNumber(), resume.getCareerProfile().getId());
    }

    private void validateResumeFile(String contentType, byte[] bytes) {
        if (bytes == null || bytes.length > 10 * 1024 * 1024) {
            throw new BadRequestException("File size must not exceed 10MB");
        }

        if (contentType == null || !(
                contentType.equals("application/pdf") ||
                contentType.equals("application/msword") ||
                contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        )) {
            throw new BadRequestException("Only PDF and Word documents are allowed for resumes");
        }
    }

    private ResumeResponse mapToResponse(Resume resume) {
        return new ResumeResponse(
                resume.getId(),
                resume.getCareerProfile().getId(),
                resume.getVersionNumber(),
                resume.getFileName(),
                resume.getChangelog(),
                resume.getCreatedAt()
        );
    }
}
