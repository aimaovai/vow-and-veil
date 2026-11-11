package com.vowandveil.user;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("An account with that email already exists.");
        }

        User user = new User();
        user.setEmail(email);
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setPassword(passwordEncoder.encode(request.password()));
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User authenticate(String email, String password) {
        User user = userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }
        return user;
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
    }
}
