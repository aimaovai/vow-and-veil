package com.vowandveil.wedding;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record WeddingRequest(
        @NotBlank(message = "Wedding name is required")
        String weddingName,
        String partnerOneName,
        String partnerTwoName,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime eventDate,
        String venueName,
        String city,
        String stateProvince,
        BigDecimal budget,
        @Size(max = 50)
        String planningStage,
        String notes
) {
}
