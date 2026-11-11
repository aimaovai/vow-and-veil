package com.vowandveil.wedding;

import com.vowandveil.user.User;
import com.vowandveil.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class WeddingService {

    private final WeddingRepository weddingRepository;
    private final UserRepository userRepository;

    public WeddingService(WeddingRepository weddingRepository, UserRepository userRepository) {
        this.weddingRepository = weddingRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Wedding saveForUser(String email, WeddingRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        Wedding wedding = weddingRepository.findByUserId(user.getId())
                .orElseGet(Wedding::new);

        wedding.setUser(user);
        wedding.setWeddingName(request.weddingName());
        wedding.setPartnerOneName(request.partnerOneName());
        wedding.setPartnerTwoName(request.partnerTwoName());
        wedding.setEventDate(request.eventDate());
        wedding.setVenueName(request.venueName());
        wedding.setCity(request.city());
        wedding.setStateProvince(request.stateProvince());
        wedding.setBudget(request.budget());
        wedding.setPlanningStage(request.planningStage() == null || request.planningStage().isBlank()
                ? "DISCOVERY" : request.planningStage());
        wedding.setNotes(request.notes());

        return weddingRepository.save(wedding);
    }

    @Transactional(readOnly = true)
    public Optional<Wedding> getCurrentWedding(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        return weddingRepository.findByUserId(user.getId());
    }
}
