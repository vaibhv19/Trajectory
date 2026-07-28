# Provider Integration Strategy: Trajectory (v1.0.1)

This document outlines the architecture, configuration parameters, and failover mechanisms for all third-party API and service providers integrated into **Trajectory**.

---

## 1. AI Service Provider Strategy (Spring AI + Groq Cloud)

Trajectory uses AI inference services to extract structured metadata from raw text inputs (job descriptions, schedule invites, recruiter emails).

```
AI Extraction Flow:
[ User Paste Text ] ──► [ AIController ] ──► [ AIService ]
                                                │
                          ┌─────────────────────┴─────────────────────┐
                          ▼ (Groq Key Present?)                       ▼ (Groq Key Omitted / 'mock-key')
             [ Connects to Groq LPU ]                   [ Failsafe Mock Fallback ]
             - Model: Llama 3                           - Regex-based JSON parser
             - API: api.groq.com/openai/v1              - No network requests made
```

### 1.1 Model Configuration
*   **Integration Framework:** Uses **Spring AI** (`spring-ai-openai-spring-boot-starter`) to standardize AI interactions.
*   **Inference API Endpoint:** Connects to the **Groq Cloud** API gateway (`https://api.groq.com/openai/v1`) using OpenAI-compatible payload structures.
*   **AI Model:** Configured to run on **Llama 3** (typically `llama3-8b-8192`) for low latency inference.
*   **Request Design:** Prompts use structured JSON schemas to request JSON responses from the model.

### 1.2 Offline Failsafe Fallback Strategy
*   **Activation Trigger:** If `SPRING_AI_OPENAI_API_KEY` is missing from the environment, is empty, or is explicitly set to `'mock-key'`, `AIService.java` switches to mock mode.
*   **Regex Mock Engine:** The application uses regex parsers to simulate structured entity extraction offline, preventing runtime connection exceptions.

---

## 2. Object Storage Provider Strategy (AWS S3 vs. MinIO)

Trajectory uses binary object storage to persist versioned resumes and company documents.

| Environment | Storage Provider | Endpoint | Access Authentication | Key Namespace Structure |
| :--- | :--- | :--- | :--- | :--- |
| **Local Dev** | MinIO (Docker) | `http://localhost:9000` | Local credentials | `resumes/{profile_id}/v{version_number}_{filename}` |
| **Production**| AWS S3 | Managed S3 Service | AWS IAM User keys | `resumes/{profile_id}/v{version_number}_{filename}` |

### 2.1 Storage Configuration
*   **Client Abstraction:** The backend uses the AWS SDK S3 client interface (`software.amazon.awssdk:s3`), enabling identical API operations across both MinIO and AWS S3 environments.
*   **Endpoint Configuration:**
    *   **Local MinIO:** The storage client uses custom endpoints (`http://localhost:9000`) and enables path-style access (`.forcePathStyle(true)`).
    *   **Production AWS S3:** Connects directly to AWS S3 in the `ap-south-1` region using standard IAM access keys.

### 2.2 Key Mappings
*   **Resumes Table Keys:**
    *   S3 Key format: `resumes/{profile_id}/v{version_number}_{filename}.pdf`
    *   Keeps files isolated by profile and auto-incrementing version counts.
*   **Company Documents Table Keys:**
    *   S3 Key format: `documents/{user_id}/{company_name}/{document_name}`
    *   Keeps documents isolated by user accounts and company names.

---

## 3. Social Identity Provider Strategy (OAuth2)

OAuth2 integrations delegate authentication and profile verification to external identity providers.

### 3.1 Google OAuth2 Provider
*   **Authorization URI:** `https://accounts.google.com/o/oauth2/v2/auth`
*   **Token Exchange URI:** `https://oauth2.googleapis.com/token`
*   **Profile UserInfo URI:** `https://www.googleapis.com/oauth2/v3/userinfo`
*   **Retrieved Attributes:** `email`, `name`, `picture` (mapped to `avatar_url`).

### 3.2 GitHub OAuth2 Provider
*   **Authorization URI:** `https://github.com/login/oauth/authorize`
*   **Token Exchange URI:** `https://github.com/login/oauth/access_token`
*   **Profile UserInfo URI:** `https://api.github.com/user`
*   **Retrieved Attributes:** `email` (requested via primary scope), `name`, `avatar_url`.

---

## Related Documentation
*   [**Documentation Index (Docs/INDEX.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
*   [**Spring AI Prompt Engineering (Docs/PromptSkills.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/PromptSkills.md)
*   [**Authentication & Authorization (Docs/AUTHENTICATION_AUTHORIZATION.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/AUTHENTICATION_AUTHORIZATION.md)
