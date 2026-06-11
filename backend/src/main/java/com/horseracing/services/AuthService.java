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
import com.horseracing.entities.PasswordResetToken;
import com.horseracing.entities.VerificationToken;
import com.horseracing.entities.enums.AuthProvider;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.PasswordResetTokenRepository;
import com.horseracing.repositories.UserRepository;
import com.horseracing.repositories.VerificationTokenRepository;
import com.horseracing.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    @Value("${app.google.client-id}")
    private String googleClientId;

    @Value("${app.activation-url}")
    private String activationUrl;

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
                .provider(AuthProvider.LOCAL).enabled(false).build();

        user = userRepository.save(user);

        // Generate 6-digit OTP code
        String token = String.format("%06d", new Random().nextInt(1000000));

        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();
        verificationTokenRepository.save(verificationToken);

        // Send activation email asynchronously
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), activationUrl, token);

        return AuthResponse.builder()
                .accessToken(null)
                .refreshToken(null)
                .tokenType("Bearer")
                .user(UserResponse.fromEntity(user))
                .build();
    }

    /**
     * Verify and activate user account using verification token/OTP.
     */
    @Transactional
    public void verifyAccount(String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Mã xác thực không hợp lệ. Vui lòng kiểm tra lại."));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            verificationTokenRepository.delete(verificationToken);
            throw new RuntimeException("Mã xác thực đã hết hạn. Vui lòng đăng ký lại hoặc yêu cầu gửi lại mã.");
        }

        User user = verificationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken);
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
                        .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
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

    /**
     * Process forgot password request: check email, generate OTP, save/update token, send email.
     */
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống."));

        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new RuntimeException("Tài khoản này được đăng nhập bằng " + user.getProvider() + ". Không thể đặt lại mật khẩu.");
        }

        // Generate 6-digit OTP code
        String otp = String.format("%06d", new Random().nextInt(1000000));

        PasswordResetToken resetToken = passwordResetTokenRepository.findByUser(user)
                .orElse(new PasswordResetToken());
        
        resetToken.setUser(user);
        resetToken.setToken(otp);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(10)); // 10 minutes expiry

        passwordResetTokenRepository.save(resetToken);

        // Send OTP email
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), otp);
    }

    /**
     * Verify the reset password OTP without updating password.
     */
    @Transactional(readOnly = true)
    public void verifyResetOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống."));

        PasswordResetToken resetToken = passwordResetTokenRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Mã OTP không hợp lệ hoặc không tồn tại."));

        if (!resetToken.getToken().equals(request.getOtp())) {
            throw new RuntimeException("Mã OTP không chính xác.");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã OTP đã hết hạn.");
        }
    }

    /**
     * Reset the password using email, OTP, and the new password.
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống."));

        PasswordResetToken resetToken = passwordResetTokenRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Mã OTP không hợp lệ hoặc không tồn tại."));

        if (!resetToken.getToken().equals(request.getOtp())) {
            throw new RuntimeException("Mã OTP không chính xác.");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new RuntimeException("Mã OTP đã hết hạn.");
        }

        // Update user's password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Delete the token so it cannot be reused
        passwordResetTokenRepository.delete(resetToken);
    }
}
