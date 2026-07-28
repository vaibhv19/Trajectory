# Authentication & Authorization: Trajectory (v1.0.1)

This document provides the canonical technical specification for the Identity and Access Management (IAM) system of **Trajectory**, detailing Spring Security filter pipelines, JWT access validations, and OAuth2 identity provider handshakes.

---

## 1. Authentication Strategy

Trajectory supports dual authentication channels: Local credentials validation and social Single Sign-On (SSO) OAuth2 integrations.

```
                  +--------------------------------------+
                  |        Authentication Request        |
                  +------------------+-------------------+
                                     |
                  +------------------+-------------------+
                  |                                      |
                  v                                      v
     [ Local Credentials Auth ]             [ Social OAuth2 Auth ]
  - POST /api/auth/login                 - /oauth2/authorization/{provider}
  - Bcrypt password checks               - Google & GitHub SSO
  - Returns access & refresh tokens      - Callback redirects with tokens
```

### 1.1 Local Credentials Authentication
*   **Password Hashing:** User passwords are encrypted using `BCryptPasswordEncoder` with a default strength work factor of `10`. Raw passwords are never stored or processed beyond the login context.
*   **Register Endpoint:** `POST /api/auth/register` verifies email availability, hashes the password, inserts a record into the `users` table, creates a default career profile, and returns access and refresh tokens.
*   **Login Endpoint:** `POST /api/auth/login` validates credentials against `users.password_hash` and issues JWT tokens.

### 1.2 Social OAuth 2.0 Integration
*   **Authorization Redirect:** The React client initiates redirects to `${apiBase}/oauth2/authorization/{provider}` (Google or GitHub).
*   **User Provisioning:** `OAuth2AuthenticationSuccessHandler` intercepts successful authentication, upserts user info into the `users` table (with `auth_provider` set to `GOOGLE` or `GITHUB`), and generates JWT tokens.
*   **Callback Redirection:** The server redirects the client back to `https://trajectory-mu-six.vercel.app/login?token=<JWT>&refreshToken=<UUID>`, where the React client extracts and stores the tokens in Zustand.

---

## 2. Spring Security Filter Chain Specification

The backend uses a stateless security configuration via `SecurityConfig.java` to manage CORS, CSRF, and authorization rules:

```
Incoming Request
       │
       ▼
[ CORS Filter ] ──────────────► Validates request origin (Vercel SPA only)
       │
       ▼
[ JWT Auth Filter ] ──────────► Parses Bearer header, validates JWT signature
       │
       ▼
[ Security Context Filter ] ──► Populates SecurityContextHolder with UserPrincipal
       │
       ▼
[ Endpoint Authorization ] ───► Evaluates access rules (PermitAll vs. Authenticated)
       │
       ▼
Target API Controller
```

### 2.1 Filter Pipeline Configuration
*   **CORS Policy:** Restricts origins to `https://trajectory-mu-six.vercel.app` and allows standard REST methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`).
*   **CSRF Protection:** Disabled (`.csrf(AbstractHttpConfigurer::disable)`), as the stateless JWT token architecture is not vulnerable to CSRF vectors.
*   **Session Management:** Set to stateless (`SessionCreationPolicy.STATELESS`) to prevent the creation of server-side HTTP sessions.

### 2.2 Endpoint Access Rules
*   **Public Access:**
    *   `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`
    *   `/api/public/**` (Placement sheet metadata)
    *   `/swagger-ui/**`, `/v3/api-docs/**` (Swagger OpenAPI docs)
*   **Authenticated Access:** All other endpoints require authentication (`.anyRequest().authenticated()`).

---

## 3. JWT Token Validation Pipeline

`JwtAuthenticationFilter` intercepts incoming REST calls to validate access tokens:

1.  **Header Extraction:** Extracts the token from the `Authorization` header by stripping the `Bearer ` prefix.
2.  **Signature Validation:** Parses the signature using the `JWT_SECRET_KEY` secret key.
3.  **Expiration Check:** Checks the token expiration claim (`exp`). If expired or malformed, the request is rejected with a `412 Precondition Failed` or `401 Unauthorized` response.
4.  **Security Context Setup:** Resolves the user ID from the `sub` claim, loads a `UserPrincipal` object, and registers it in Spring Security's `SecurityContextHolder`:
    ```java
    UsernamePasswordAuthenticationToken authentication = 
        new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
    SecurityContextHolder.getContext().setAuthentication(authentication);
    ```

---

## 4. User Principal Representation (`UserPrincipal.java`)

`UserPrincipal` represents the authenticated user session within Spring Boot:

*   **Interfaces:** Implements `UserDetails` (for local credentials login) and `OAuth2User` (for social login).
*   **Attributes:** Contains the user's database ID (`UUID`), email, password hash, and social login metadata.
*   **Security Context Access:** Controllers can retrieve the current authenticated user principal using the `@AuthenticationPrincipal` annotation:
    ```java
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @AuthenticationPrincipal UserPrincipal user) {
        ...
    }
    ```

---

## Related Documentation
*   [**Documentation Index (Docs/INDEX.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
*   [**Security Architecture (Docs/SECURITY_ARCHITECTURE.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/SECURITY_ARCHITECTURE.md)
*   [**REST API Specification (Docs/API_SPECIFICATION.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/API_SPECIFICATION.md)
