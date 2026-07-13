package com.trajectory.backend.service;

import com.trajectory.backend.dto.ExportDataResponse;
import com.trajectory.backend.model.*;
import com.trajectory.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DataMigrationService {

    private final UserRepository userRepository;
    private final CareerProfileRepository careerProfileRepository;
    private final ResumeRepository resumeRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final OutreachRepository outreachRepository;
    private final CompanyDocumentRepository companyDocumentRepository;

    public DataMigrationService(UserRepository userRepository,
                                CareerProfileRepository careerProfileRepository,
                                ResumeRepository resumeRepository,
                                ApplicationRepository applicationRepository,
                                ApplicationStatusHistoryRepository statusHistoryRepository,
                                OutreachRepository outreachRepository,
                                CompanyDocumentRepository companyDocumentRepository) {
        this.userRepository = userRepository;
        this.careerProfileRepository = careerProfileRepository;
        this.resumeRepository = resumeRepository;
        this.applicationRepository = applicationRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.outreachRepository = outreachRepository;
        this.companyDocumentRepository = companyDocumentRepository;
    }

    @Transactional(readOnly = true)
    public ExportDataResponse exportData(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ExportDataResponse.UserBackup userBackup = new ExportDataResponse.UserBackup(
                user.getEmail(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.getGhostThresholdDays(),
                user.isAutoArchiveEnabled(),
                user.isBrowserNotificationsEnabled(),
                user.isEmailNotificationsEnabled()
        );

        List<CareerProfile> profiles = careerProfileRepository.findByUserId(userId);
        List<ExportDataResponse.CareerProfileBackup> profileBackups = profiles.stream()
                .map(cp -> new ExportDataResponse.CareerProfileBackup(
                        cp.getId(), cp.getTitle(), cp.getColorCode(), cp.getIconIdentifier(), cp.isDefault()))
                .collect(Collectors.toList());

        List<UUID> profileIds = profiles.stream().map(CareerProfile::getId).collect(Collectors.toList());

        List<Resume> resumes = new ArrayList<>();
        for (UUID pid : profileIds) {
            resumes.addAll(resumeRepository.findByCareerProfileId(pid));
        }
        List<ExportDataResponse.ResumeBackup> resumeBackups = resumes.stream()
                .map(r -> new ExportDataResponse.ResumeBackup(
                        r.getId(), r.getCareerProfile().getId(), r.getVersionNumber(), r.getS3Key(), r.getFileName(), r.getChangelog()))
                .collect(Collectors.toList());

        List<Application> applications = applicationRepository.findByUserId(userId);
        List<ExportDataResponse.ApplicationBackup> applicationBackups = applications.stream()
                .map(app -> new ExportDataResponse.ApplicationBackup(
                        app.getId(),
                        app.getCareerProfile().getId(),
                        app.getResume() != null ? app.getResume().getId() : null,
                        app.getCompanyName(),
                        app.getRoleTitle(),
                        app.getLocation(),
                        app.getJobDescriptionUrl(),
                        app.getJobDescriptionRaw(),
                        app.getStatus().name(),
                        app.getSource(),
                        app.getSalaryRange(),
                        app.getDateApplied(),
                        app.getFollowUpDate(),
                        app.getResponseDate(),
                        app.isArchived()
                ))
                .collect(Collectors.toList());

        List<ExportDataResponse.StatusHistoryBackup> historyBackups = new ArrayList<>();
        for (Application app : applications) {
            List<ApplicationStatusHistory> histories = statusHistoryRepository.findByApplicationIdOrderByChangedAtAsc(app.getId());
            for (ApplicationStatusHistory sh : histories) {
                historyBackups.add(new ExportDataResponse.StatusHistoryBackup(
                        sh.getId(), sh.getApplication().getId(), sh.getStatus().name(), sh.getNotes(), sh.getChangedAt()));
            }
        }

        List<Outreach> outreaches = outreachRepository.findByUserId(userId);
        List<ExportDataResponse.OutreachBackup> outreachBackups = outreaches.stream()
                .map(o -> new ExportDataResponse.OutreachBackup(
                        o.getId(),
                        o.getContactName(),
                        o.getCompanyName(),
                        o.getPositionDiscussed(),
                        o.getEmail(),
                        o.getLinkedinUrl(),
                        o.getStatus().name(),
                        o.getDateSent(),
                        o.getFollowUpDate(),
                        o.getNotes()
                ))
                .collect(Collectors.toList());

        List<CompanyDocument> documents = companyDocumentRepository.findByUserId(userId);
        List<ExportDataResponse.DocumentBackup> documentBackups = documents.stream()
                .map(d -> new ExportDataResponse.DocumentBackup(
                        d.getId(), d.getCompanyName(), d.getDocumentName(), d.getS3Key(), d.getDocumentType()))
                .collect(Collectors.toList());

        return new ExportDataResponse(
                userBackup,
                profileBackups,
                resumeBackups,
                applicationBackups,
                historyBackups,
                outreachBackups,
                documentBackups
        );
    }

    @Transactional
    public void importData(UUID userId, ExportDataResponse importData) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Delete all existing user child data to ensure clean import
        List<Application> oldApps = applicationRepository.findByUserId(userId);
        for (Application app : oldApps) {
            statusHistoryRepository.deleteAll(statusHistoryRepository.findByApplicationIdOrderByChangedAtAsc(app.getId()));
        }
        applicationRepository.deleteAll(oldApps);

        List<CareerProfile> oldProfiles = careerProfileRepository.findByUserId(userId);
        for (CareerProfile cp : oldProfiles) {
            resumeRepository.deleteAll(resumeRepository.findByCareerProfileId(cp.getId()));
        }
        careerProfileRepository.deleteAll(oldProfiles);

        outreachRepository.deleteAll(outreachRepository.findByUserId(userId));
        companyDocumentRepository.deleteAll(companyDocumentRepository.findByUserId(userId));

        // 2. Restore User settings
        if (importData.user() != null) {
            user.setFullName(importData.user().fullName());
            user.setAvatarUrl(importData.user().avatarUrl());
            user.setGhostThresholdDays(importData.user().ghostThresholdDays());
            user.setAutoArchiveEnabled(importData.user().autoArchiveEnabled());
            user.setBrowserNotificationsEnabled(importData.user().browserNotificationsEnabled());
            user.setEmailNotificationsEnabled(importData.user().emailNotificationsEnabled());
            userRepository.save(user);
        }

        // 3. Restore Career Profiles
        if (importData.profiles() != null) {
            for (ExportDataResponse.CareerProfileBackup cpBackup : importData.profiles()) {
                CareerProfile cp = CareerProfile.builder()
                        .user(user)
                        .title(cpBackup.title())
                        .colorCode(cpBackup.colorCode())
                        .iconIdentifier(cpBackup.iconIdentifier())
                        .isDefault(cpBackup.isDefault())
                        .build();
                if (cpBackup.id() != null) {
                    cp.setId(cpBackup.id());
                }
                careerProfileRepository.save(cp);
            }
        }

        // 4. Restore Resumes
        if (importData.resumes() != null) {
            for (ExportDataResponse.ResumeBackup rBackup : importData.resumes()) {
                CareerProfile cp = careerProfileRepository.findById(rBackup.profileId()).orElse(null);
                if (cp != null) {
                    Resume r = Resume.builder()
                            .careerProfile(cp)
                            .versionNumber(rBackup.versionNumber())
                            .s3Key(rBackup.s3Key())
                            .fileName(rBackup.fileName())
                            .changelog(rBackup.changelog())
                            .build();
                    if (rBackup.id() != null) {
                        r.setId(rBackup.id());
                    }
                    resumeRepository.save(r);
                }
            }
        }

        // 5. Restore Applications
        if (importData.applications() != null) {
            for (ExportDataResponse.ApplicationBackup appBackup : importData.applications()) {
                CareerProfile cp = careerProfileRepository.findById(appBackup.profileId()).orElse(null);
                if (cp != null) {
                    Resume r = appBackup.resumeId() != null ? resumeRepository.findById(appBackup.resumeId()).orElse(null) : null;
                    Application app = Application.builder()
                            .user(user)
                            .careerProfile(cp)
                            .resume(r)
                            .companyName(appBackup.companyName())
                            .roleTitle(appBackup.roleTitle())
                            .location(appBackup.location())
                            .jobDescriptionUrl(appBackup.jobDescriptionUrl())
                            .jobDescriptionRaw(appBackup.jobDescriptionRaw())
                            .status(com.trajectory.backend.model.enums.ApplicationStatus.valueOf(appBackup.status()))
                            .source(appBackup.source())
                            .salaryRange(appBackup.salaryRange())
                            .dateApplied(appBackup.dateApplied())
                            .followUpDate(appBackup.followUpDate())
                            .responseDate(appBackup.responseDate())
                            .isArchived(appBackup.isArchived())
                            .build();
                    if (appBackup.id() != null) {
                        app.setId(appBackup.id());
                    }
                    applicationRepository.save(app);
                }
            }
        }

        // 6. Restore Status Histories
        if (importData.statusHistories() != null) {
            for (ExportDataResponse.StatusHistoryBackup shBackup : importData.statusHistories()) {
                Application app = applicationRepository.findById(shBackup.applicationId()).orElse(null);
                if (app != null) {
                    ApplicationStatusHistory sh = ApplicationStatusHistory.builder()
                            .application(app)
                            .status(com.trajectory.backend.model.enums.ApplicationStatus.valueOf(shBackup.status()))
                            .notes(shBackup.notes())
                            .changedAt(shBackup.changedAt())
                            .build();
                    if (shBackup.id() != null) {
                        sh.setId(shBackup.id());
                    }
                    statusHistoryRepository.save(sh);
                }
            }
        }

        // 7. Restore Outreach Logs
        if (importData.outreachLogs() != null) {
            for (ExportDataResponse.OutreachBackup oBackup : importData.outreachLogs()) {
                Outreach o = Outreach.builder()
                        .user(user)
                        .contactName(oBackup.contactName())
                        .companyName(oBackup.companyName())
                        .positionDiscussed(oBackup.positionDiscussed())
                        .email(oBackup.email())
                        .linkedinUrl(oBackup.linkedinUrl())
                        .status(com.trajectory.backend.model.enums.OutreachStatus.valueOf(oBackup.status()))
                        .dateSent(oBackup.dateSent())
                        .followUpDate(oBackup.followUpDate())
                        .notes(oBackup.notes())
                        .build();
                if (oBackup.id() != null) {
                    o.setId(oBackup.id());
                }
                outreachRepository.save(o);
            }
        }

        // 8. Restore Company Documents
        if (importData.documents() != null) {
            for (ExportDataResponse.DocumentBackup dBackup : importData.documents()) {
                CompanyDocument d = CompanyDocument.builder()
                        .user(user)
                        .companyName(dBackup.companyName())
                        .documentName(dBackup.documentName())
                        .s3Key(dBackup.s3Key())
                        .documentType(dBackup.documentType())
                        .build();
                if (dBackup.id() != null) {
                    d.setId(dBackup.id());
                }
                companyDocumentRepository.save(d);
            }
        }
    }
}
