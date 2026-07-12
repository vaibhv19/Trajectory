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
*   **Concurrency:** Java 21 **Virtual Threads** (to prevent thread starvation during blocking external AI/LLM API calls)

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

## Infrastructure & Deployment
*   **Containerization:** Docker & Docker Compose (for local development and environment packaging)
*   **Cloud Hosting:** **Amazon Web Services (AWS)** (utilizing **AWS Free Tier** ECS/Fargate container execution, AWS RDS db.t3.micro, and ElastiCache Redis)
*   **CI/CD:** GitHub Actions (configured to build Docker images and deploy updates to AWS ECS)
*   **Web Server:** Nginx (reverse proxy and static asset router)
*   **Logging:** SLF4J + Logback

## External APIs
*   **Auth Providers:** Google Cloud Console / GitHub Developer Settings
*   **Notifications:** Web Push API (for browser-based alerts)