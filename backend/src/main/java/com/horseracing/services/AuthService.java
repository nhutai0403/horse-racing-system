package com.horseracing.services;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.horseracing.dto.request.*;
import com.horseracing.dto.response.AuthResponse;
import com.horseracing.dto.response.UserResponse;
import com.horseracing.entities.RefreshToken;
import com.horseracing.entities.User;
import com.horseracing.entities.enums.AuthProvider;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.UserRepository;
import com.horseracing.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.google.client-id}")
    private String googleClientId;

    /**
     * Register a new user with LOCAL provider and SPECTATOR role.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }

        User user = User.builder().username(request.getUsername()).email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole() != null ? request.getRole() : Role.SPECTATOR)
                .provider(AuthProvider.LOCAL).enabled(true).build();

        user = userRepository.save(user);

        String accessToken = jwtUtils.generateAccessToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(accessToken, refreshToken.getToken(),
                UserResponse.fromEntity(user));
    }

    /**
     * Authenticate a user with email and password.
     */
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken = jwtUtils.generateAccessToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(accessToken, refreshToken.getToken(),
                UserResponse.fromEntity(user));
    }

    /**
     * Authenticate or register a user via Google OAuth2. Receives the Google ID token (credential)
     * from frontend, verifies it, and either finds or creates a user.
     */
    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        try {
            GoogleIdTokenVerifier verifier =
                    new GoogleIdTokenVerifier.Builder(new NetHttpTransport(),
                            GsonFactory.getDefaultInstance())
                                    .setAudience(Collections.singletonList(googleClientId)).build();

            GoogleIdToken idToken = verifier.verify(request.getCredential());
            if (idToken == null) {
                throw new RuntimeException("Invalid Google token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String googleId = payload.getSubject();

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = User.builder().username(email).email(email)
                        .fullName(name != null ? name : email).role(Role.SPECTATOR)
                        .provider(AuthProvider.GOOGLE).providerId(googleId).enabled(true).build();
                return userRepository.save(newUser);
            });

            // If user exists with LOCAL provider, update to link Google account
            if (user.getProvider() == AuthProvider.LOCAL && user.getProviderId() == null) {
                user.setProviderId(googleId);
                userRepository.save(user);
            }

            String accessToken = jwtUtils.generateAccessToken(user);
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

            return new AuthResponse(accessToken, refreshToken.getToken(),
                    UserResponse.fromEntity(user));

        } catch (Exception e) {
            throw new RuntimeException("Google authentication failed: " + e.getMessage());
        }
    }

    /**
     * Refresh the access token using a valid refresh token.
     */
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        refreshTokenService.verifyExpiration(refreshToken);

        User user = refreshToken.getUser();
        String newAccessToken = jwtUtils.generateAccessToken(user);

        // Create new refresh token (token rotation for security)
        refreshTokenService.revokeToken(request.getRefreshToken());
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder().accessToken(newAccessToken)
                .refreshToken(newRefreshToken.getToken()).tokenType("Bearer").build();
    }

    /**
     * Logout by revoking the refresh token.
     */
    @Transactional
    public void logout(LogoutRequest request) {
        refreshTokenService.revokeToken(request.getRefreshToken());
    }

    /**
     * Get current user info by email.
     */
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserResponse.fromEntity(user);
    }
}
