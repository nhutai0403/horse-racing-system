package com.horseracing.configs;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting filter for sensitive auth endpoints to prevent brute-force attacks.
 * Uses IP-based rate limiting with Bucket4j token bucket algorithm.
 *
 * Limits:
 * - Login: 10 attempts per minute
 * - OTP verification: 5 attempts per minute
 * - Forgot password: 3 attempts per minute
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> otpBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> forgotPasswordBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Only rate-limit POST requests to sensitive endpoints
        if (!"POST".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        Bucket bucket = null;

        if (path.equals("/api/auth/login") || path.equals("/api/auth/google")) {
            bucket = loginBuckets.computeIfAbsent(clientIp, k -> createBucket(10, 1));
        } else if (path.equals("/api/auth/verify-reset-otp") || path.equals("/api/auth/reset-password")) {
            bucket = otpBuckets.computeIfAbsent(clientIp, k -> createBucket(5, 1));
        } else if (path.equals("/api/auth/forgot-password")) {
            bucket = forgotPasswordBuckets.computeIfAbsent(clientIp, k -> createBucket(3, 1));
        }

        if (bucket != null && !bucket.tryConsume(1)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"status\":429,\"message\":\"Too many requests. Please try again later.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Create a rate-limiting bucket.
     *
     * @param tokens   number of tokens allowed per period
     * @param minutes  refill period in minutes
     */
    private Bucket createBucket(int tokens, int minutes) {
        Bandwidth limit = Bandwidth.classic(tokens, Refill.greedy(tokens, Duration.ofMinutes(minutes)));
        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
