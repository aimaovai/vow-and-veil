package com.vowandveil.wedding;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record WeddingResponse(
        String id,
        String weddingName,
        String partnerOneName,
        String partnerTwoName,
        LocalDateTime eventDate,
        String venueName,
        String city,
        String stateProvince,
        BigDecimal budget,
        String planningStage,
        String notes
) {
    public static WeddingResponse from(Wedding wedding) {
        return new WeddingResponse(
                wedding.getId().toString(),
                wedding.getWeddingName(),
                wedding.getPartnerOneName(),
                wedding.getPartnerTwoName(),
                wedding.getEventDate(),
                wedding.getVenueName(),
                wedding.getCity(),
                wedding.getStateProvince(),
                wedding.getBudget(),
                wedding.getPlanningStage(),
                wedding.getNotes()
        );
    }
}
