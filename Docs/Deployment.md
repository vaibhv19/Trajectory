# Deployment Architecture: Trajectory (v1.0.1)

This document provides the canonical technical specification for the production deployment architecture, cloud infrastructure configuration, Nginx gateway parameters, HTTPS SSL/TLS management, and GitHub Actions CI/CD workflows of **Trajectory**.

---

## 1. Production Deployment Topology

The production ecosystem runs as a decoupled full-stack architecture distributed across edge networks, hosting gateways, container services, and managed persistence clusters.

```
                                [ Public Internet ]
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼ (Port 443 HTTPS)                                                ▼ (Static Asset CDN)
[ Nginx Reverse Proxy (AWS EC2) ]                               [ Vercel Edge CDN ]
        │ (SSL Termination / Headers)                                     │ (Static Assets / SPA Routing)
        ▼ (Port 8080 HTTP Loopback)                                       │
[ Spring Boot Docker Container ]                                          │
        │                                                                 │
        ├─ (AWS SDK ap-south-1) ──────────► [ AWS S3 Bucket ] ◄───────────┘ (Direct presigned downloads)
        │
        └─ (TCP Port 5432) ──────────────► [ AWS RDS PostgreSQL 16 ]
```

### 1.1 Service Layout Mappings

| Component | Technology | Environment / Hosting | Network Configuration |
| :--- | :--- | :--- | :--- |
| **Frontend SPA** | React 19 + TypeScript | Vercel Edge Network | Globally distributed static hosting. Connects to backend API base. |
| **Backend REST API** | Java 21 + Spring Boot 3.3.1 | Docker Container on AWS EC2 | Runs internally on port `8080`. Public ingress via Nginx proxy. |
| **Database** | PostgreSQL 16 | AWS RDS (Managed Subnet) | Accessible only via port `5432` from EC2's security group. |
| **Object Storage** | AWS S3 Bucket | AWS Cloud (`ap-south-1` region) | Accessible via IAM keys. Streams versioned resumes and documents. |
| **Ingress Gateway** | Nginx | AWS EC2 (Ubuntu 24.04 LTS) | Listens on ports `80` (HTTP) and `443` (HTTPS). Proxies loopback. |
| **SSL / Certs** | Let's Encrypt Certbot | AWS EC2 (Native service) | Handles domain verification via HTTP-01 challenges. |
| **CI/CD Runner** | GitHub Actions Runner | AWS EC2 (Systemd Service) | Outbound-only polling on port `443` to execute rebuild scripts. |

---

## 2. Docker & Containerization Orchestration

### 2.1 Multi-Stage Dockerfile (`backend/Dockerfile`)
The backend image is compiled using a multi-stage process to separate build environments and runtime binaries:

```dockerfile
# Stage 1: Build Binaries
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime Container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/backend-0.0.1-SNAPSHOT.jar backend.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "backend.jar"]
```

### 2.2 Production Compose Spec (`docker-compose.prod.yml`)
Runs the backend microservice, excluding development services (Postgres, MinIO, Redis) which are replaced by AWS managed services in production:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: trajectory_backend_prod
    restart: unless-stopped
    ports:
      - "8080:8080"
    env_file:
      - .env.prod
    environment:
      - SPRING_AUTOCONFIGURE_EXCLUDE=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration
```

---

## 3. Nginx Gateway & Forwarded Headers

### 3.1 Nginx Ingress Gateway Configuration
The Nginx web server terminates SSL, manages headers, and routes traffic to the backend:

```nginx
server {
    listen 80;
    server_name trajectory-api.duckdns.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name trajectory-api.duckdns.org;

    ssl_certificate /etc/letsencrypt/live/trajectory-api.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/trajectory-api.duckdns.org/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # WebSockets support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 3.2 Spring Boot Proxy Configuration
To ensure Spring Boot and Spring Security read proxy headers correctly (such as mapping HTTPS redirects during OAuth flow), the application configuration includes:
```yaml
server:
  forward-headers-strategy: framework
```
This enables Spring's `ForwardedHeaderFilter` to parse incoming proxy headers and construct correct redirect URIs.

---

## 4. HTTPS Certificate Lifecycle Management

*   **Provisioning:** Certbot registers TLS certificates using Let's Encrypt with HTTP-01 DNS domain validation:
    ```bash
    sudo certbot --nginx -d trajectory-api.duckdns.org --non-interactive --agree-tos -m dev@domain.com
    ```
*   **Automatic Renewal:** A systemd service timer (`certbot.timer`) runs checks twice daily. If certificates expire in less than 30 days, Certbot renews them and reloads Nginx automatically.
    ```bash
    # Test certificate renewal
    sudo certbot renew --dry-run
    ```

---

## 5. CI/CD Deployment Architecture (GitHub Actions)

Trajectory uses a self-hosted deployment runner configuration to maintain network isolation.

```
CI/CD Deployment Flow:
[ Push to Main ] ──► [ GitHub Workflow Event Triggered ]
                                │
                                ▼ (Outbound long-polling connection)
             [ GitHub Actions Self-Hosted Runner (EC2 systemd) ]
                                │
                                ▼ (Executes local rebuild scripts)
             [ Docker Compose Rebuild & Container Restart ]
```

### 5.1 Deployment Script (`.github/workflows/deploy.yml`)
The workflow triggers on code updates to the `main` branch:

```yaml
name: Production Deployment

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: self-hosted
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Inject Environment Variables
        run: |
          echo "SPRING_PROFILES_ACTIVE=prod" > .env.prod
          echo "JWT_SECRET_KEY=${{ secrets.JWT_SECRET_KEY }}" >> .env.prod
          echo "SPRING_DATASOURCE_URL=${{ secrets.SPRING_DATASOURCE_URL }}" >> .env.prod
          echo "SPRING_DATASOURCE_USERNAME=${{ secrets.SPRING_DATASOURCE_USERNAME }}" >> .env.prod
          echo "SPRING_DATASOURCE_PASSWORD=${{ secrets.SPRING_DATASOURCE_PASSWORD }}" >> .env.prod
          echo "SPRING_AI_OPENAI_API_KEY=${{ secrets.SPRING_AI_OPENAI_API_KEY }}" >> .env.prod
          echo "AWS_ACCESS_KEY_ID=${{ secrets.AWS_ACCESS_KEY_ID }}" >> .env.prod
          echo "AWS_SECRET_ACCESS_KEY=${{ secrets.AWS_SECRET_ACCESS_KEY }}" >> .env.prod
          echo "AWS_S3_BUCKET_NAME=${{ secrets.AWS_S3_BUCKET_NAME }}" >> .env.prod

      - name: Rebuild & Start Containers
        run: |
          docker compose -f docker-compose.prod.yml down
          docker compose -f docker-compose.prod.yml up --build -d
```

---

## 6. Resolved Production Issues & Root Cause Analysis

*   **OAuth Redirect Loop (Localhost Redirects):**
    *   *Symptom:* Google OAuth authentication redirected users to `localhost:5173`.
    *   *Root Cause:* The backend success handler (`OAuth2AuthenticationSuccessHandler`) had hardcoded fallback paths.
    *   *Resolution:* Changed the redirect configuration to point to the production Vercel target `https://trajectory-mu-six.vercel.app/login`.
*   **Frontend `/api` Route Duplications:**
    *   *Symptom:* Social login links returned 404 errors when using `/api/oauth2/authorization/...` routes.
    *   *Root Cause:* React concatenated paths directly with the REST base URL.
    *   *Resolution:* Modified routes to strip `/api` and direct traffic to the base OAuth routes.
*   **Scheme Loss (Mixed Content Warnings):**
    *   *Symptom:* The browser blocked login redirects due to HTTP/HTTPS mismatches.
    *   *Root Cause:* Nginx terminated SSL without notifying Spring Security.
    *   *Resolution:* Set `X-Forwarded-Proto $scheme` in Nginx and configured `forward-headers-strategy: framework` in Spring Boot.
*   **Vercel Routing 404 Error on Reload:**
    *   *Symptom:* Refreshing internal application pages (such as `/analytics`) returned 404 errors.
    *   *Root Cause:* Vercel looked for static file locations instead of routing through the entry index.
    *   *Resolution:* Created `vercel.json` to map all sub-paths back to the root `index.html` file.
*   **CORS Request Blocks:**
    *   *Symptom:* API requests were blocked by browser pre-flight checks.
    *   *Root Cause:* The backend configuration missed the Vercel production domain.
    *   *Resolution:* Added `"https://trajectory-mu-six.vercel.app"` to the authorized origins list in `SecurityConfig.java`.

---

## Related Documentation
*   [**Documentation Index (Docs/INDEX.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
*   [**Environment Configuration (Docs/ENVIRONMENT_CONFIGURATION.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/ENVIRONMENT_CONFIGURATION.md)
*   [**System Architecture (Docs/SYSTEM_ARCHITECTURE.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/SYSTEM_ARCHITECTURE.md)
