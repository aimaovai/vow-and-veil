package com.vowandveil.wedding;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WeddingRepository extends JpaRepository<Wedding, UUID> {
    Optional<Wedding> findByUserId(UUID userId);
}
