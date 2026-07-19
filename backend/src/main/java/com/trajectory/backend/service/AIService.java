package com.trajectory.backend.service;

import com.trajectory.backend.dto.JobExtraction;
import com.trajectory.backend.dto.OutreachAnalysis;
import com.trajectory.backend.dto.EventExtraction;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class AIService {

    private final ChatClient chatClient;

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    public AIService(ChatClient.Builder chatClientBuilder) {
        // Build the chat client
        this.chatClient = chatClientBuilder.build();
    }

    private boolean isMockMode() {
        return !StringUtils.hasText(apiKey) || apiKey.equals("mock-key");
    }

    public JobExtraction extractJobDescription(String rawJdText) {
        log.info("Extracting Job Description. Mock Mode: {}", isMockMode());
        if (isMockMode()) {
            return getMockJobExtraction(rawJdText);
        }

        try {
            return chatClient.prompt()
                    .user(u -> u
                            .text("You are an expert Career Data Analyst. Your task is to parse raw job descriptions into structured data for a job tracker. Extract specific company and role details. Return ONLY a valid JSON object. Do not include markdown formatting or conversational text.\n\nText to Parse:\n{raw_jd_text}")
                            .param("raw_jd_text", rawJdText)
                    )
                    .call()
                    .entity(JobExtraction.class);
        } catch (Exception e) {
            log.error("Spring AI extraction failed, falling back to mock extraction: {}", e.getMessage());
            return getMockJobExtraction(rawJdText);
        }
    }

    public OutreachAnalysis analyzeOutreachResponse(String responseText) {
        log.info("Analyzing Outreach Response. Mock Mode: {}", isMockMode());
        if (isMockMode()) {
            return getMockOutreachAnalysis(responseText);
        }

        try {
            return chatClient.prompt()
                    .user(u -> u
                            .text("Analyze the sentiment and intent of this recruiter's response. You must suggest a status update that matches the system's database schema. Suggested status must be exactly one of: CONTACTED, REPLIED, INTERVIEW_SECURED, NO_RESPONSE. Return ONLY a valid JSON object.\n\nRecruiter Response:\n{response_text}")
                            .param("response_text", responseText)
                    )
                    .call()
                    .entity(OutreachAnalysis.class);
        } catch (Exception e) {
            log.error("Spring AI outreach analysis failed, falling back to mock: {}", e.getMessage());
            return getMockOutreachAnalysis(responseText);
        }
    }

    public EventExtraction extractScheduleEvent(String emailBody) {
        log.info("Extracting Schedule Event. Mock Mode: {}", isMockMode());
        if (isMockMode()) {
            return getMockEventExtraction(emailBody);
        }

        try {
            String currentDate = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
            return chatClient.prompt()
                    .user(u -> u
                            .text("You are a Scheduling Assistant. Extract event details from the provided email text. Ensure dates are formatted as YYYY-MM-DD and times use 24-hour format (HH:mm). Current Date: {current_date}. Return ONLY a valid JSON object.\n\nEmail Content:\n{email_body}")
                            .param("current_date", currentDate)
                            .param("email_body", emailBody)
                    )
                    .call()
                    .entity(EventExtraction.class);
        } catch (Exception e) {
            log.error("Spring AI event extraction failed, falling back to mock: {}", e.getMessage());
            return getMockEventExtraction(emailBody);
        }
    }

    // --- Mock Fallbacks ---

    private JobExtraction getMockJobExtraction(String text) {
        String company = "Acme Corp";
        String role = "Software Engineer";
        String location = "Remote";
        String salary = "$100,000 - $130,000";
        String suggestedProfile = "Software Engineer";
        List<String> skills = List.of("Java", "Spring Boot", "React");

        // Simple Regex extraction parsing
        Pattern companyPattern = Pattern.compile("(?i)(company|employer|firm):?\\s*([^\\n]+)");
        Matcher companyMatcher = companyPattern.matcher(text);
        if (companyMatcher.find()) {
            company = companyMatcher.group(2).trim();
        } else if (text.toLowerCase().contains("google")) {
            company = "Google";
            suggestedProfile = "Software Engineer";
        } else if (text.toLowerCase().contains("meta") || text.toLowerCase().contains("facebook")) {
            company = "Meta";
            suggestedProfile = "Product Manager";
        } else if (text.toLowerCase().contains("netflix")) {
            company = "Netflix";
            suggestedProfile = "Frontend Engineer";
        }

        Pattern rolePattern = Pattern.compile("(?i)(role|title|position|job):?\\s*([^\\n]+)");
        Matcher roleMatcher = rolePattern.matcher(text);
        if (roleMatcher.find()) {
            role = roleMatcher.group(2).trim();
        }

        Pattern locPattern = Pattern.compile("(?i)(location|place|site):?\\s*([^\\n]+)");
        Matcher locMatcher = locPattern.matcher(text);
        if (locMatcher.find()) {
            location = locMatcher.group(2).trim();
        }

        return new JobExtraction(company, role, location, skills, salary, suggestedProfile);
    }

    private OutreachAnalysis getMockOutreachAnalysis(String text) {
        String status = "REPLIED";
        String action = "Schedule a 15-minute phone screening next Tuesday.";
        List<String> keyPoints = List.of("Interested in backend experience", "Looking to move quickly");

        if (text.toLowerCase().contains("not interested") || text.toLowerCase().contains("decline") || text.toLowerCase().contains("unfortunately")) {
            status = "NO_RESPONSE";
            action = "Archive the outreach contact.";
            keyPoints = List.of("Position is closed or not a match");
        } else if (text.toLowerCase().contains("schedule") || text.toLowerCase().contains("interview") || text.toLowerCase().contains("chat")) {
            status = "INTERVIEW_SECURED";
            action = "Click 'Convert to Application' to set up the interview tracking details.";
            keyPoints = List.of("Wants to move to formal interview phase");
        }

        return new OutreachAnalysis(status, action, keyPoints);
    }

    private EventExtraction getMockEventExtraction(String text) {
        String eventType = "Technical Interview";
        String eventDate = LocalDate.now().plusDays(2).toString();
        String eventTime = "14:00";
        String link = "https://zoom.us/j/123456789";
        List<String> interviewers = List.of("John Doe (Tech Lead)");
        int duration = 45;

        if (text.toLowerCase().contains("assessment") || text.toLowerCase().contains("hackerrank") || text.toLowerCase().contains("codesignal")) {
            eventType = "OA";
            duration = 90;
            link = "https://codesignal.com/test/xyz";
        }

        Pattern linkPattern = Pattern.compile("https?://[^\\s]+");
        Matcher linkMatcher = linkPattern.matcher(text);
        if (linkMatcher.find()) {
            link = linkMatcher.group(0);
        }

        return new EventExtraction(eventType, eventDate, eventTime, link, interviewers, duration);
    }
}
