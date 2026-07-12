package com.trajectory.backend.dto;

import java.util.List;

public record DashboardMetricsResponse(
    long totalApplications,
    long activeApplications,
    long rejectedApplications,
    long ghostedApplications,
    double responseRate,
    double interviewConversion,
    double offerConversion,
    long applicationsThisWeek,
    long applicationsThisMonth,
    List<ResumePerfMetric> resumePerformance,
    List<ProfileMetric> profileDistribution,
    List<SourceMetric> sourceDistribution,
    List<AgendaItem> agenda
) {
    public record ResumePerfMetric(String label, double responseRate, long count) {}
    public record ProfileMetric(String title, String colorCode, long count) {}
    public record SourceMetric(String source, long count) {}
    public record AgendaItem(
        String id, 
        String type, // OA, INTERVIEW, FOLLOW_UP
        String companyName, 
        String roleTitle, 
        String date, 
        String time, 
        String link
    ) {}
}
