package com.horseracing.services;

import com.horseracing.dto.request.RejectUpgradeRequest;
import com.horseracing.dto.request.UpgradeRequestSubmit;
import com.horseracing.dto.response.UpgradeRequestResponse;
import com.horseracing.entities.UpgradeRequest;
import com.horseracing.entities.User;
import com.horseracing.entities.HorseOwnerProfile;
import com.horseracing.entities.JockeyProfile;
import com.horseracing.entities.enums.RequestStatus;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.UpgradeRequestRepository;
import com.horseracing.repositories.UserRepository;
import com.horseracing.repositories.HorseOwnerProfileRepository;
import com.horseracing.repositories.JockeyProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.horseracing.entities.enums.NotificationType;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UpgradeRequestService {

    private final UpgradeRequestRepository upgradeRequestRepository;
    private final UserRepository userRepository;
    private final HorseOwnerProfileRepository horseOwnerProfileRepository;
    private final JockeyProfileRepository jockeyProfileRepository;
    private final NotificationService notificationService;

    @Transactional
    public UpgradeRequestResponse submitRequest(String email, UpgradeRequestSubmit requestDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate requested role
        Role role = requestDto.getRequestedRole();
        if (role == Role.ADMIN || role == Role.SPECTATOR) {
            throw new RuntimeException("Cannot request upgrade to ADMIN or SPECTATOR role");
        }

        // Check if user already has this role
        if (user.getRole() == role) {
            throw new RuntimeException("User already has the requested role");
        }

        // Check if user has a pending request
        if (upgradeRequestRepository.existsByUserAndStatus(user, RequestStatus.PENDING)) {
            throw new RuntimeException("You already have a pending upgrade request");
        }

        // General validation
        if (requestDto.getFullName() == null || requestDto.getFullName().trim().isEmpty()) {
            throw new RuntimeException("Full name is required");
        }
        if (requestDto.getDateOfBirth() == null) {
            throw new RuntimeException("Date of birth is required");
        }
        if (requestDto.getPhoneNumber() == null || requestDto.getPhoneNumber().trim().isEmpty()) {
            throw new RuntimeException("Phone number is required");
        }
        if (requestDto.getIdentityNumber() == null || requestDto.getIdentityNumber().trim().isEmpty()) {
            throw new RuntimeException("Identity card / Passport number is required");
        }

        // Role-specific validation
        switch (role) {
            case JOCKEY -> {
                if (requestDto.getWeight() == null || requestDto.getWeight() < 40 || requestDto.getWeight() > 80) {
                    throw new RuntimeException("Jockey weight must be between 40 and 80 kg");
                }
                if (requestDto.getHeight() == null || requestDto.getHeight() <= 0) {
                    throw new RuntimeException("Jockey height must be a positive number");
                }
                if (requestDto.getLicenseNumber() == null || requestDto.getLicenseNumber().trim().isEmpty()) {
                    throw new RuntimeException("Jockey license number is required");
                }
            }
            case HORSE_OWNER -> {
                if (requestDto.getStableName() == null || requestDto.getStableName().trim().isEmpty()) {
                    throw new RuntimeException("Stable name is required");
                }
                if (requestDto.getStableAddress() == null || requestDto.getStableAddress().trim().isEmpty()) {
                    throw new RuntimeException("Stable address is required");
                }
            }
            case RACE_REFEREE -> {
                if (requestDto.getCertificationNumber() == null || requestDto.getCertificationNumber().trim().isEmpty()) {
                    throw new RuntimeException("Referee certification number is required");
                }
                if (requestDto.getExperienceYears() == null || requestDto.getExperienceYears() < 0) {
                    throw new RuntimeException("Referee experience years must be a positive number");
                }
            }
            default -> {
            }
        }

        java.util.List<String> documentUrls = requestDto.getDocumentUrls() != null ? 
                requestDto.getDocumentUrls() : new java.util.ArrayList<>();

        UpgradeRequest upgradeRequest = UpgradeRequest.builder()
                .user(user)
                .requestedRole(role)
                .notes(requestDto.getNotes())
                .status(RequestStatus.PENDING)
                .fullName(requestDto.getFullName())
                .dateOfBirth(requestDto.getDateOfBirth())
                .phoneNumber(requestDto.getPhoneNumber())
                .identityNumber(requestDto.getIdentityNumber())
                .weight(requestDto.getWeight())
                .height(requestDto.getHeight())
                .licenseNumber(requestDto.getLicenseNumber())
                .stableName(requestDto.getStableName())
                .stableAddress(requestDto.getStableAddress())
                .certificationNumber(requestDto.getCertificationNumber())
                .experienceYears(requestDto.getExperienceYears())
                .documentUrls(documentUrls)
                .build();

        upgradeRequest = upgradeRequestRepository.save(upgradeRequest);

        // Notify admins
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .collect(Collectors.toList());
        for (User admin : admins) {
            notificationService.sendNotification(
                    admin,
                    "Có yêu cầu nâng cấp tài khoản mới",
                    "Người dùng " + user.getFullName() + " đã gửi yêu cầu nâng cấp tài khoản lên " + role + ". Vui lòng vào trang quản trị để xem xét.",
                    NotificationType.ROLE_UPGRADE
            );
        }

        return UpgradeRequestResponse.fromEntity(upgradeRequest);
    }

    @Transactional(readOnly = true)
    public List<UpgradeRequestResponse> getUserRequests(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return upgradeRequestRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(UpgradeRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UpgradeRequestResponse> getAllRequests(RequestStatus status) {
        List<UpgradeRequest> requests;
        if (status != null) {
            requests = upgradeRequestRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            requests = upgradeRequestRepository.findAll();
        }
        return requests.stream()
                .map(UpgradeRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public UpgradeRequestResponse approveRequest(Integer requestId) {
        UpgradeRequest request = upgradeRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Upgrade request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be approved");
        }

        request.setStatus(RequestStatus.APPROVED);
        User user = request.getUser();
        user.setRole(request.getRequestedRole());
        user.setPhone(request.getPhoneNumber());
        
        userRepository.save(user);

        // Auto-create profiles (check for duplicates first)
        if (request.getRequestedRole() == Role.HORSE_OWNER) {
            if (horseOwnerProfileRepository.findByUserEmail(user.getEmail()).isEmpty()) {
                HorseOwnerProfile ownerProfile = HorseOwnerProfile.builder()
                        .user(user)
                        .stableName(request.getStableName())
                        .stableAddress(request.getStableAddress())
                        .phone(request.getPhoneNumber())
                        .identityNumber(request.getIdentityNumber())
                        .dateOfBirth(request.getDateOfBirth())
                        .reputationStars(5.0)
                        .approvalStatus("APPROVED")
                        .build();
                horseOwnerProfileRepository.save(ownerProfile);
            }
        } else if (request.getRequestedRole() == Role.JOCKEY) {
            if (jockeyProfileRepository.findByUserEmail(user.getEmail()).isEmpty()) {
                JockeyProfile jockeyProfile = JockeyProfile.builder()
                        .user(user)
                        .height(request.getHeight())
                        .weight(request.getWeight())
                        .licenseNumber(request.getLicenseNumber())
                        .experienceYear(request.getExperienceYears())
                        .approvalStatus("APPROVED")
                        .build();
                jockeyProfileRepository.save(jockeyProfile);
            }
        }

        upgradeRequestRepository.save(request);

        notificationService.sendNotification(
                user,
                "Nâng cấp tài khoản thành công",
                "Chúc mừng! Yêu cầu nâng cấp tài khoản của bạn lên " + request.getRequestedRole() + " đã được Ban quản trị duyệt thành công. Vui lòng đăng nhập lại để trải nghiệm giao diện mới.",
                NotificationType.ROLE_UPGRADE
        );

        return UpgradeRequestResponse.fromEntity(request);
    }

    @Transactional
    public UpgradeRequestResponse rejectRequest(Integer requestId, RejectUpgradeRequest rejectDto) {
        UpgradeRequest request = upgradeRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Upgrade request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be rejected");
        }

        request.setStatus(RequestStatus.REJECTED);
        request.setRejectionReason(rejectDto.getRejectionReason());

        upgradeRequestRepository.save(request);

        notificationService.sendNotification(
                request.getUser(),
                "Yêu cầu nâng cấp bị từ chối",
                "Yêu cầu nâng cấp tài khoản của bạn đã bị từ chối. Lý do từ chối: " + rejectDto.getRejectionReason(),
                NotificationType.ROLE_UPGRADE
        );

        return UpgradeRequestResponse.fromEntity(request);
    }
}
