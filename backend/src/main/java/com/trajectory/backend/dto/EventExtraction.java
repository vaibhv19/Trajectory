package com.trajectory.backend.dto;

import java.util.List;

public record EventExtraction(
    String event_type,
    String event_date,
    String event_time,
    String meeting_link,
    List<String> interviewer_names,
    int duration_minutes
) {}
