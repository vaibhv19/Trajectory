# External Integrations: Trajectory (v1.0.1)

This document provides the technical specifications, endpoints, data contracts, and authentication protocols for all external service integrations in **Trajectory**.

---

## 1. AI Inference Integration (Groq Cloud API)

Trajectory integrates with **Groq Cloud** to leverage Llama 3 models for extracting structured metadata from unstructured text inputs.

*   **API Protocol:** HTTP REST via the OpenAI-compatible chat completions interface.
*   **Production Endpoint:** `https://api.groq.com/openai/v1/chat/completions`
*   **Authentication:** Bearer token authorization using the `SPRING_AI_OPENAI_API_KEY` key.
*   **Model Selection:** Configured to run on **Llama 3** (model identifier: `llama3-8b-8192`).
*   **Data Contracts:**
    *   Requests use system prompt instructions to request JSON format outputs.
    *   Responses map directly to structured Java DTO records (such as `JobExtraction` or `EventExtraction`).
*   **Failsafe Fallback:** If the API key is set to `'mock-key'` or is missing, `AIService` falls back to regex-based JSON simulation.

---

## 2. Object Storage Integration (AWS S3)

Binary files (such as resume PDFs and company documents) are stored using **AWS S3** object storage.

*   **API Protocol:** Standard S3 API over HTTPS.
*   **Client SDK:** AWS Java SDK v2 (`software.amazon.awssdk:s3`).
*   **Target Region:** `ap-south-1` (Mumbai).
*   **Authentication:** Signed requests using AWS IAM credentials (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`).
*   **Data Transport:**
    *   **Uploads:** Byte streams are transmitted using multipart form-data requests.
    *   **Downloads:** The backend generates secure download endpoints by streaming file bytes directly to the client, preventing public exposure of S3 resources.

---

## 3. Social Identity Provider Integrations (Google & GitHub OAuth2)

Trajectory uses Google and GitHub social logins to manage user authentication.

### 3.1 Google Identity Provider
*   **Authorization Endpoint:** `https://accounts.google.com/o/oauth2/v2/auth`
*   **Token Endpoint:** `https://oauth2.googleapis.com/token`
*   **UserInfo Endpoint:** `https://www.googleapis.com/oauth2/v3/userinfo`
*   **Scopes Requested:** `openid`, `email`, `profile`.
*   **Redirect Callback URI:** `https://trajectory-api.duckdns.org/login/oauth2/code/google`

### 3.2 GitHub Identity Provider
*   **Authorization Endpoint:** `https://github.com/login/oauth/authorize`
*   **Token Endpoint:** `https://github.com/login/oauth/access_token`
*   **UserInfo Endpoint:** `https://api.github.com/user`
*   **Scopes Requested:** `read:user`, `user:email`.
*   **Redirect Callback URI:** `https://trajectory-api.duckdns.org/login/oauth2/code/github`

---

## 4. Name Resolution Integration (DuckDNS)

Trajectory uses the **DuckDNS** dynamic DNS service to map public IP addresses to domain names.

*   **Target Domain:** `trajectory-api.duckdns.org`
*   **Configuration:** A cron job script running on the AWS EC2 instance sends periodic requests to DuckDNS to update the subdomain's IP mapping:
    ```bash
    curl -k "https://www.duckdns.org/update?domains=trajectory-api&token=${DUCKDNS_TOKEN}&ip="
    ```
*   **Nginx Routing:** Nginx routes traffic sent to `trajectory-api.duckdns.org` over ports `80` and `443` to the backend application.

---

## Related Documentation
*   [**Documentation Index (Docs/INDEX.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
*   [**Spring AI Prompt Engineering (PromptSkills.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/PromptSkills.md)
*   [**Provider Strategy (Docs/PROVIDER_STRATEGY.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/PROVIDER_STRATEGY.md)
