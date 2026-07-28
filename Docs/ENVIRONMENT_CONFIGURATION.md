# Environment Configuration: Trajectory (v1.0.1)

This document provides the canonical specification of all environment variables, configuration parameters, profiles, and property files utilized by **Trajectory**.

---

## 1. Environment Variables Reference

The system relies on externalized environment variables to manage credentials and database URLs across local and production deployment pipelines.

| Variable Name | Environment Scope | Required? | Default / Example Value | Purpose & Target Integration |
| :--- | :--- | :---: | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Backend Container | Yes | `prod` | Specifies the active Spring Boot profile configuration. |
| `JWT_SECRET_KEY` | Backend Container | Yes | `32-byte-hex-secret-key...` | Cryptographic secret for signing HMAC SHA-256 JWT tokens. |
| `SPRING_DATASOURCE_URL` | Backend Container | Yes | `jdbc:postgresql://host:5432/db` | Database connection URL pointing to Postgres. |
| `SPRING_DATASOURCE_USERNAME`| Backend Container | Yes | `postgres` | Database admin access username. |
| `SPRING_DATASOURCE_PASSWORD`| Backend Container | Yes | `secret_password` | Database access credential password. |
| `SPRING_AI_OPENAI_API_KEY` | Backend Container | Yes | `gsk_A1B2C3...` / `mock-key` | API credential key for the Groq Cloud endpoint. |
| `AWS_ACCESS_KEY_ID` | Backend Container | Yes | `AKIAIOSFODNN7EXAMPLE` | IAM access key credential for AWS S3. |
| `AWS_SECRET_ACCESS_KEY` | Backend Container | Yes | `wJalrXUtnFEMI/K7MDENG/bPxRfiCY` | IAM secret access key credential for AWS S3. |
| `AWS_S3_BUCKET_NAME` | Backend Container | Yes | `trajectory-resumes-prod` | Target bucket identifier on AWS S3. |
| `VITE_API_BASE_URL` | Frontend client | Yes | `https://trajectory-api.duckdns.org/api` | REST base URL for Axios client requests. |

---

## 2. Backend Spring Boot Mappings (`application.yml`)

The backend reads environment variables through `backend/src/main/resources/application.yml` mappings:

```yaml
spring:
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:default}
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    driver-class-name: org.postgresql.Driver
  ai:
    openai:
      api-key: ${SPRING_AI_OPENAI_API_KEY:mock-key}
      base-url: https://api.groq.com/openai/v1
      chat:
        options:
          model: llama3-8b-8192

aws:
  s3:
    bucket-name: ${AWS_S3_BUCKET_NAME}
    region: ap-south-1
```

*   **Mock AI Fallback:** If `SPRING_AI_OPENAI_API_KEY` is not provided, it defaults to `mock-key` to activate offline regex mock parsing in `AIService`.
*   **Virtual Threads:** Enabled globally by default in both environments:
    ```yaml
    spring:
      threads:
        virtual:
          enabled: true
    ```

---

## 3. Environment Configuration Files

### 3.1 Local Development (`.env` & Docker Compose)
Local services are configured in `docker-compose.yml`:
*   **Postgres:** Exposes port `5432`, creating database `trajectory_os` with credentials `postgres/password`.
*   **MinIO Storage:** Runs on ports `9000` (API) and `9001` (Console), using access keys `minioadmin/minioadmin`.
*   **Redis Caching:** Exposes port `6379`.

### 3.2 Production Environments (`.env.prod`)
Created on the EC2 host by the GitHub Actions runner. Values are populated from GitHub Repository Secrets.

### 3.3 Frontend Client Environment (`frontend/.env`)
Vite loads environment variables prefixed with `VITE_`:
```env
VITE_API_BASE_URL=https://trajectory-api.duckdns.org/api
```
This is bundled into client assets during Vercel CDN compilation.

---

## Related Documentation
*   [**Documentation Index (Docs/INDEX.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
*   [**Deployment Architecture (Docs/Deployment.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/Deployment.md)
*   [**Provider Strategy (Docs/PROVIDER_STRATEGY.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/PROVIDER_STRATEGY.md)
