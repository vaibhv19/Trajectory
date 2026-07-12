package com.trajectory.backend.service;

import com.trajectory.backend.dto.CareerProfileRequest;
import com.trajectory.backend.dto.CareerProfileResponse;
import com.trajectory.backend.model.CareerProfile;
import com.trajectory.backend.model.User;
import com.trajectory.backend.repository.CareerProfileRepository;
import com.trajectory.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CareerProfileService {

    private final CareerProfileRepository careerProfileRepository;
    private final UserRepository userRepository;

    public CareerProfileService(CareerProfileRepository careerProfileRepository, UserRepository userRepository) {
        this.careerProfileRepository = careerProfileRepository;
        this.userRepository = userRepository;
    }

    public List<CareerProfileResponse> getProfiles(UUID userId) {
        return careerProfileRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CareerProfileResponse createProfile(UUID userId, CareerProfileRequest request) {
        User user = userRepository.findById(userId).orElseThrow();

        if (request.isDefault()) {
            resetDefaultProfiles(userId);
        }

        CareerProfile profile = CareerProfile.builder()
                .user(user)
                .title(request.title())
                .colorCode(request.colorCode() != null ? request.colorCode() : "#3b82f6")
                .iconIdentifier(request.iconIdentifier())
                .isDefault(request.isDefault() || careerProfileRepository.findByUserId(userId).isEmpty())
                .build();

        CareerProfile saved = careerProfileRepository.save(profile);
        return mapToResponse(saved);
    }

    @Transactional
    public CareerProfileResponse updateProfile(UUID userId, UUID profileId, CareerProfileRequest request) {
        CareerProfile profile = careerProfileRepository.findById(profileId)
                .filter(p -> p.getUser().getId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        profile.setTitle(request.title());
        profile.setColorCode(request.colorCode());
        profile.setIconIdentifier(request.iconIdentifier());

        if (request.isDefault() && !profile.isDefault()) {
            resetDefaultProfiles(userId);
            profile.setDefault(true);
        }

        CareerProfile saved = careerProfileRepository.save(profile);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteProfile(UUID userId, UUID profileId) {
        CareerProfile profile = careerProfileRepository.findById(profileId)
                .filter(p -> p.getUser().getId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        if (profile.isDefault()) {
            throw new IllegalArgumentException("Cannot delete the default career profile");
        }

        careerProfileRepository.delete(profile);
    }

    private void resetDefaultProfiles(UUID userId) {
        List<CareerProfile> profiles = careerProfileRepository.findByUserId(userId);
        for (CareerProfile p : profiles) {
            if (p.isDefault()) {
                p.setDefault(false);
                careerProfileRepository.save(p);
            }
        }
    }

    public CareerProfileResponse mapToResponse(CareerProfile profile) {
        return new CareerProfileResponse(
                profile.getId(),
                profile.getTitle(),
                profile.getColorCode(),
                profile.getIconIdentifier(),
                profile.isDefault()
        );
    }
}
