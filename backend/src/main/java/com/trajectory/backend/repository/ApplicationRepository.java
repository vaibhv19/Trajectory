package com.trajectory.backend.repository;

import com.trajectory.backend.model.Application;
import com.trajectory.backend.model.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    @Query("SELECT a FROM Application a WHERE a.user.id = :userId AND " +
           "a.isArchived = :isArchived AND " +
           "(:search IS NULL OR LOWER(a.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.roleTitle) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.location) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:statuses IS NULL OR a.status IN :statuses) AND " +
           "(:profileId IS NULL OR a.careerProfile.id = :profileId)")
    Page<Application> searchApplications(
            @Param("userId") UUID userId,
            @Param("search") String search,
            @Param("statuses") List<ApplicationStatus> statuses,
            @Param("profileId") UUID profileId,
            @Param("isArchived") boolean isArchived,
            Pageable pageable
    );

    Optional<Application> findByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);

    long countByUserIdAndStatus(UUID userId, ApplicationStatus status);

    long countByUserIdAndDateAppliedAfter(UUID userId, LocalDate date);

    long countByUserIdAndDateAppliedBetween(UUID userId, LocalDate start, LocalDate end);

    @Query("SELECT a.status, COUNT(a) FROM Application a WHERE a.user.id = :userId GROUP BY a.status")
    List<Object[]> countByStatusForUser(@Param("userId") UUID userId);

    @Query("SELECT r.versionNumber, cp.title, COUNT(a), " +
           "SUM(CASE WHEN a.status IN ('OA', 'INTERVIEW', 'OFFER') THEN 1 ELSE 0 END) " +
           "FROM Application a " +
           "JOIN a.resume r " +
           "JOIN a.careerProfile cp " +
           "WHERE a.user.id = :userId " +
           "GROUP BY r.versionNumber, cp.title")
    List<Object[]> getResumePerformance(@Param("userId") UUID userId);

    @Query("SELECT a.source, COUNT(a) FROM Application a WHERE a.user.id = :userId AND a.source IS NOT NULL AND a.source != '' GROUP BY a.source")
    List<Object[]> getApplicationsBySource(@Param("userId") UUID userId);

    @Query("SELECT cp.title, cp.colorCode, COUNT(a) FROM Application a JOIN a.careerProfile cp WHERE a.user.id = :userId GROUP BY cp.title, cp.colorCode")
    List<Object[]> getApplicationsByProfile(@Param("userId") UUID userId);

    // For Ghost Detection: find all non-terminal applications where lastActivityAt is older than threshold date
    List<Application> findByStatusNotInAndLastActivityAtBefore(List<ApplicationStatus> terminalStatuses, java.time.OffsetDateTime thresholdDateTime);
    
    // For Daily Action Agenda: find upcoming OA or Interview dates from today onwards
    @Query("SELECT a FROM Application a WHERE a.user.id = :userId AND a.status IN ('OA', 'INTERVIEW') AND a.followUpDate >= :today ORDER BY a.followUpDate ASC")
    List<Application> findUpcomingAgenda(@Param("userId") UUID userId, @Param("today") LocalDate today);

    // Duplicate detection
    boolean existsByUserIdAndCompanyNameIgnoreCaseAndRoleTitleIgnoreCaseAndIsArchivedFalse(UUID userId, String companyName, String roleTitle);

    List<Application> findByUserId(UUID userId);
}
