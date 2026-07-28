# Security Architecture: Trajectory (v1.0.1)

This document provides the canonical, production-grade specification for the security architecture of **Trajectory**, covering network isolation, identity protection, database isolation, client access controls, and infrastructure deployment security.

---

## 1. Network Perimeter & Ingress Security

The deployment perimeter is designed to prevent direct access to application containers and databases from the public internet.

```
                  [ Public Internet ]
                           │
                           ▼ (Port 443 HTTPS only)
             [ Host-Native Nginx Proxy ]
                           │
                           ├─ (SSL Termination via Certbot)
                           ├─ (Security Header Injection)
                           │
                           ▼ (Loopback 127.0.0.1:8080 HTTP)
             [ Spring Boot Docker Container ]
                           │
                           ├─ (Stateless JWT Auth Verification)
                           │
                           ▼ (Intra-VPC Private Port 5432)
               [ AWS RDS PostgreSQL 16 ]
```

### 1.1 SSL/TLS Termination & Routing
*   **Ingress Proxy:** A host-native **Nginx** reverse proxy serves as the only public entry point for REST API traffic on the AWS EC2 instance.
*   **SSL termination:** Handles SSL termination using **Let's Encrypt** TLS certificates. Port `80` traffic is automatically redirected to port `443` (HTTP 301 Redirect).
*   **Internal Routing:** Exposes port `8080` internally on the loopback interface (`127.0.0.1`). Nginx reverse proxies sanitized traffic to the container.
*   **Database Isolation:** The **AWS RDS PostgreSQL** instance runs in a private subnet, with security groups configured to accept inbound TCP traffic on port `5432` only from the EC2 instance's IP.

### 1.2 Nginx Security Header Injections
Nginx is configured to inject security headers on every response to protect against client-side exploits:
*   `X-Frame-Options "SAMEORIGIN"` — Prevents clickjacking attacks.
*   `X-XSS-Protection "1; mode=block"` — Enables browser-native XSS filters.
*   `X-Content-Type-Options "nosniff"` — Prevents MIME-type sniffing.
*   `Referrer-Policy "no-referrer-when-downgrade"` — Restricts referrer leakages.

---

## 2. Session Security (JWT & Tokens)

Trajectory uses a stateless, token-based session management system.

```
JWT Token Structure (Signed HMAC SHA-256):
+-------------------------+-------------------------+-------------------------+
|    Base64URL Header     |    Base64URL Payload    |        Signature        |
|  {"alg": "HS256", ...}  |  {"sub": "userId", ...} |   HMACSHA256(H.P, Key)  |
+-------------------------+-------------------------+-------------------------+
```

### 2.1 Access Token Verification
*   **Cryptographic Signature:** JWT access tokens are signed using HMAC SHA-256 with a 256-bit secret key (`JWT_SECRET_KEY`) injected into the container environment.
*   **Payload Claims:** Tokens store the user's ID (`sub`), email, issue time (`iat`), and expiration time (`exp`).
*   **Lifespan:** Tokens are configured with a 24-hour expiration duration to balance developer convenience and session security.

### 2.2 Refresh Token Rotation & Revocation
*   **Refresh Token Storage:** Refresh tokens are stored in the database (`refresh_tokens` table) as secure random UUIDs mapped to user IDs.
*   **Authentication Flow:** When the access token expires, the client sends the refresh token to `/api/auth/refresh`. The server validates the token against the database, checks its expiration, and issues a new access token.
*   **Session Revocation:** Triggering `/api/auth/logout` deletes the refresh token record from the database, preventing further token rotation.

---

## 3. Database Tenant Isolation

To enforce data isolation, the database relies on user-scoped query filtering rather than multi-tenant database clusters.

*   **Repository Isolation:** Spring Data JPA Repositories filter records using the authenticated user's ID:
    ```sql
    SELECT * FROM applications WHERE user_id = :authenticatedUserId;
    ```
*   **Data Controller Guards:** Controllers extract the user ID directly from the authenticated security principal (`@AuthenticationPrincipal UserPrincipal user`) rather than relying on client-supplied parameters.
*   **Foreign Key Constraints:** Cascading deletes (`ON DELETE CASCADE`) are applied on the `user_id` foreign keys for the `career_profiles`, `outreach`, `notifications`, `refresh_tokens`, and `company_documents` tables.

---

## 4. Client Access Controls & CORS

*   **CORS (Cross-Origin Resource Sharing):** Spring Security isolates the REST API by restricting requests to authorized origins:
    ```java
    corsConfiguration.setAllowedOrigins(List.of("https://trajectory-mu-six.vercel.app"));
    corsConfiguration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    corsConfiguration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    ```
*   **Forwarded Headers Strategy:** The backend is configured with `server.forward-headers-strategy: framework` to read forwarded headers (`X-Forwarded-Proto`, `X-Forwarded-For`) injected by Nginx. This prevents protocol conflicts during OAuth2 authentication flows.

---

## 5. CI/CD Infrastructure Security

To prevent unauthorized port exposure on the hosting environment, the CI/CD pipeline uses outbound polling:

*   **Self-Hosted Agent:** A **GitHub Actions Self-Hosted Runner** runs locally on the EC2 host as a background systemd service.
*   **Outbound Communication:** The runner connects to GitHub using outbound HTTPS connections (port `443`). No inbound firewall ports (such as SSH port `22`) need to be exposed to public GitHub runners.
*   **Local Container Rebuilds:** When code is pushed to the `main` branch, the runner pulls the repository changes and executes `docker compose up --build -d` locally.

---

## Related Documentation
*   [**Documentation Index (Docs/INDEX.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
*   [**Authentication & Authorization (Docs/AUTHENTICATION_AUTHORIZATION.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/AUTHENTICATION_AUTHORIZATION.md)
*   [**System Architecture (Docs/SYSTEM_ARCHITECTURE.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/SYSTEM_ARCHITECTURE.md)
