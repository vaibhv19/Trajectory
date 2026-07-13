package com.trajectory.backend.service;

import com.trajectory.backend.model.*;
import com.trajectory.backend.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final OutreachRepository outreachRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               ApplicationRepository applicationRepository,
                               OutreachRepository outreachRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.outreachRepository = outreachRepository;
    }

    @Transactional(readOnly = true)
    public List<Notification> getNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : notifications) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        }
    }

    @Transactional
    public Notification createNotification(UUID userId, String title, String message, String type) {
        User user = userRepository.findById(userId).orElseThrow();
        Notification n = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        return notificationRepository.save(n);
    }

    @Transactional
    public void generateDailyNotifications(UUID userId) {
        LocalDate today = LocalDate.now();

        // 1. Agenda Alerts: upcoming OAs/Interviews today
        List<Application> upcomingApps = applicationRepository.findUpcomingAgenda(userId, today);
        long todayInterviews = upcomingApps.stream()
                .filter(app -> app.getStatus().name().equals("INTERVIEW") && app.getFollowUpDate().equals(today))
                .count();
        long todayOAs = upcomingApps.stream()
                .filter(app -> app.getStatus().name().equals("OA") && app.getFollowUpDate().equals(today))
                .count();

        if (todayInterviews > 0 || todayOAs > 0) {
            String msg = String.format("You have %d Interview(s) and %d OA(s) scheduled for today. Check your Command Center!", todayInterviews, todayOAs);
            createNotification(userId, "Today's Agenda Alert", msg, "AGENDA");
        }

        // 2. Nudge Alerts: Outreach follow-up dates reached today
        List<Outreach> outreaches = outreachRepository.findByUserId(userId);
        long dueOutreaches = outreaches.stream()
                .filter(o -> o.getFollowUpDate() != null && o.getFollowUpDate().equals(today) && !o.getStatus().name().equals("INTERVIEW_SECURED") && !o.getStatus().name().equals("NO_RESPONSE"))
                .count();

        if (dueOutreaches > 0) {
            String msg = String.format("You have %d recruiter outreach follow-up(s) due today. Keep your discussions active!", dueOutreaches);
            createNotification(userId, "Outreach Follow-up Reminder", msg, "REMINDER");
        }
    }
}
