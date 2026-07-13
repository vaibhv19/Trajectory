package com.trajectory.backend.repository;

import com.trajectory.backend.model.Outreach;
import com.trajectory.backend.model.enums.OutreachStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OutreachRepository extends JpaRepository<Outreach, UUID> {
    
    @Query("SELECT o FROM Outreach o WHERE o.user.id = :userId AND " +
           "(:search IS NULL OR LOWER(o.contactName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(o.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(o.positionDiscussed) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR o.status = :status) " +
           "ORDER BY o.createdAt DESC")
    List<Outreach> searchOutreach(
            @Param("userId") UUID userId,
            @Param("search") String search,
            @Param("status") OutreachStatus status
    );

    Optional<Outreach> findByIdAndUserId(UUID id, UUID userId);

    List<Outreach> findByUserIdAndFollowUpDate(UUID userId, LocalDate date);

    @Query("SELECT o FROM Outreach o WHERE o.user.id = :userId AND o.followUpDate <= :today AND o.status IN (:activeStatuses) ORDER BY o.followUpDate ASC")
    List<Outreach> findPendingFollowUps(
            @Param("userId") UUID userId,
            @Param("today") LocalDate today,
            @Param("activeStatuses") List<OutreachStatus> activeStatuses
    );

    List<Outreach> findByUserId(UUID userId);
}
