package com.trajectory.backend.service;

import com.trajectory.backend.dto.ApplicationResponse;
import com.trajectory.backend.dto.OutreachRequest;
import com.trajectory.backend.dto.OutreachResponse;
import com.trajectory.backend.dto.ApplicationRequest;
import com.trajectory.backend.model.Outreach;
import com.trajectory.backend.model.User;
import com.trajectory.backend.model.enums.OutreachStatus;
import com.trajectory.backend.repository.OutreachRepository;
import com.trajectory.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class OutreachService {

    private final OutreachRepository outreachRepository;
    private final UserRepository userRepository;
    private final ApplicationService applicationService;

    public OutreachService(OutreachRepository outreachRepository,
                           UserRepository userRepository,
                           ApplicationService applicationService) {
        this.outreachRepository = outreachRepository;
        this.userRepository = userRepository;
        this.applicationService = applicationService;
    }

    public List<OutreachResponse> getOutreachList(UUID userId, String search, OutreachStatus status) {
        return outreachRepository.searchOutreach(
                userId,
                search == null || search.trim().isEmpty() ? null : search,
                status
        ).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public OutreachResponse getOutreach(UUID userId, UUID id) {
        Outreach outreach = outreachRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Outreach contact not found"));
        return mapToResponse(outreach);
    }

    @Transactional
    public OutreachResponse createOutreach(UUID userId, OutreachRequest request) {
        User user = userRepository.findById(userId).orElseThrow();

        // Validation: Date Sent vs Follow-up Date
        LocalDate dateSent = request.dateSent() != null ? request.dateSent() : LocalDate.now();
        if (request.followUpDate() != null && request.followUpDate().isBefore(dateSent)) {
            throw new IllegalArgumentException("Follow-up date cannot be before the date contact was sent.");
        }

        OutreachStatus status = OutreachStatus.PENDING;
        if (request.status() != null) {
            try {
                status = OutreachStatus.valueOf(request.status().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid outreach status provided: {}, defaulting to PENDING", request.status());
            }
        }

        Outreach outreach = Outreach.builder()
                .user(user)
                .contactName(request.contactName())
                .companyName(request.companyName())
                .positionDiscussed(request.positionDiscussed())
                .email(request.email())
                .linkedinUrl(request.linkedinUrl())
                .status(status)
                .dateSent(dateSent)
                .followUpDate(request.followUpDate())
                .notes(request.notes())
                .build();

        Outreach saved = outreachRepository.save(outreach);
        log.info("Saved outreach contact {} for company {}", saved.getContactName(), saved.getCompanyName());
        return mapToResponse(saved);
    }

    @Transactional
    public OutreachResponse updateOutreach(UUID userId, UUID id, OutreachRequest request) {
        Outreach outreach = outreachRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Outreach contact not found"));

        // Validation: Date Sent vs Follow-up Date
        LocalDate dateSent = request.dateSent() != null ? request.dateSent() : outreach.getDateSent();
        if (request.followUpDate() != null && request.followUpDate().isBefore(dateSent)) {
            throw new IllegalArgumentException("Follow-up date cannot be before the date contact was sent.");
        }

        OutreachStatus status = outreach.getStatus();
        if (request.status() != null) {
            try {
                status = OutreachStatus.valueOf(request.status().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid outreach status provided: {}", request.status());
            }
        }

        outreach.setContactName(request.contactName());
        outreach.setCompanyName(request.companyName());
        outreach.setPositionDiscussed(request.positionDiscussed());
        outreach.setEmail(request.email());
        outreach.setLinkedinUrl(request.linkedinUrl());
        outreach.setStatus(status);
        outreach.setDateSent(dateSent);
        outreach.setFollowUpDate(request.followUpDate());
        outreach.setNotes(request.notes());

        Outreach saved = outreachRepository.save(outreach);
        log.info("Updated outreach contact {}", saved.getId());
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteOutreach(UUID userId, UUID id) {
        Outreach outreach = outreachRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Outreach contact not found"));
        outreachRepository.delete(outreach);
        log.info("Deleted outreach contact {}", id);
    }

    @Transactional
    public ApplicationResponse convertToApplication(UUID userId, UUID outreachId, UUID profileId) {
        Outreach outreach = outreachRepository.findByIdAndUserId(outreachId, userId)
                .orElseThrow(() -> new RuntimeException("Outreach contact not found"));

        // Convert outreach to application
        ApplicationRequest appRequest = new ApplicationRequest(
                outreach.getCompanyName(),
                outreach.getPositionDiscussed() != null ? outreach.getPositionDiscussed() : "Software Engineer",
                profileId,
                null, // suggested resume version will be automatically linked in ApplicationService
                null, // Location unknown
                outreach.getLinkedinUrl(), // JD URL as LinkedIn URL
                "Outreach discussion notes: " + outreach.getNotes() + "\nContact: " + outreach.getContactName() + " (" + outreach.getEmail() + ")",
                "APPLIED",
                "Networking",
                null, // Salary unknown
                LocalDate.now(),
                outreach.getFollowUpDate(),
                null, // Response date unknown
                false // isArchived
        );

        ApplicationResponse appResponse = applicationService.createApplication(userId, appRequest);

        // Mark outreach status as interview secured or contacted
        outreach.setStatus(OutreachStatus.INTERVIEW_SECURED);
        outreachRepository.save(outreach);

        log.info("Successfully converted outreach contact {} into Application {}", outreachId, appResponse.id());
        return appResponse;
    }

    private OutreachResponse mapToResponse(Outreach outreach) {
        return new OutreachResponse(
                outreach.getId(),
                outreach.getContactName(),
                outreach.getCompanyName(),
                outreach.getPositionDiscussed(),
                outreach.getEmail(),
                outreach.getLinkedinUrl(),
                outreach.getStatus().name(),
                outreach.getDateSent(),
                outreach.getFollowUpDate(),
                outreach.getNotes()
        );
    }
}
