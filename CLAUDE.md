# CLAUDE.md — Workspace Context & Rule Book

## 1. Project Overview
**Trajectory** is a career operating system designed to centralize and automate job search management.
*   **Architecture:** Decoupled Full-Stack (Backend API + Frontend SPA).
*   **Backend:** Java 21, Spring Boot 3.x, Spring AI.
*   **Frontend:** React 18, Vite, TypeScript, Tailwind CSS.

---

## 2. Structural Constraints
*   **Directory Split:**
    *   `/backend`: Spring Boot application.
    *   `/frontend`: Vite/React application.
*   **Data Flow:** All data exchanges between frontend and backend must use JSON via RESTful APIs.
*   **Authentication:** Stateless JWT-based authentication for local login; OAuth2 for Google/GitHub.

---

## 3. Backend Guidelines (Java 21 / Spring Boot 3)
*   **Standards:** Use modern Java 21 features where applicable (Records for DTOs, Sealed Classes for domain logic, Switch Expressions).
*   **Spring AI:** All LLM operations (JD parsing, email extraction) must use the `Spring AI` framework. Use the OpenAI-compatible chat client configured for **Groq (Llama 3)**.
*   **Validation:** 
    *   Use **Jakarta Bean Validation** (`@NotNull`, `@Size`, etc.) on all Entity and Request DTO classes.
    *   Strict validation for "Date Sent" vs "Follow-up Date" in service logic.
*   **Persistence:**
    *   Use Spring Data JPA with PostgreSQL.
    *   All primary keys must be **UUIDs**.
    *   Database migrations must be handled via **Flyway** in `/resources/db/migration`.
*   **Error Handling:** Global exception handling using `@RestControllerAdvice`. Return structured Error Responses (Timestamp, Status, Message, Path).
* **Enum Mappings:**
    * Map `application_status` and `outreach_status` to strict Java Enums.
    * Annotate database entity fields with `@Enumerated(EnumType.STRING)` to guarantee compatibility with native PostgreSQL enums.

---

## 4. Frontend Guidelines (React 18 / Vite / TS)
*   **State Management:**
    *   Use **TanStack Query (React Query)** for all server-state (fetching, caching, mutations).
    *   Use **Zustand** for lightweight global UI state (modals, theme preferences).
*   **Styling & UI:**
    *   **STRICT ADHERENCE:** Follow all typography, hex codes, and padding scales defined in `DESIGN.md`.
    *   Use **Tailwind CSS** for layout and utility styling.
    *   Use **Shadcn UI** as the base component library.
*   **Forms & Validation:**
    *   Use **React Hook Form** for all form management.
    *   Use **Zod** for schema-based client-side validation. Schemas must match Backend DTO constraints.
*   **Components:** Functional components only. Use hooks for logic. Prefer small, reusable components in `/src/components/ui`.

---

## 5. Coding Standards & Best Practices
*   **Naming Conventions:**
    *   **Backend:** PascalCase for Classes, camelCase for variables/methods, UPPER_SNAKE_CASE for constants.
    *   **Frontend:** PascalCase for Components/Types, camelCase for variables/functions.
*   **Security:**
    *   Never log PII (Personally Identifiable Information).
    *   Never hardcode API keys or credentials. Use `.env` or Spring `@ConfigurationProperties`.
*   **Type Safety:**
    *   **No `any`** in TypeScript.
    *   Use TypeScript `interfaces` for API response shapes.

---

## 6. AI Agent Instructions
1.  **Read Before Code:** Always reference `PRD.md` for functional requirements and `App-Flow.md` for navigation logic before generating new screens or endpoints.
2.  **Context Alignment:** When building UI, check `DESIGN.md` for specific spacing/color values. Do not hallucinate styles.
3.  **Consistency:** Ensure that if a field is added to the PostgreSQL schema, it is reflected in the Spring Record DTO, the Zod schema on the frontend, and the TypeScript interface.
4.  **No Boilerplate:** Avoid adding unnecessary libraries. Stick to the stack defined in `TECH-STACK.md`.