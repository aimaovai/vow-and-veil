package com.vowandveil.wedding;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class WeddingController {

    private final WeddingService weddingService;

    public WeddingController(WeddingService weddingService) {
        this.weddingService = weddingService;
    }

    @GetMapping("/weddings/current")
    public ResponseEntity<?> currentWedding(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        var weddingOpt = weddingService.getCurrentWedding(authentication.getName());
        if (weddingOpt.isPresent()) {
            return ResponseEntity.ok(WeddingResponse.from(weddingOpt.get()));
        }
        return ResponseEntity.ok(Map.of("exists", false));
    }

    @PutMapping("/weddings/current")
    public ResponseEntity<?> updateCurrentWedding(
            @Valid @RequestBody WeddingRequest request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        try {
            Wedding wedding = weddingService.saveForUser(authentication.getName(), request);
            return ResponseEntity.ok(WeddingResponse.from(wedding));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
