package com.trajectory.backend.scheduler;

import com.trajectory.backend.model.Application;
import com.trajectory.backend.model.ApplicationStatusHistory;
import com.trajectory.backend.model.enums.ApplicationStatus;
import com.trajectory.backend.repository.ApplicationRepository;
import com.trajectory.backend.repository.ApplicationStatusHistoryRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Component
@Slf4j
public class GhostDetectionScheduler {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;

    public GhostDetectionScheduler(ApplicationRepository applicationRepository,
                                   ApplicationStatusHistoryRepository statusHistoryRepository) {
        this.applicationRepository = applicationRepository;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    // Run every day at 1:00 AM
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void detectGhostedApplications() {
        log.info("Starting automated ghost application detection job...");
        
        List<ApplicationStatus> activeStatuses = List.of(
                ApplicationStatus.APPLIED, 
                ApplicationStatus.OA, 
                ApplicationStatus.INTERVIEW
        );

        // We can fetch applications that are in active status
        // Since different users have different thresholds, we will load active ones and compare
        List<Application> activeApplications = applicationRepository.findByStatusNotInAndLastActivityAtBefore(
                List.of(ApplicationStatus.OFFER, ApplicationStatus.REJECTED, ApplicationStatus.GHOSTED, ApplicationStatus.WITHDRAWN),
                OffsetDateTime.now().minusDays(7) // Retrieve anything that hasn't been active for at least 7 days to check
        );

        int ghostCount = 0;
        OffsetDateTime now = OffsetDateTime.now();

        for (Application app : activeApplications) {
            int thresholdDays = app.getUser().getGhostThresholdDays();
            OffsetDateTime thresholdDate = now.minusDays(thresholdDays);

            if (app.getLastActivityAt().isBefore(thresholdDate)) {
                log.info("Application ID {} for company {} in role {} has exceeded inactivity threshold of {} days. Transitioning to GHOSTED.",
                        app.getId(), app.getCompanyName(), app.getRoleTitle(), thresholdDays);

                app.setStatus(ApplicationStatus.GHOSTED);
                app.setLastActivityAt(now);
                applicationRepository.save(app);

                // Create status change history
                ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                        .application(app)
                        .status(ApplicationStatus.GHOSTED)
                        .notes("Automated ghost detection: No activity for " + thresholdDays + " days.")
                        .build();
                statusHistoryRepository.save(history);

                ghostCount++;
            }
        }

        log.info("Ghost application detection job completed. Flagged {} applications.", ghostCount);
    }
}
