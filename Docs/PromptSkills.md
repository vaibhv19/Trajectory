# Spring AI Prompt Engineering Specification (`PromptSkills.md`)

This document defines the prompt engineering strategy, system prompts, structured JSON schemas, and fallback execution logic for **Trajectory's Spring AI service layer** (`com.trajectory.backend.service.AIService`).

---

## 1. AI Orchestration Strategy

- **Framework:** Spring AI (`spring-ai-openai-spring-boot-starter`) utilizing fluent `ChatClient` Builders and entity response conversion (`.entity(Class<T>)`).
- **Primary Inference Engine:** **Groq Cloud** API (`https://api.groq.com/openai/v1`) using model `llama3-8b-8192`.
- **Output Constraint:** All prompts enforce strict JSON formatting:
  > *"Return ONLY a valid JSON object. Do not include markdown formatting or conversational text."*
- **Mock Fallback System:** `AIService` inspects `spring.ai.openai.api-key`. If the API key is unconfigured, blank, or equals `"mock-key"`, `isMockMode()` evaluates to `true`, and the service routes requests to internal regex-based mock parsing algorithms (`getMockJobExtraction()`, `getMockOutreachAnalysis()`, `getMockEventExtraction()`).

---

## 2. Skill: Job Description (JD) Extraction (`/api/ai/extract-jd`)

### 2.1 Prompt Template
```text
You are an expert Career Data Analyst. Your task is to parse raw job descriptions into structured data for a job tracker. Extract specific company and role details. Return ONLY a valid JSON object. Do not include markdown formatting or conversational text.

Text to Parse:
{raw_jd_text}
```

### 2.2 Target Output DTO (`JobExtraction.java`)
```java
public record JobExtraction(
    String company_name,
    String role_title,
    String location,
    List<String> skills,
    String salary_range,
    String suggested_profile_title
) {}
```

---

## 3. Skill: Schedule Invite Extraction (`/api/ai/extract-event`)

### 3.1 Prompt Template
```text
You are a Scheduling Assistant. Extract event details from the provided email text. Ensure dates are formatted as YYYY-MM-DD and times use 24-hour format (HH:mm). Current Date: {current_date}. Return ONLY a valid JSON object.

Email Content:
{email_body}
```
*Note: `{current_date}` is dynamically injected by `AIService` as `LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)` to resolve relative dates like "tomorrow" or "this Friday".*

### 3.2 Target Output DTO (`EventExtraction.java`)
```java
public record EventExtraction(
    String event_type,
    String event_date,
    String event_time,
    String meeting_link,
    List<String> interviewer_names,
    Integer duration_minutes
) {}
```

---

## 4. Skill: Cold Outreach Sentiment Analysis (`/api/ai/analyze-outreach`)

### 4.1 Prompt Template
```text
Analyze the sentiment and intent of this recruiter's response. You must suggest a status update that matches the system's database schema. Suggested status must be exactly one of: CONTACTED, REPLIED, INTERVIEW_SECURED, NO_RESPONSE. Return ONLY a valid JSON object.

Recruiter Response:
{response_text}
```

### 4.2 Target Output DTO (`OutreachAnalysis.java`)
```java
public record OutreachAnalysis(
    String suggested_status,
    String suggested_action,
    List<String> key_points
) {}
```

---

## 5. Mock Fallback Parsing Logic

When `isMockMode()` is enabled (or when Spring AI encounters external network failure), `AIService` uses internal fallback routines:

```java
private JobExtraction getMockJobExtraction(String text) {
    String company = "Extracted Company";
    String role = "Software Engineer";
    String location = "Remote";
    
    // Pattern matching company name (e.g. "at Google", "Company: Apple")
    Pattern compPattern = Pattern.compile("(?i)(?:at|company:?)\\s+([A-Z][A-Za-z0-9\\s]+)");
    Matcher m = compPattern.matcher(text);
    if (m.find()) {
        company = m.group(1).trim();
    }
    
    return new JobExtraction(company, role, location, List.of("Java", "React", "SQL"), "$120,000 - $150,000", "Software Engineering");
}
```
This ensures zero downtime during local development or when offline.

---

## Related Documentation

- [**Documentation Index (Docs/INDEX.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
- [**REST API Specification (Docs/API_SPECIFICATION.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/API_SPECIFICATION.md)
- [**Application Flow (Docs/App Flow.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/App%20Flow.md)