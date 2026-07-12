package com.trajectory.backend.controller;

import com.trajectory.backend.dto.DashboardMetricsResponse;
import com.trajectory.backend.security.UserPrincipal;
import com.trajectory.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<DashboardMetricsResponse> getMetrics(@AuthenticationPrincipal UserPrincipal principal) {
        DashboardMetricsResponse metrics = dashboardService.getDashboardMetrics(principal.getId());
        return ResponseEntity.ok(metrics);
    }
}
