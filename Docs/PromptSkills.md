# PromptSkills.md — AI Orchestration Context (Revised for Data Parity)

This document defines the prompt engineering strategy and structured output requirements for the **Spring AI** service layer, fully synchronized with the `schema.sql` and the database ENUMs.

---

## 1. AI Orchestration Strategy
*   **Framework:** Spring AI using `ChatClient` and `StructuredOutputConverter`.
*   **Primary Engine:** Groq Cloud (Llama 3-8b/70b) for high-speed extraction.
*   **Fallback:** Gemini Pro 1.5 via Google AI Studio.
*   **Output Format:** Strict JSON. All prompts must end with the instruction: *"Return ONLY a valid JSON object. Do not include markdown formatting or conversational text."*

---

## 2. Skill: Job Description (JD) Extraction
**Purpose:** Extracts application details from a pasted job posting.

### System Prompt
> You are an expert Career Data Analyst. Your task is to parse raw job descriptions into structured data for a job tracker. Extract specific company and role details.

### Prompt Template
```text
Text to Parse: 
{raw_jd_text}

JSON Schema:
{
  "company_name": "string",
  "role_title": "string",
  "location": "string (Remote/Hybrid/City, State)",
  "skills": ["string"],
  "salary_range": "string",
  "suggested_profile_title": "string (A generic professional category matched to the role, e.g., 'Full Stack Engineer')"
}
```
*Note: `suggested_profile_title` is used by the backend to map the application to an existing Career Profile title.*

---

## 3. Skill: Interview & OA Scheduler Extraction
**Purpose:** Parses emails from recruiters or automated platforms to set calendar events.

### System Prompt
> You are a Scheduling Assistant. Extract event details from the provided email text. Ensure dates are formatted as YYYY-MM-DD and times use 24-hour format.

### Prompt Template
```text
Email Content:
{email_body}

JSON Schema:
{
  "event_type": "string (OA, Technical Interview, HR Screen, Behavioral)",
  "event_date": "YYYY-MM-DD",
  "event_time": "HH:mm",
  "meeting_link": "string (url)",
  "interviewer_names": ["string"],
  "duration_minutes": "integer"
}
```

---

## 4. Skill: Cold Outreach Sentiment Analysis
**Purpose:** Analyzes recruiter responses to update the `outreach` table status.

### System Prompt
> Analyze the sentiment and intent of this recruiter's response. You must suggest a status update that matches the system's database schema.

### Prompt Template
```text
Recruiter Response:
{response_text}

JSON Schema:
{
  "suggested_status": "string (Must be exactly one of: CONTACTED, REPLIED, INTERVIEW_SECURED, NO_RESPONSE)",
  "suggested_action": "string",
  "key_points": ["string"]
}
```
*Note: `suggested_status` matches the `outreach_status` ENUM defined in Schema.sql.*

---

## 5. Technical Implementation (Spring Boot)

### Java DTOs for Extraction
The Spring AI service utilizes these records to map LLM responses directly.

```java
// Synchronized with Section 2
public record JobExtraction(
    String company_name,
    String role_title,
    String location,
    List<String> skills,
    String salary_range,
    String suggested_profile_title
) {}

// Synchronized with Section 3
public record EventExtraction(
    String event_type,
    String event_date,
    String event_time,
    String meeting_link,
    List<String> interviewer_names,
    int duration_minutes
) {}

// Synchronized with Section 4
public record OutreachAnalysis(
    String suggested_status, // Maps to OutreachStatus Enum
    String suggested_action,
    List<String> key_points
) {}
```

### Prompt Execution Logic
1.  **Strict ENUM Mapping:** The backend service should validate that the `suggested_status` from the AI matches the `outreach_status` ENUM values before saving to the database.
2.  **Date Awareness:** Always provide the LLM with `Current Date: {current_date}` to help it resolve relative time expressions.
3.  **Validation Loop:** If the JSON returned is invalid or contains an invalid status ENUM, the service performs one retry with a "Correct the Status to [List of Enums]" instruction.

---

## 6. Safety & Constraints
*   **Anonymization:** Instruct the LLM to ignore Personal Identifiable Information (PII) like the user's home address.
*   **Hallucination Check:** If a field (like Salary) is not present in the text, the value must be `null`, not a guess.