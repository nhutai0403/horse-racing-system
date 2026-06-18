package com.horseracing.services;

import com.horseracing.dto.response.ConnectionUserResponse;
import com.horseracing.entities.HorseOwnerProfile;
import com.horseracing.entities.JockeyProfile;
import com.horseracing.entities.User;
import com.horseracing.entities.UserConnection;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.HorseOwnerProfileRepository;
import com.horseracing.repositories.JockeyProfileRepository;
import com.horseracing.repositories.UserConnectionRepository;
import com.horseracing.repositories.UserRepository;
import com.horseracing.repositories.UpgradeRequestRepository;
import com.horseracing.entities.UpgradeRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import com.horseracing.entities.enums.NotificationType;

@Service
@RequiredArgsConstructor
public class UserConnectionService {

    private final UserConnectionRepository userConnectionRepository;
    private final UserRepository userRepository;
    private final JockeyProfileRepository jockeyProfileRepository;
    private final HorseOwnerProfileRepository horseOwnerProfileRepository;
    private final UpgradeRequestRepository upgradeRequestRepository;
    private final NotificationService notificationService;

    @Transactional
    public ConnectionUserResponse sendRequest(String requesterEmail, Integer recipientId) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Requester user not found"));

        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient user not found"));

        if (requester.getId().equals(recipientId)) {
            throw new RuntimeException("Cannot connect with yourself");
        }

        // Check if connection already exists
        Optional<UserConnection> existing = userConnectionRepository.findConnectionBetween(requester.getId(), recipientId);
        if (existing.isPresent()) {
            UserConnection conn = existing.get();
            switch (conn.getStatus()) {
                case "ACCEPTED" -> throw new RuntimeException("You are already connected");
                case "PENDING" -> throw new RuntimeException("Connection request is already pending");
                default -> {
                    // If rejected, we can reactivate it
                    conn.setStatus("PENDING");
                    conn.setRequester(requester);
                    conn.setRecipient(recipient);
                    conn = userConnectionRepository.save(conn);
                    notificationService.sendNotification(
                            recipient,
                            "Lời mời kết nối mới",
                            "Bạn nhận được lời mời kết nối mới từ " + requester.getFullName() + " (Vai trò: " + requester.getRole() + ").",
                            NotificationType.CONNECTION
                    );
                    return mapToResponse(conn, requester);
                }
            }
        }

        UserConnection connection = UserConnection.builder()
                .requester(requester)
                .recipient(recipient)
                .status("PENDING")
                .build();

        connection = userConnectionRepository.save(connection);
        notificationService.sendNotification(
                recipient,
                "Lời mời kết nối mới",
                "Bạn nhận được lời mời kết nối mới từ " + requester.getFullName() + " (Vai trò: " + requester.getRole() + ").",
                NotificationType.CONNECTION
        );
        return mapToResponse(connection, requester);
    }

    @Transactional
    public ConnectionUserResponse respondToRequest(String recipientEmail, Integer connectionId, String action) {
        UserConnection connection = userConnectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found"));

        if (!connection.getRecipient().getEmail().equals(recipientEmail)) {
            throw new RuntimeException("You are not authorized to respond to this request");
        }

        if (!"PENDING".equals(connection.getStatus())) {
            throw new RuntimeException("Connection is not in PENDING status");
        }

        if ("ACCEPT".equalsIgnoreCase(action)) {
            connection.setStatus("ACCEPTED");
            connection = userConnectionRepository.save(connection);
            notificationService.sendNotification(
                    connection.getRequester(),
                    "Yêu cầu kết nối được chấp nhận",
                    connection.getRecipient().getFullName() + " đã chấp nhận yêu cầu kết nối của bạn. Hai bạn giờ đã có thể đăng ký tham gia các giải đấu cùng nhau.",
                    NotificationType.CONNECTION
            );
            return mapToResponse(connection, connection.getRecipient());
        } else if ("REJECT".equalsIgnoreCase(action)) {
            notificationService.sendNotification(
                    connection.getRequester(),
                    "Yêu cầu kết nối bị từ chối",
                    connection.getRecipient().getFullName() + " đã từ chối yêu cầu kết nối của bạn.",
                    NotificationType.CONNECTION
            );
            // Delete connection request so they can try again later
            userConnectionRepository.delete(connection);
            return ConnectionUserResponse.builder()
                    .friendStatus("NONE")
                    .build();
        } else {
            throw new RuntimeException("Invalid action. Must be ACCEPT or REJECT");
        }
    }

    @Transactional
    public void deleteConnection(String userEmail, Integer connectionId) {
        UserConnection connection = userConnectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!connection.getRequester().getId().equals(user.getId()) && !connection.getRecipient().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to delete this connection");
        }

        userConnectionRepository.delete(connection);
    }

    @Transactional(readOnly = true)
    public List<ConnectionUserResponse> getFriends(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserConnection> connections = userConnectionRepository.findAllFriends(user.getId());
        return connections.stream()
                .map(conn -> mapToResponse(conn, user))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConnectionUserResponse> getConnectionsDirectory(String email, String query, String roleFilter) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Fetch all potential connections (Jockeys & Owners, excluding current user)
        List<User> allUsers = userRepository.findAll().stream()
                .filter(u -> u.isEnabled() && !u.getId().equals(currentUser.getId()))
                .filter(u -> u.getRole() == Role.JOCKEY || u.getRole() == Role.HORSE_OWNER)
                .collect(Collectors.toList());

        List<ConnectionUserResponse> directory = new ArrayList<>();

        for (User u : allUsers) {
            // Filter by role
            if (roleFilter != null && !"ALL".equalsIgnoreCase(roleFilter)) {
                if (!u.getRole().name().equalsIgnoreCase(roleFilter)) {
                    continue;
                }
            }

            // Filter by search query
            if (query != null && !query.trim().isEmpty()) {
                String searchStr = query.toLowerCase();
                boolean matchesName = u.getFullName().toLowerCase().contains(searchStr);
                boolean matchesId = String.valueOf(u.getId()).contains(searchStr);
                if (!matchesName && !matchesId) {
                    continue;
                }
            }

            // Find connection status
            Optional<UserConnection> connOpt = userConnectionRepository.findConnectionBetween(currentUser.getId(), u.getId());
            String friendStatus = "NONE";
            Integer connectionId = null;

            if (connOpt.isPresent()) {
                UserConnection conn = connOpt.get();
                connectionId = conn.getId();
                if ("ACCEPTED".equals(conn.getStatus())) {
                    friendStatus = "FRIEND";
                } else if ("PENDING".equals(conn.getStatus())) {
                    if (conn.getRequester().getId().equals(currentUser.getId())) {
                        friendStatus = "PENDING_SENT";
                    } else {
                        friendStatus = "PENDING_RECEIVED";
                    }
                }
            }

            ConnectionUserResponse response = buildConnectionUserResponse(u, friendStatus, connectionId);
            directory.add(response);
        }

        return directory;
    }

    private ConnectionUserResponse buildConnectionUserResponse(User user, String friendStatus, Integer connectionId) {
        ConnectionUserResponse.ConnectionUserResponseBuilder builder = ConnectionUserResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .avatar(user.getAvatarUrl())
                .friendStatus(friendStatus)
                .connectionId(connectionId);

        if (user.getRole() == Role.JOCKEY) {
            Optional<JockeyProfile> jockeyOpt = jockeyProfileRepository.findByUserEmail(user.getEmail());
            if (jockeyOpt.isPresent()) {
                JockeyProfile jp = jockeyOpt.get();
                builder.experienceYears(jp.getExperienceYear())
                        .weight(jp.getWeight())
                        .height(jp.getHeight())
                        .licenseNumber(jp.getLicenseNumber());
            }
        } else if (user.getRole() == Role.HORSE_OWNER) {
            Optional<HorseOwnerProfile> ownerOpt = horseOwnerProfileRepository.findByUserEmail(user.getEmail());
            if (ownerOpt.isPresent()) {
                HorseOwnerProfile op = ownerOpt.get();
                builder.stableName(op.getStableName())
                        .stableAddress(op.getStableAddress())
                        .description(op.getDescription())
                        .reputationStars(op.getReputationStars());
            }
        }

        List<String> documentUrls = upgradeRequestRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .filter(req -> req.getStatus() == com.horseracing.entities.enums.RequestStatus.APPROVED 
                        && req.getRequestedRole() == user.getRole())
                .findFirst()
                .map(UpgradeRequest::getDocumentUrls)
                .orElse(java.util.Collections.emptyList());
        builder.documentUrls(documentUrls);

        return builder.build();
    }

    private ConnectionUserResponse mapToResponse(UserConnection conn, User relativeTo) {
        User friend = conn.getRequester().getId().equals(relativeTo.getId()) ? conn.getRecipient() : conn.getRequester();
        String friendStatus = "NONE";
        if ("ACCEPTED".equals(conn.getStatus())) {
            friendStatus = "FRIEND";
        } else if ("PENDING".equals(conn.getStatus())) {
            if (conn.getRequester().getId().equals(relativeTo.getId())) {
                friendStatus = "PENDING_SENT";
            } else {
                friendStatus = "PENDING_RECEIVED";
            }
        }
        return buildConnectionUserResponse(friend, friendStatus, conn.getId());
    }
}
