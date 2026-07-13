package com.trajectory.backend.repository;

import com.trajectory.backend.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, UUID> {
    List<Resume> findByCareerProfileIdOrderByVersionNumberDesc(UUID profileId);
    Optional<Resume> findFirstByCareerProfileIdOrderByVersionNumberDesc(UUID profileId);
    List<Resume> findByCareerProfileId(UUID profileId);
}
