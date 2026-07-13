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

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final CareerProfileRepository careerProfileRepository;
    private final StorageService storageService;

    @Value("${aws.s3.bucket.resumes}")
    private String resumesBucket;

    public ResumeService(ResumeRepository resumeRepository,
                         CareerProfileRepository careerProfileRepository,
                         StorageService storageService) {
        this.resumeRepository = resumeRepository;
        this.careerProfileRepository = careerProfileRepository;
        this.storageService = storageService;
    }

    @Transactional(readOnly = true)
    public List<ResumeResponse> getResumesForProfile(UUID userId, UUID profileId) {
        // Validate profile ownership
        CareerProfile profile = careerProfileRepository.findById(profileId)
                .filter(p -> p.getUser().getId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Career profile not found"));

        return resumeRepository.findByCareerProfileIdOrderByVersionNumberDesc(profileId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ResumeResponse uploadResume(UUID userId, UUID profileId, String fileName, byte[] bytes, String changelog) {
        CareerProfile profile = careerProfileRepository.findById(profileId)
                .filter(p -> p.getUser().getId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Career profile not found"));

        // Determine next version number
        Optional<Resume> latestResume = resumeRepository.findFirstByCareerProfileIdOrderByVersionNumberDesc(profileId);
        int nextVersion = latestResume.map(resume -> resume.getVersionNumber() + 1).orElse(1);

        // Upload file to MinIO
        String s3Key = profileId.toString() + "/v" + nextVersion + "_" + fileName;
        storageService.uploadFile(resumesBucket, s3Key, bytes, "application/pdf");

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
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        return storageService.downloadFile(resumesBucket, resume.getS3Key());
    }

    @Transactional
    public void deleteResume(UUID userId, UUID resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .filter(r -> r.getCareerProfile().getUser().getId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        // Delete from MinIO
        storageService.deleteFile(resumesBucket, resume.getS3Key());

        // Delete from database
        resumeRepository.delete(resume);
        log.info("Deleted resume v{} for profile ID: {}", resume.getVersionNumber(), resume.getCareerProfile().getId());
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
