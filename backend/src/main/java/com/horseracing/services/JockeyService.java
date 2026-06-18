package com.horseracing.services;

import com.horseracing.dto.request.UpdateJockeyProfileRequest;
import com.horseracing.dto.response.JockeyProfileResponse;
import com.horseracing.entities.JockeyProfile;
import com.horseracing.entities.UpgradeRequest;
import com.horseracing.entities.User;
import com.horseracing.repositories.JockeyProfileRepository;
import com.horseracing.repositories.UpgradeRequestRepository;
import com.horseracing.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import com.horseracing.dto.response.*;
import com.horseracing.entities.RaceRegistration;
import com.horseracing.entities.enums.NotificationType;
import com.horseracing.repositories.RaceRegistrationRepository;
import com.horseracing.repositories.RaceParticipantRepository;
@Service
@RequiredArgsConstructor
public class JockeyService {

    private final UserRepository userRepository;
    private final JockeyProfileRepository jockeyProfileRepository;
    private final UpgradeRequestRepository upgradeRequestRepository;
    private final RaceRegistrationRepository raceRegistrationRepository;
    private final RaceParticipantRepository raceParticipantRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public JockeyProfileResponse getJockeyProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        JockeyProfile jockey = jockeyProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Jockey profile not found"));

        List<String> documentUrls = upgradeRequestRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .filter(req -> req.getStatus() == com.horseracing.entities.enums.RequestStatus.APPROVED 
                        && req.getRequestedRole() == com.horseracing.entities.enums.Role.JOCKEY)
                .findFirst()
                .map(UpgradeRequest::getDocumentUrls)
                .orElse(java.util.Collections.emptyList());

        return JockeyProfileResponse.builder()
                .id(jockey.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .height(jockey.getHeight())
                .weight(jockey.getWeight())
                .winRate(jockey.getWinRate())
                .experienceYear(jockey.getExperienceYear())
                .rankingScore(jockey.getRankingScore())
                .licenseNumber(jockey.getLicenseNumber())
                .bankAccount(jockey.getBankAccount())
                .approvalStatus(jockey.getApprovalStatus())
                .documentUrls(documentUrls)
                .build();
    }

    @Transactional
    public JockeyProfileResponse updateJockeyProfile(String email, UpdateJockeyProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        JockeyProfile jockey = jockeyProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Jockey profile not found"));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        
        if (request.getHeight() != null) jockey.setHeight(request.getHeight());
        if (request.getWeight() != null) jockey.setWeight(request.getWeight());
        if (request.getExperienceYear() != null) jockey.setExperienceYear(request.getExperienceYear());
        if (request.getLicenseNumber() != null) jockey.setLicenseNumber(request.getLicenseNumber());
        if (request.getBankAccount() != null) jockey.setBankAccount(request.getBankAccount());

        userRepository.save(user);
        jockey = jockeyProfileRepository.save(jockey);

        List<String> documentUrls = upgradeRequestRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .filter(req -> req.getStatus() == com.horseracing.entities.enums.RequestStatus.APPROVED 
                        && req.getRequestedRole() == com.horseracing.entities.enums.Role.JOCKEY)
                .findFirst()
                .map(UpgradeRequest::getDocumentUrls)
                .orElse(java.util.Collections.emptyList());

        return JockeyProfileResponse.builder()
                .id(jockey.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .height(jockey.getHeight())
                .weight(jockey.getWeight())
                .winRate(jockey.getWinRate())
                .experienceYear(jockey.getExperienceYear())
                .rankingScore(jockey.getRankingScore())
                .licenseNumber(jockey.getLicenseNumber())
                .bankAccount(jockey.getBankAccount())
                .approvalStatus(jockey.getApprovalStatus())
                .documentUrls(documentUrls)
                .build();
    }

    @Transactional(readOnly = true)
    public List<RaceRegistrationResponse> getInvitations(String email) {
        return raceRegistrationRepository.findByJockeyUserEmailAndStatus(email, "PENDING_JOCKEY").stream()
                .map(RaceRegistrationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public RaceRegistrationResponse respondToInvitation(String email, Integer id, String action) {
        RaceRegistration registration = raceRegistrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        
        if (!registration.getJockey().getUser().getEmail().equals(email)) {
            throw new RuntimeException("Not authorized to respond to this invitation");
        }

        if (!"PENDING_JOCKEY".equalsIgnoreCase(registration.getStatus())) {
            throw new RuntimeException("Invitation is not pending");
        }

        if ("ACCEPT".equalsIgnoreCase(action)) {
            registration.setStatus("PENDING");
            registration = raceRegistrationRepository.save(registration);
            notificationService.sendNotification(
                    registration.getOwner().getUser(),
                    "Jockey chấp nhận lời mời thi đấu",
                    "Jockey " + registration.getJockey().getUser().getFullName() + " đã đồng ý tham gia vòng đua " + registration.getRace().getRaceName() + " với ngựa " + registration.getHorse().getName() + ". Hồ sơ đăng ký đã chính thức được gửi lên Ban Tổ Chức (chờ Admin duyệt).",
                    NotificationType.REGISTRATION
            );
        } else if ("REJECT".equalsIgnoreCase(action)) {
            registration.setStatus("REJECTED_BY_JOCKEY");
            registration = raceRegistrationRepository.save(registration);
            notificationService.sendNotification(
                    registration.getOwner().getUser(),
                    "Jockey từ chối lời mời thi đấu",
                    "Jockey " + registration.getJockey().getUser().getFullName() + " đã từ chối lời mời tham gia vòng đua " + registration.getRace().getRaceName() + " với ngựa " + registration.getHorse().getName() + ". Lượt đăng ký này đã bị hủy bỏ.",
                    NotificationType.REGISTRATION
            );
        } else {
            throw new RuntimeException("Invalid action. Use ACCEPT or REJECT");
        }

        return RaceRegistrationResponse.fromEntity(registration);
    }

    @Transactional(readOnly = true)
    public List<JockeyScheduleResponse> getSchedule(String email) {
        return raceParticipantRepository.findByJockeyUserEmailAndStatusNot(email, "FINISHED").stream()
                .map(rp -> JockeyScheduleResponse.builder()
                        .participantId(rp.getId())
                        .raceId(rp.getRace().getId())
                        .raceName(rp.getRace().getRaceName())
                        .raceDate(rp.getRace().getRaceDate())
                        .startTime(rp.getRace().getStartTime())
                        .horseId(rp.getHorse().getId())
                        .horseName(rp.getHorse().getName())
                        .gateNumber(rp.getGateNumber())
                        .participantStatus(rp.getStatus())
                        .raceStatus(rp.getRace().getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JockeyHistoryResponse> getHistory(String email) {
        return raceParticipantRepository.findByJockeyUserEmailAndStatus(email, "FINISHED").stream()
                .map(rp -> {
                    BigDecimal prize = BigDecimal.ZERO;
                    if (rp.getFinalRank() != null && rp.getFinalRank() <= 3) {
                        RaceRegistration reg = raceRegistrationRepository
                                .findFirstByRaceIdAndHorseId(rp.getRace().getId(), rp.getHorse().getId())
                                .orElse(null);
                        
                        if (reg != null && reg.getJockeySharePercent() != null) {
                            BigDecimal totalPrize = switch (rp.getFinalRank()) {
                                case 1 -> rp.getRace().getTournament().getPrizeFirst();
                                case 2 -> rp.getRace().getTournament().getPrizeSecond();
                                case 3 -> rp.getRace().getTournament().getPrizeThird();
                                default -> BigDecimal.ZERO;
                            };
                            
                            if (totalPrize != null) {
                                prize = totalPrize.multiply(BigDecimal.valueOf(reg.getJockeySharePercent() / 100.0));
                            }
                        }
                    }
                    
                    return JockeyHistoryResponse.builder()
                            .participantId(rp.getId())
                            .raceId(rp.getRace().getId())
                            .raceName(rp.getRace().getRaceName())
                            .raceDate(rp.getRace().getRaceDate())
                            .horseId(rp.getHorse().getId())
                            .horseName(rp.getHorse().getName())
                            .finalRank(rp.getFinalRank())
                            .finishTime(rp.getFinishTime())
                            .prizeMoney(prize)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JockeyLeaderboardResponse> getLeaderboard() {
        return jockeyProfileRepository.findAllByOrderByRankingScoreDescWinRateDesc().stream()
                .map(jp -> JockeyLeaderboardResponse.builder()
                        .jockeyId(jp.getId())
                        .jockeyName(jp.getUser().getFullName())
                        .rankingScore(jp.getRankingScore())
                        .winRate(jp.getWinRate())
                        .experienceYear(jp.getExperienceYear())
                        .avatarUrl(jp.getUser().getAvatarUrl())
                        .build())
                .collect(Collectors.toList());
    }
}
