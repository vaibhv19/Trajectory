package com.trajectory.backend.security;

import com.trajectory.backend.model.CareerProfile;
import com.trajectory.backend.model.User;
import com.trajectory.backend.repository.CareerProfileRepository;
import com.trajectory.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

@Component
@Slf4j
public class MockOAuth2RedirectFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final CareerProfileRepository careerProfileRepository;
    private final JwtTokenProvider tokenProvider;
    private final Environment environment;

    public MockOAuth2RedirectFilter(UserRepository userRepository,
                                    CareerProfileRepository careerProfileRepository,
                                    JwtTokenProvider tokenProvider,
                                    Environment environment) {
        this.userRepository = userRepository;
        this.careerProfileRepository = careerProfileRepository;
        this.tokenProvider = tokenProvider;
        this.environment = environment;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        boolean isLocalProfile = Arrays.asList(environment.getActiveProfiles()).contains("local");

        if (isLocalProfile && (requestURI.equals("/oauth2/authorization/google") || requestURI.equals("/oauth2/authorization/github"))) {
            String provider = requestURI.substring(requestURI.lastIndexOf("/") + 1);
            log.info("Intercepting local OAuth redirect request for provider: {}", provider);

            String email = "mock." + provider + "@trajectory.com";
            String name = "Mock " + provider.substring(0, 1).toUpperCase() + provider.substring(1) + " User";
            String avatarUrl = provider.equals("google") 
                    ? "https://lh3.googleusercontent.com/a/default-user" 
                    : "https://github.com/identicons/default.png";

            User user = getOrCreateMockUser(email, name, avatarUrl, provider.toUpperCase());
            UserPrincipal principal = UserPrincipal.create(user);
            String token = tokenProvider.generateTokenForUser(principal);

            String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/login")
                    .queryParam("token", token)
                    .queryParam("email", user.getEmail())
                    .queryParam("name", user.getFullName())
                    .queryParam("userId", user.getId().toString())
                    .build().toUriString();

            response.sendRedirect(targetUrl);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private User getOrCreateMockUser(String email, String name, String avatarUrl, String provider) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            return userOptional.get();
        }

        User user = User.builder()
                .email(email)
                .fullName(name)
                .avatarUrl(avatarUrl)
                .authProvider(provider)
                .passwordHash("")
                .ghostThresholdDays(30)
                .autoArchiveEnabled(false)
                .build();
        User savedUser = userRepository.save(user);

        CareerProfile defaultProfile = CareerProfile.builder()
                .user(savedUser)
                .title("Software Engineer")
                .colorCode("#3b82f6")
                .iconIdentifier("Briefcase")
                .isDefault(true)
                .build();
        careerProfileRepository.save(defaultProfile);

        return savedUser;
    }
}
