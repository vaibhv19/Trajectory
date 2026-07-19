package com.trajectory.backend.security;

import com.trajectory.backend.model.CareerProfile;
import com.trajectory.backend.model.User;
import com.trajectory.backend.repository.CareerProfileRepository;
import com.trajectory.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final CareerProfileRepository careerProfileRepository;

    public CustomOAuth2UserService(UserRepository userRepository, CareerProfileRepository careerProfileRepository) {
        this.userRepository = userRepository;
        this.careerProfileRepository = careerProfileRepository;
    }

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        
        try {
            return processOAuth2User(registrationId, oauth2User);
        } catch (Exception ex) {
            log.error("Error processing OAuth2 user", ex);
            throw new OAuth2AuthenticationException(ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(String registrationId, OAuth2User oauth2User) {
        Map<String, Object> attributes = oauth2User.getAttributes();
        String email = null;
        String name = null;
        String avatarUrl = null;

        if ("google".equalsIgnoreCase(registrationId)) {
            email = (String) attributes.get("email");
            name = (String) attributes.get("name");
            avatarUrl = (String) attributes.get("picture");
        } else if ("github".equalsIgnoreCase(registrationId)) {
            email = (String) attributes.get("email");
            name = (String) attributes.get("name");
            if (name == null) {
                name = (String) attributes.get("login");
            }
            if (email == null) {
                email = attributes.get("login") + "@github.com";
            }
            avatarUrl = (String) attributes.get("avatar_url");
        }

        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Update existing user attributes
            user.setFullName(name);
            user.setAvatarUrl(avatarUrl);
            user = userRepository.save(user);
        } else {
            user = registerNewOAuth2User(email, name, avatarUrl, registrationId.toUpperCase());
        }

        return UserPrincipal.create(user, attributes);
    }

    private User registerNewOAuth2User(String email, String name, String avatarUrl, String provider) {
        User user = User.builder()
                .email(email)
                .fullName(name != null ? name : "Social User")
                .avatarUrl(avatarUrl)
                .authProvider(provider)
                .passwordHash("") // Social users don't have local password hash
                .ghostThresholdDays(30)
                .autoArchiveEnabled(false)
                .build();
        
        User savedUser = userRepository.save(user);

        // Auto-create a default Career Profile
        CareerProfile defaultProfile = CareerProfile.builder()
                .user(savedUser)
                .title("Software Engineer")
                .colorCode("#3b82f6")
                .iconIdentifier("Briefcase")
                .isDefault(true)
                .build();
        careerProfileRepository.save(defaultProfile);

        log.info("Registered new OAuth2 user: {} via {}", savedUser.getEmail(), provider);
        return savedUser;
    }
}
