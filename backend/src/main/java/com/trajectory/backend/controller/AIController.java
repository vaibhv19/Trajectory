package com.trajectory.backend.controller;

import com.trajectory.backend.dto.EventExtraction;
import com.trajectory.backend.dto.JobExtraction;
import com.trajectory.backend.dto.OutreachAnalysis;
import com.trajectory.backend.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/parse-jd")
    public ResponseEntity<JobExtraction> parseJobDescription(@RequestBody Map<String, String> body) {
        String text = body.get("text");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        JobExtraction extraction = aiService.extractJobDescription(text);
        return ResponseEntity.ok(extraction);
    }

    @PostMapping("/analyze-outreach")
    public ResponseEntity<OutreachAnalysis> analyzeOutreach(@RequestBody Map<String, String> body) {
        String text = body.get("text");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        OutreachAnalysis analysis = aiService.analyzeOutreachResponse(text);
        return ResponseEntity.ok(analysis);
    }

    @PostMapping("/parse-schedule")
    public ResponseEntity<EventExtraction> parseSchedule(@RequestBody Map<String, String> body) {
        String text = body.get("text");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        EventExtraction extraction = aiService.extractScheduleEvent(text);
        return ResponseEntity.ok(extraction);
    }
}
