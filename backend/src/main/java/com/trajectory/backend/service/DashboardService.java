package com.trajectory.backend.service;

import com.trajectory.backend.dto.DashboardMetricsResponse;
import com.trajectory.backend.dto.DashboardMetricsResponse.AgendaItem;
import com.trajectory.backend.dto.DashboardMetricsResponse.ProfileMetric;
import com.trajectory.backend.dto.DashboardMetricsResponse.ResumePerfMetric;
import com.trajectory.backend.dto.DashboardMetricsResponse.SourceMetric;
import com.trajectory.backend.model.Application;
import com.trajectory.backend.model.Outreach;
import com.trajectory.backend.model.enums.ApplicationStatus;
import com.trajectory.backend.model.enums.OutreachStatus;
import com.trajectory.backend.repository.ApplicationRepository;
import com.trajectory.backend.repository.OutreachRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ApplicationRepository applicationRepository;
    private final OutreachRepository outreachRepository;

    public DashboardService(ApplicationRepository applicationRepository, OutreachRepository outreachRepository) {
        this.applicationRepository = applicationRepository;
        this.outreachRepository = outreachRepository;
    }

    public DashboardMetricsResponse getDashboardMetrics(UUID userId) {
        long total = applicationRepository.countByUserId(userId);
        
        long applied = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.APPLIED);
        long oa = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.OA);
        long interview = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.INTERVIEW);
        long offer = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.OFFER);
        long rejected = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.REJECTED);
        long ghosted = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.GHOSTED);
        long withdrawn = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.WITHDRAWN);

        long active = applied + oa + interview + offer;

        // Conversion Rates
        double responseRate = total > 0 ? (double) (total - applied - withdrawn) / total * 100 : 0.0;
        double interviewConversion = total > 0 ? (double) (interview + offer) / total * 100 : 0.0;
        double offerConversion = total > 0 ? (double) (offer) / total * 100 : 0.0;

        // Temporal metrics
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);
        long appsThisWeek = applicationRepository.countByUserIdAndDateAppliedAfter(userId, sevenDaysAgo);

        LocalDate startOfMonth = YearMonth.now().atDay(1);
        LocalDate endOfMonth = YearMonth.now().atEndOfMonth();
        long appsThisMonth = applicationRepository.countByUserIdAndDateAppliedBetween(userId, startOfMonth, endOfMonth);

        // Resume Performance
        List<ResumePerfMetric> resumePerformance = applicationRepository.getResumePerformance(userId).stream()
                .map(obj -> {
                    int version = ((Number) obj[0]).intValue();
                    String profileTitle = (String) obj[1];
                    long count = ((Number) obj[2]).longValue();
                    long hits = ((Number) obj[3]).longValue();
                    double rate = count > 0 ? (double) hits / count * 100 : 0.0;
                    return new ResumePerfMetric(profileTitle + " (v" + version + ")", rate, count);
                })
                .collect(Collectors.toList());

        // Profile distribution
        List<ProfileMetric> profileDistribution = applicationRepository.getApplicationsByProfile(userId).stream()
                .map(obj -> new ProfileMetric((String) obj[0], (String) obj[1], ((Number) obj[2]).longValue()))
                .collect(Collectors.toList());

        // Source distribution
        List<SourceMetric> sourceDistribution = applicationRepository.getApplicationsBySource(userId).stream()
                .map(obj -> new SourceMetric((String) obj[0], ((Number) obj[1]).longValue()))
                .collect(Collectors.toList());

        // Agenda Items (Interviews, OAs, Follow-ups)
        List<AgendaItem> agenda = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // 1. Fetch upcoming interviews and OAs from Applications
        List<Application> upcomingApps = applicationRepository.findUpcomingAgenda(userId, today);
        for (Application app : upcomingApps) {
            String type = app.getStatus() == ApplicationStatus.OA ? "OA" : "INTERVIEW";
            String link = app.getJobDescriptionUrl(); // Link to meeting if stored, otherwise JD link
            
            agenda.add(new AgendaItem(
                    app.getId().toString(),
                    type,
                    app.getCompanyName(),
                    app.getRoleTitle(),
                    app.getFollowUpDate().toString(),
                    "12:00", // Standard placeholder time
                    link
            ));
        }

        // 2. Fetch upcoming follow-ups from Outreach CRM
        List<OutreachStatus> activeOutreach = List.of(OutreachStatus.PENDING, OutreachStatus.CONTACTED, OutreachStatus.REPLIED);
        List<Outreach> upcomingOutreach = outreachRepository.findPendingFollowUps(userId, today.plusDays(7), activeOutreach);
        for (Outreach out : upcomingOutreach) {
            agenda.add(new AgendaItem(
                    out.getId().toString(),
                    "FOLLOW_UP",
                    out.getCompanyName(),
                    "Outreach: " + out.getContactName(),
                    out.getFollowUpDate() != null ? out.getFollowUpDate().toString() : today.toString(),
                    "09:00",
                    out.getLinkedinUrl()
            ));
        }

        return new DashboardMetricsResponse(
                total,
                active,
                rejected,
                ghosted,
                responseRate,
                interviewConversion,
                offerConversion,
                appsThisWeek,
                appsThisMonth,
                resumePerformance,
                profileDistribution,
                sourceDistribution,
                agenda
        );
    }
}
