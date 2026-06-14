package com.horseracing.controllers;

import com.horseracing.dto.request.*;
import com.horseracing.dto.response.AuthResponse;
import com.horseracing.dto.response.ErrorResponse;
import com.horseracing.dto.response.MessageResponse;
import com.horseracing.dto.response.UserResponse;
import com.horseracing.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user account (default role: SPECTATOR).
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    /**
     * Login with email and password.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, "Login failed: " + e.getMessage() + " | Class: " + e.getClass().getSimpleName()));
        }
    }

    /**
     * Login or register with Google OAuth2. Receives the Google ID token (credential) from the
     * frontend.
     */
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        try {
            AuthResponse response = authService.googleLogin(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new ErrorResponse(401, "Google authentication failed: " + e.getMessage()));
        }
    }

    /**
     * Complete profile for newly created Google account
     */
    @PostMapping("/google/complete-profile")
    public ResponseEntity<?> completeGoogleProfile(
            @Valid @RequestBody com.horseracing.dto.request.CompleteProfileRequest request,
            Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            UserResponse response = authService.completeGoogleProfile(userDetails.getUsername(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    /**
     * Refresh access token using a valid refresh token.
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            AuthResponse response = authService.refreshToken(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, e.getMessage()));
        }
    }

    /**
     * Logout by revoking the refresh token.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@Valid @RequestBody LogoutRequest request) {
        try {
            authService.logout(request);
            return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    /**
     * Get current authenticated user's info.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            UserResponse response = authService.getCurrentUser(userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, "Not authenticated"));
        }
    }

    /**
     * Verify and activate user account using verification token/OTP.
     */
    @GetMapping("/verify")
    public ResponseEntity<?> verifyAccount(@RequestParam("token") String token) {
        try {
            authService.verifyAccount(token);
            return ResponseEntity.ok(new MessageResponse("Tài khoản đã được kích hoạt thành công! Bạn có thể đăng nhập ngay bây giờ."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    /**
     * Request a password reset OTP code.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            authService.forgotPassword(request);
            return ResponseEntity.ok(new MessageResponse("Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    /**
     * Verify the password reset OTP code.
     */
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            authService.verifyResetOtp(request);
            return ResponseEntity.ok(new MessageResponse("Mã OTP chính xác. Bạn có thể thiết lập mật khẩu mới."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    /**
     * Reset password using OTP and the new password.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request);
            return ResponseEntity.ok(new MessageResponse("Mật khẩu đã được cập nhật thành công."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }
}
