package com.trajectory.backend.dto;

import java.util.List;

public record JobExtraction(
    String company_name,
    String role_title,
    String location,
    List<String> skills,
    String salary_range,
    String suggested_profile_title
) {}
