package com.trajectory.backend.dto;

import java.util.List;

public record OutreachAnalysis(
    String suggested_status,
    String suggested_action,
    List<String> key_points
) {}
