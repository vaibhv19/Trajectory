# Testing Strategy: Trajectory (v1.0.1)

This document defines the testing architecture, frameworks, and patterns used to verify code quality and maintainability in **Trajectory**.

---

## 1. Backend Testing Subsystem (JUnit 5 + Mockito)

The backend focuses on unit testing the service layer to verify business logic, access controls, and repository calls.

```
Backend Test Architecture:
+-------------------------------------------------------+
|                 JUnit 5 Test Class                    |
|  (e.g., UserServiceTest)                              |
|                                                       |
|   +-------------------+       +-------------------+   |
|   |   Mockito Mocks   |       |  Target Service   |   |
|   |  - UserRepository | ────► |    UserService    |   |
|   |  - JwtProvider    |       |   (Under Test)    |   |
|   +-------------------+       +-------------------+   |
+-------------------------------------------------------+
```

### 1.1 Stack Setup
*   **Testing Engine:** **JUnit 5 (Jupiter)** (`org.junit.jupiter.api`) manages test lifecycles and assertions.
*   **Mocking Framework:** **Mockito** (`org.mockito.junit.jupiter.MockitoExtension`) mocks database repositories and external clients.
*   **Assertions:** Uses JUnit assertions (`assertNotNull`, `assertEquals`, `assertThrows`) to verify expected behaviors.

### 1.2 Testing Patterns (Service Layer)
*   **Isolation:** Services are tested in isolation. Repositories and external clients are mocked to prevent database writes or API calls.
*   **Configuration:** Mocks are injected via `@Mock` annotations and configured during `@BeforeEach` setup blocks:
    ```java
    @ExtendWith(MockitoExtension.class)
    class UserServiceTest {
        @Mock private UserRepository userRepository;
        ...
        @BeforeEach
        void setUp() {
            userService = new UserService(userRepository, ...);
        }
    }
    ```
*   **Verification:** Uses Mockito's `verify()` methods to ensure repositories are called with the correct parameters:
    ```java
    verify(userRepository).save(any(User.class));
    ```

---

## 2. Frontend Testing Subsystem (Vitest + JSDOM)

The frontend uses unit tests to verify Zustand stores and state mutations.

### 2.1 Stack Setup
*   **Test Runner:** **Vitest** (`^4.1.10`) provides test execution and mocking utilities.
*   **Environment:** **JSDOM** (`^29.1.1`) simulates a browser DOM in Node.js environments.
*   **State Store Testing:** State stores (`authStore`, `themeStore`) are tested directly in `stores.test.ts`.

### 2.2 Testing Patterns (Zustand Stores)
*   **Environment Mocking:** Mocks global APIs (such as `localStorage`) before each test run:
    ```typescript
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });
    ```
*   **State Assertions:** Verifies store initialization and action updates:
    ```typescript
    it('should update state and localstorage on setAuth', () => {
        useAuthStore.getState().setAuth(mockAuth);
        expect(useAuthStore.getState().token).toBe('mock-jwt-token');
    });
    ```

---

## 3. Test Execution Command Reference

These commands are used to execute tests locally during development:

### 3.1 Backend Tests
To run the Maven test suites inside the `backend/` directory:
```bash
cd backend
mvn test
```

### 3.2 Frontend Tests
To run the Vitest suites inside the `frontend/` directory:
```bash
cd frontend
npx vitest run
```

---

## Related Documentation
*   [**Documentation Index (Docs/INDEX.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
*   [**Backend Developer Guide (backend/README.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/README.md)
*   [**Frontend Developer Guide (frontend/README.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/README.md)
