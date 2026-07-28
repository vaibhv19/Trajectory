# Error Handling Strategy: Trajectory (v1.0.1)

This document defines the custom exceptions, global rest interceptors, error JSON payloads, and client-side notification integrations implemented in **Trajectory**.

---

## 1. Exception Hierarchy & HTTP Status Mappings

Trajectory uses standard HTTP status codes to communicate API request failures. The backend uses custom exceptions under `com.trajectory.backend.exception` to control error handling:

| Backend Exception | Base Java Class | Mapped HTTP Status | Semantic API Context |
| :--- | :--- | :---: | :--- |
| **`ResourceNotFoundException`**| `RuntimeException` | `404 Not Found` | Entity missing from PostgreSQL database (e.g. invalid application ID). |
| **`BadRequestException`** | `RuntimeException` | `400 Bad Request` | Logical errors (e.g. creating user with email that already exists). |
| **`UnauthorizedException`** | `RuntimeException` | `401 Unauthorized` | Invalid JWT signature, missing token, or failed authorization. |
| **`IllegalArgumentException`** | `RuntimeException` | `400 Bad Request` | Malformed parameters or invalid enum values. |
| **`MethodArgumentNotValidException`** | Exception | `400 Bad Request` | Spring validation checks failed (e.g., failed `@Email`, `@NotNull` checks). |
| **`Exception`** | Exception | `500 Internal Server Error` | Unhandled exceptions. Logs stack traces and returns user-safe messages. |

---

## 2. Server-Side Exception Interceptor (`GlobalExceptionHandler.java`)

The backend intercepts controllers using `@RestControllerAdvice` to convert Java exceptions into standard HTTP error responses.

```
Exception Triggered (e.g. ResourceNotFoundException)
                       │
                       ▼
[ GlobalExceptionHandler Interception ]
                       │
        ┌──────────────┴──────────────┐
        ▼ (Standard Custom Exception)  ▼ (Validation Failure)
  Build ErrorResponse DTO       Build Validation Map
        │                              │
        ▼                              ▼
  Return ResponseEntity (404/400)  Return ResponseEntity (400)
```

### 2.1 Standard Error Payload (`ErrorResponse.java`)
For standard exceptions, the handler returns the `ErrorResponse` DTO containing:
*   `timestamp` (`LocalDateTime`) — Time the error occurred.
*   `status` (`int`) — HTTP status code integer.
*   `error` (`String`) — Standard HTTP status phrase.
*   `message` (`String`) — Clear reason for the exception.
*   `path` (`String`) — Endpoint path request failed on (extracts path via `request.getDescription(false)`).

#### Payload Example (404 Not Found):
```json
{
  "timestamp": "2026-07-28T20:30:00.123456",
  "status": 404,
  "error": "Not Found",
  "message": "Application not found with id: 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "path": "/api/applications/1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
}
```

### 2.2 Validation Error Payload
For validation exceptions (`MethodArgumentNotValidException`), the handler collects all field-level validation errors into a map and returns:
*   `timestamp` (`LocalDateTime`)
*   `status` (`400`)
*   `error` (`"Validation Error"`)
*   `errors` (`Map<String, String>`) — Maps invalid field names to validation constraints.

#### Payload Example (400 Bad Request - Validation):
```json
{
  "timestamp": "2026-07-28T20:30:05.123456",
  "status": 400,
  "error": "Validation Error",
  "errors": {
    "email": "Must be a well-formed email address",
    "password": "Password must be at least 6 characters long"
  }
}
```

### 2.3 Unhandled Failures (500 Internal Server Error)
*   **Logging:** The handler logs the complete stack trace to the Docker console (`log.error("Unhandled exception...", ex)`).
*   **Response Security:** To prevent leaking internal system details, the client receives a generic error response:
    ```json
    {
      "timestamp": "2026-07-28T20:30:10.123456",
      "status": 500,
      "error": "Internal Server Error",
      "message": "An unexpected error occurred. Please contact support.",
      "path": "/api/applications"
    }
    ```

---

## 3. Client-Side Error Interception (Axios + Sonner)

The frontend SPA intercepts error payloads to display notifications to the user:

1.  **Axios Interceptor:** An outbound response interceptor checks for HTTP error status codes.
2.  **Auth State Sync:** If a `401 Unauthorized` or `412 Precondition Failed` code is returned, Axios triggers the `logout()` method on `useAuthStore` to clear invalid local tokens and redirect the user to `/login`.
3.  **UI Notifications:** Other API errors are caught in components and routed to **Sonner** (`toast.error()`), displaying the error message in a temporary toast notification.

---

## Related Documentation
*   [**Documentation Index (Docs/INDEX.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
*   [**REST API Specification (Docs/API_SPECIFICATION.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/API_SPECIFICATION.md)
*   [**Security Architecture (Docs/SECURITY_ARCHITECTURE.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/SECURITY_ARCHITECTURE.md)
