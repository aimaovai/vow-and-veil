package com.vowandveil.user;

public record UserResponse(
        String id,
        String email,
        String firstName,
        String lastName
) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId().toString(), user.getEmail(), user.getFirstName(), user.getLastName());
    }
}
