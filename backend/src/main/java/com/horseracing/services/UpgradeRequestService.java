package com.horseracing.services;

import com.horseracing.dto.request.RejectUpgradeRequest;
import com.horseracing.dto.request.UpgradeRequestSubmit;
import com.horseracing.dto.response.UpgradeRequestResponse;
import com.horseracing.entities.UpgradeRequest;
import com.horseracing.entities.User;
import com.horseracing.entities.enums.RequestStatus;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.UpgradeRequestRepository;
import com.horseracing.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UpgradeRequestService {

    private final UpgradeRequestRepository upgradeRequestRepository;
    private final UserRepository userRepository;

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

        UpgradeRequest upgradeRequest = UpgradeRequest.builder()
                .user(user)
                .requestedRole(role)
                .notes(requestDto.getNotes())
                .status(RequestStatus.PENDING)
                .build();

        upgradeRequest = upgradeRequestRepository.save(upgradeRequest);
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
        
        userRepository.save(user);
        upgradeRequestRepository.save(request);

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

        return UpgradeRequestResponse.fromEntity(request);
    }
}
