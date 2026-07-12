package com.trajectory.backend.repository;

import com.trajectory.backend.model.CompanyDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyDocumentRepository extends JpaRepository<CompanyDocument, UUID> {
    List<CompanyDocument> findByUserId(UUID userId);
    List<CompanyDocument> findByUserIdAndCompanyNameIgnoreCase(UUID userId, String companyName);
    Optional<CompanyDocument> findByIdAndUserId(UUID id, UUID userId);
}
