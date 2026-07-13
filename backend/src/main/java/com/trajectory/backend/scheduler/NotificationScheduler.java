package com.trajectory.backend.scheduler;

import com.trajectory.backend.model.User;
import com.trajectory.backend.repository.UserRepository;
import com.trajectory.backend.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Slf4j
public class NotificationScheduler {

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public NotificationScheduler(UserRepository userRepository, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // Run every day at 7:00 AM
    @Scheduled(cron = "0 0 7 * * ?")
    @Transactional
    public void generateDailyAlerts() {
        log.info("Starting automated morning notification digest job...");
        List<User> users = userRepository.findAll();
        for (User u : users) {
            try {
                notificationService.generateDailyNotifications(u.getId());
            } catch (Exception e) {
                log.error("Failed to generate daily notifications for user: {}", u.getEmail(), e);
            }
        }
        log.info("Finished automated morning notification digest job.");
    }
}
