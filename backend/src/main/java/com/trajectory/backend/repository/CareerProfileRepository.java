package com.trajectory.backend.repository;

import com.trajectory.backend.model.CareerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CareerProfileRepository extends JpaRepository<CareerProfile, UUID> {
    List<CareerProfile> findByUserId(UUID userId);
    Optional<CareerProfile> findByUserIdAndIsDefaultTrue(UUID userId);
    Optional<CareerProfile> findByUserIdAndTitleIgnoreCase(UUID userId, String title);
}
