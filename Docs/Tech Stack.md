# Tech Stack: Trajectory

## Frontend (Client-Side)
*   **Framework:** React 18+ (Vite)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** Shadcn UI (Radix UI)
*   **State Management:** 
    *   **Server State:** TanStack Query (React Query)
    *   **Client State:** Zustand (Lightweight & fast)
*   **Form Handling:** React Hook Form
*   **Validation:** Zod
*   **Charts/Analytics:** Recharts
*   **Icons:** Lucide React

## Backend (Server-Side)
*   **Framework:** Java 21 + Spring Boot 3.x
*   **AI Integration:** **Spring AI** (Standardized API for LLM orchestration)
*   **Security:** Spring Security (JWT + OAuth2 for Google/GitHub)
*   **Persistence:** Spring Data JPA (Hibernate)
*   **API Documentation:** SpringDoc OpenAPI (Swagger)
*   **Task Scheduling:** Spring Scheduler (for automated ghosting detection)
*   **Validation:** Jakarta Bean Validation (Hibernate Validator)

## AI Provider (Free Tier)
*   **Primary LLM Provider:** **Groq Cloud** (Using Llama 3 / Mixtral)
    *   *Why:* Offers a high-performance **free tier** with extremely low latency.
    *   *Integration:* Spring AI OpenAI Chat Client (configured with Groq’s API endpoint).
*   **Alternative:** **Google Gemini API** (Free Tier available via AI Studio).

## Database & Storage
*   **Primary Database:** PostgreSQL 16
*   **Caching & Rate Limiting:** Redis (via Spring Data Redis)
*   **File Storage:** **MinIO** (Self-hosted/Free S3-compatible storage) or **Supabase Storage** (Generous free tier for PDF resumes).
*   **Migrations:** Flyway

## Infrastructure & DevOps
*   **Containerization:** Docker & Docker Compose
*   **CI/CD:** GitHub Actions
*   **Web Server:** Nginx
*   **Logging:** SLF4J + Logback

## External APIs
*   **Auth Providers:** Google Cloud Console / GitHub Developer Settings
*   **Notifications:** Web Push API (for browser-based alerts)