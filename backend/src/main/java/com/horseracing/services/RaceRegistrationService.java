package com.horseracing.services;

import com.horseracing.dto.request.RegisterRaceRequest;
import com.horseracing.dto.response.RaceRegistrationResponse;
import com.horseracing.entities.*;
import com.horseracing.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.horseracing.entities.enums.NotificationType;

@Service
@RequiredArgsConstructor
public class RaceRegistrationService {

    private final RaceRegistrationRepository raceRegistrationRepository;
    private final RaceRepository raceRepository;
    private final HorseRepository horseRepository;
    private final JockeyProfileRepository jockeyProfileRepository;
    private final HorseOwnerProfileRepository horseOwnerProfileRepository;
    private final RaceParticipantRepository raceParticipantRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final NotificationService notificationService;

    @Transactional
    public RaceRegistrationResponse submitRegistration(String ownerEmail, RegisterRaceRequest request) {
        // Validate share percentage
        if (Math.abs((request.getOwnerSharePercent() + request.getJockeySharePercent()) - 100.0) > 0.001) {
            throw new RuntimeException("Total profit sharing percentage must equal 100%");
        }

        HorseOwnerProfile owner = horseOwnerProfileRepository.findByUserEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Race not found"));

        // Check race status
        if (!"OPEN_FOR_REGISTER".equalsIgnoreCase(race.getStatus())) {
            throw new RuntimeException("Race is not open for registration");
        }

        Horse horse = horseRepository.findById(request.getHorseId())
                .orElseThrow(() -> new RuntimeException("Horse not found"));

        // Check registration window
        LocalDateTime now = LocalDateTime.now();
        Tournament tournament = race.getTournament();
        if (tournament.getRegistrationOpeningTime() != null && now.isBefore(tournament.getRegistrationOpeningTime())) {
            throw new RuntimeException("Registration has not opened yet");
        }
        if (tournament.getRegistrationDeadline() != null && now.isAfter(tournament.getRegistrationDeadline())) {
            throw new RuntimeException("Registration deadline has passed");
        }

        // Validate horse constraints
        if (tournament.getAllowedClasses() != null && !tournament.getAllowedClasses().isBlank()) {
            String horseBreed = horse.getBreed().getBreedName();
            boolean breedMatch = java.util.Arrays.stream(tournament.getAllowedClasses().split(","))
                    .map(String::trim)
                    .anyMatch(b -> b.equalsIgnoreCase(horseBreed));
            if (!breedMatch) {
                throw new RuntimeException("Horse breed '" + horseBreed + "' is not allowed in this tournament (Allowed: " + tournament.getAllowedClasses() + ")");
            }
        }
        if (tournament.getAllowedGenders() != null && !tournament.getAllowedGenders().isBlank()) {
            String horseGender = horse.getGender();
            if (horseGender == null) {
                throw new RuntimeException("Horse gender is not specified");
            }
            boolean genderMatch = java.util.Arrays.stream(tournament.getAllowedGenders().split(","))
                    .map(String::trim)
                    .anyMatch(g -> g.equalsIgnoreCase(horseGender));
            if (!genderMatch) {
                throw new RuntimeException("Horse gender '" + horseGender + "' is not allowed in this tournament (Allowed: " + tournament.getAllowedGenders() + ")");
            }
        }
        if (tournament.getAllowedAges() != null && !tournament.getAllowedAges().isBlank()) {
            if (!isAgeAllowed(horse.getAge(), tournament.getAllowedAges())) {
                throw new RuntimeException("Horse age " + horse.getAge() + " is not allowed in this tournament (Allowed: " + tournament.getAllowedAges() + ")");
            }
        }

        // Verify horse belongs to owner
        if (!horse.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("This horse does not belong to you");
        }

        JockeyProfile jockey = jockeyProfileRepository.findById(request.getJockeyId())
                .orElseThrow(() -> new RuntimeException("Jockey profile not found"));

        // Verify horse or jockey is not already registered in this race
        boolean horseRegistered = raceRegistrationRepository.existsByRaceIdAndHorseIdAndStatusNot(
                race.getId(), horse.getId(), "REJECTED");
        if (horseRegistered) {
            throw new RuntimeException("This horse is already registered for this race");
        }

        boolean jockeyRegistered = raceRegistrationRepository.existsByRaceIdAndJockeyIdAndStatusNot(
                race.getId(), jockey.getId(), "REJECTED");
        if (jockeyRegistered) {
            throw new RuntimeException("This jockey is already registered for this race");
        }

        BigDecimal entryFee = race.getTournament().getEntryFee();
        if (entryFee != null && entryFee.compareTo(BigDecimal.ZERO) > 0) {
            Wallet wallet = walletRepository.findByUserId(owner.getUser().getId())
                    .orElseGet(() -> {
                        Wallet newWallet = Wallet.builder()
                                .user(owner.getUser())
                                .balance(BigDecimal.ZERO)
                                .build();
                        return walletRepository.save(newWallet);
                    });

            if (wallet.getBalance().compareTo(entryFee) < 0) {
                throw new RuntimeException("Insufficient wallet balance to pay entry fee");
            }

            wallet.setBalance(wallet.getBalance().subtract(entryFee));
            walletRepository.save(wallet);
        }

        RaceRegistration registration = RaceRegistration.builder()
                .race(race)
                .horse(horse)
                .jockey(jockey)
                .owner(owner)
                .ownerSharePercent(request.getOwnerSharePercent())
                .jockeySharePercent(request.getJockeySharePercent())
                .status("PENDING_JOCKEY")
                .build();

        registration = raceRegistrationRepository.save(registration);

        if (entryFee != null && entryFee.compareTo(BigDecimal.ZERO) > 0) {
            Wallet wallet = walletRepository.findByUserId(owner.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("Wallet not found"));
            WalletTransaction transaction = WalletTransaction.builder()
                    .wallet(wallet)
                    .transactionType("ENTRY_FEE")
                    .amount(entryFee)
                    .status("SUCCESS")
                    .referenceType("RACE_REGISTRATION")
                    .referenceId(registration.getId())
                    .build();
            walletTransactionRepository.save(transaction);
        }

        notificationService.sendNotification(
                jockey.getUser(),
                "Lời mời tham gia giải đấu",
                "Chủ ngựa " + owner.getUser().getFullName() + " mời bạn làm nài ngựa điều khiển ngựa " + horse.getName() + " tham gia vòng đua " + race.getRaceName() + " thuộc giải đấu " + race.getTournament().getTournamentName() + " với tỷ lệ chia thưởng: Jockey " + request.getJockeySharePercent() + "% - Owner " + request.getOwnerSharePercent() + "%. Vui lòng xác nhận.",
                NotificationType.REGISTRATION
        );

        return RaceRegistrationResponse.fromEntity(registration);
    }

    @Transactional(readOnly = true)
    public List<RaceRegistrationResponse> getRegistrationsByRace(Integer raceId) {
        return raceRegistrationRepository.findByRaceId(raceId).stream()
                .map(RaceRegistrationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RaceRegistrationResponse> getAllRegistrations() {
        return raceRegistrationRepository.findAll().stream()
                .map(RaceRegistrationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RaceRegistrationResponse> getRegistrationsByOwner(String ownerEmail) {
        return raceRegistrationRepository.findByOwnerUserEmail(ownerEmail).stream()
                .map(RaceRegistrationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public RaceRegistrationResponse approveRegistration(Integer registrationId) {
        RaceRegistration registration = raceRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Race registration not found"));

        if (!"PENDING".equalsIgnoreCase(registration.getStatus())) {
            throw new RuntimeException("Only pending registrations can be approved");
        }

        Race race = registration.getRace();
        long approvedCount = raceParticipantRepository.countByRaceId(race.getId());

        if (approvedCount >= race.getMaxHorses()) {
            throw new RuntimeException("Race has reached its maximum slots of " + race.getMaxHorses());
        }

        // Update registration status
        registration.setStatus("APPROVED");
        registration = raceRegistrationRepository.save(registration);

        // Create race participant and assign gate number
        RaceParticipant participant = RaceParticipant.builder()
                .race(race)
                .horse(registration.getHorse())
                .jockey(registration.getJockey())
                .gateNumber((int) approvedCount + 1)
                .status("READY")
                .build();

        raceParticipantRepository.save(participant);

        notificationService.sendNotification(
                registration.getOwner().getUser(),
                "Đăng ký giải đấu được phê duyệt",
                "Đăng ký thi đấu vòng đua " + race.getRaceName() + " với ngựa " + registration.getHorse().getName() + " của bạn đã được Admin phê duyệt chính thức. Bạn đã nằm trong danh sách thi đấu.",
                NotificationType.REGISTRATION
        );
        notificationService.sendNotification(
                registration.getJockey().getUser(),
                "Đăng ký giải đấu được phê duyệt",
                "Đăng ký thi đấu vòng đua " + race.getRaceName() + " với ngựa " + registration.getHorse().getName() + " của bạn đã được Admin phê duyệt chính thức. Bạn đã nằm trong danh sách thi đấu.",
                NotificationType.REGISTRATION
        );

        return RaceRegistrationResponse.fromEntity(registration);
    }

    @Transactional
    public RaceRegistrationResponse rejectRegistration(Integer registrationId) {
        RaceRegistration registration = raceRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Race registration not found"));

        if (!"PENDING".equalsIgnoreCase(registration.getStatus())) {
            throw new RuntimeException("Only pending registrations can be rejected");
        }

        registration.setStatus("REJECTED");
        registration = raceRegistrationRepository.save(registration);

        notificationService.sendNotification(
                registration.getOwner().getUser(),
                "Đăng ký giải đấu không được chọn",
                "Đăng ký thi đấu vòng đua " + registration.getRace().getRaceName() + " với ngựa " + registration.getHorse().getName() + " của bạn không được chọn (do vượt quá số lượng giới hạn hoặc không đạt tiêu chí giải đấu). Phí tham gia (nếu có) đã được hoàn lại 100% vào ví.",
                NotificationType.REGISTRATION
        );
        notificationService.sendNotification(
                registration.getJockey().getUser(),
                "Đăng ký giải đấu không được chọn",
                "Đăng ký thi đấu vòng đua " + registration.getRace().getRaceName() + " với ngựa " + registration.getHorse().getName() + " của bạn không được chọn (do vượt quá số lượng giới hạn hoặc không đạt tiêu chí giải đấu). Phí tham gia (nếu có) đã được hoàn lại 100% vào ví.",
                NotificationType.REGISTRATION
        );

        return RaceRegistrationResponse.fromEntity(registration);
    }

    @Transactional
    public RaceRegistrationResponse cancelRegistration(String ownerEmail, Integer registrationId) {
        RaceRegistration registration = raceRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Race registration not found"));

        if (!registration.getOwner().getUser().getEmail().equalsIgnoreCase(ownerEmail)) {
            throw new RuntimeException("Not authorized to cancel this registration");
        }

        if (!"OPEN_FOR_REGISTER".equalsIgnoreCase(registration.getRace().getStatus())) {
            throw new RuntimeException("Cannot cancel registration because the race is not open for registration");
        }

        if (!"PENDING".equalsIgnoreCase(registration.getStatus()) && !"PENDING_JOCKEY".equalsIgnoreCase(registration.getStatus())) {
            throw new RuntimeException("Only pending registrations can be cancelled");
        }

        registration.setStatus("CANCELLED");
        registration = raceRegistrationRepository.save(registration);

        BigDecimal entryFee = registration.getRace().getTournament().getEntryFee();
        if (entryFee != null && entryFee.compareTo(BigDecimal.ZERO) > 0) {
            Wallet wallet = walletRepository.findByUserId(registration.getOwner().getUser().getId())
                    .orElseThrow(() -> new RuntimeException("Wallet not found"));

            wallet.setBalance(wallet.getBalance().add(entryFee));
            walletRepository.save(wallet);

            WalletTransaction transaction = WalletTransaction.builder()
                    .wallet(wallet)
                    .transactionType("REFUND")
                    .amount(entryFee)
                    .status("SUCCESS")
                    .referenceType("RACE_REGISTRATION")
                    .referenceId(registration.getId())
                    .build();
            walletTransactionRepository.save(transaction);
        }

        notificationService.sendNotification(
                registration.getJockey().getUser(),
                "Hủy đăng ký giải đấu",
                "Chủ ngựa " + registration.getOwner().getUser().getFullName() + " đã hủy đăng ký tham gia vòng đua " + registration.getRace().getRaceName() + " đối với bạn.",
                NotificationType.REGISTRATION
        );

        return RaceRegistrationResponse.fromEntity(registration);
    }

    @Transactional
    public RaceRegistrationResponse updateRegistration(String ownerEmail, Integer registrationId, RegisterRaceRequest request) {
        if (Math.abs((request.getOwnerSharePercent() + request.getJockeySharePercent()) - 100.0) > 0.001) {
            throw new RuntimeException("Total profit sharing percentage must equal 100%");
        }

        RaceRegistration registration = raceRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Race registration not found"));

        if (!registration.getOwner().getUser().getEmail().equalsIgnoreCase(ownerEmail)) {
            throw new RuntimeException("Not authorized to update this registration");
        }

        if (!"OPEN_FOR_REGISTER".equalsIgnoreCase(registration.getRace().getStatus())) {
            throw new RuntimeException("Cannot update registration because the race is not open for registration");
        }

        // Check registration window
        LocalDateTime now = LocalDateTime.now();
        Tournament tournament = registration.getRace().getTournament();
        if (tournament.getRegistrationOpeningTime() != null && now.isBefore(tournament.getRegistrationOpeningTime())) {
            throw new RuntimeException("Registration has not opened yet");
        }
        if (tournament.getRegistrationDeadline() != null && now.isAfter(tournament.getRegistrationDeadline())) {
            throw new RuntimeException("Registration deadline has passed");
        }

        if (!"PENDING".equalsIgnoreCase(registration.getStatus()) && !"PENDING_JOCKEY".equalsIgnoreCase(registration.getStatus())) {
            throw new RuntimeException("Only pending registrations can be updated");
        }

        Horse horse = horseRepository.findById(request.getHorseId())
                .orElseThrow(() -> new RuntimeException("Horse not found"));
        if (!horse.getOwner().getId().equals(registration.getOwner().getId())) {
            throw new RuntimeException("This horse does not belong to you");
        }

        JockeyProfile jockey = jockeyProfileRepository.findById(request.getJockeyId())
                .orElseThrow(() -> new RuntimeException("Jockey profile not found"));

        if (!horse.getId().equals(registration.getHorse().getId())) {
            boolean horseRegistered = raceRegistrationRepository.existsByRaceIdAndHorseIdAndStatusNot(
                    registration.getRace().getId(), horse.getId(), "REJECTED");
            if (horseRegistered) {
                throw new RuntimeException("This horse is already registered for this race");
            }
            
            // Validate horse constraints
            if (tournament.getAllowedClasses() != null && !tournament.getAllowedClasses().isBlank()) {
                String horseBreed = horse.getBreed().getBreedName();
                boolean breedMatch = java.util.Arrays.stream(tournament.getAllowedClasses().split(","))
                        .map(String::trim)
                        .anyMatch(b -> b.equalsIgnoreCase(horseBreed));
                if (!breedMatch) {
                    throw new RuntimeException("Horse breed '" + horseBreed + "' is not allowed in this tournament (Allowed: " + tournament.getAllowedClasses() + ")");
                }
            }
            if (tournament.getAllowedGenders() != null && !tournament.getAllowedGenders().isBlank()) {
                String horseGender = horse.getGender();
                if (horseGender == null) {
                    throw new RuntimeException("Horse gender is not specified");
                }
                boolean genderMatch = java.util.Arrays.stream(tournament.getAllowedGenders().split(","))
                        .map(String::trim)
                        .anyMatch(g -> g.equalsIgnoreCase(horseGender));
                if (!genderMatch) {
                    throw new RuntimeException("Horse gender '" + horseGender + "' is not allowed in this tournament (Allowed: " + tournament.getAllowedGenders() + ")");
                }
            }
            if (tournament.getAllowedAges() != null && !tournament.getAllowedAges().isBlank()) {
                if (!isAgeAllowed(horse.getAge(), tournament.getAllowedAges())) {
                    throw new RuntimeException("Horse age " + horse.getAge() + " is not allowed in this tournament (Allowed: " + tournament.getAllowedAges() + ")");
                }
            }

            registration.setHorse(horse);
        }

        if (!jockey.getId().equals(registration.getJockey().getId())) {
            boolean jockeyRegistered = raceRegistrationRepository.existsByRaceIdAndJockeyIdAndStatusNot(
                    registration.getRace().getId(), jockey.getId(), "REJECTED");
            if (jockeyRegistered) {
                throw new RuntimeException("This jockey is already registered for this race");
            }
            registration.setJockey(jockey);
        }

        registration.setOwnerSharePercent(request.getOwnerSharePercent());
        registration.setJockeySharePercent(request.getJockeySharePercent());
        registration.setCreatedAt(LocalDateTime.now());
        registration.setStatus("PENDING_JOCKEY");

        registration = raceRegistrationRepository.save(registration);

        notificationService.sendNotification(
                registration.getJockey().getUser(),
                "Cập nhật thông tin đăng ký giải đấu",
                "Thông tin đăng ký thi đấu vòng đua " + registration.getRace().getRaceName() + " của bạn đã được cập nhật bởi Chủ ngựa " + registration.getOwner().getUser().getFullName() + ". Vui lòng kiểm tra và xác nhận lại.",
                NotificationType.REGISTRATION
        );

        return RaceRegistrationResponse.fromEntity(registration);
    }

    @Transactional
    public void confirmRegistration(Integer raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if (!"OPEN_FOR_REGISTER".equalsIgnoreCase(race.getStatus())) {
            throw new RuntimeException("Race is not open for registration");
        }

        List<RaceRegistration> eligibleRegs = raceRegistrationRepository.findByRaceId(raceId).stream()
                .filter(r -> "PENDING".equalsIgnoreCase(r.getStatus()) || "APPROVED".equalsIgnoreCase(r.getStatus()))
                .collect(Collectors.toList());

        Integer minSlotsVal = race.getTournament().getMinSlots();
        int minSlots = minSlotsVal != null ? minSlotsVal : 0;
        if (eligibleRegs.size() < minSlots) {
            throw new RuntimeException("Cannot confirm registration. The number of eligible registrations (" + eligibleRegs.size() + ") is less than the minimum slots required (" + minSlots + ").");
        }

        race.setStatus("CLOSED_FOR_REGISTER");
        raceRepository.save(race);
    }

    private boolean isAgeAllowed(Integer age, String allowedAges) {
        if (age == null) return false;
        if (allowedAges == null || allowedAges.isBlank()) return true;
        
        String[] parts = allowedAges.split(",");
        for (String part : parts) {
            String clean = part.trim().toLowerCase();
            if (clean.isBlank()) continue;
            
            if (clean.contains("-")) {
                String[] range = clean.split("-");
                if (range.length == 2) {
                    try {
                        int min = Integer.parseInt(range[0].trim());
                        int max = Integer.parseInt(range[1].trim());
                        if (age >= min && age <= max) {
                            return true;
                        }
                    } catch (NumberFormatException ignored) {}
                }
                continue;
            }
            
            if (clean.startsWith("trên") || clean.startsWith("above") || clean.startsWith(">")) {
                String numStr = clean.replaceAll("[^0-9]", "");
                if (!numStr.isEmpty()) {
                    try {
                        int val = Integer.parseInt(numStr);
                        if (age > val) {
                            return true;
                        }
                    } catch (NumberFormatException ignored) {}
                }
                continue;
            }
            
            if (clean.startsWith("dưới") || clean.startsWith("below") || clean.startsWith("<")) {
                String numStr = clean.replaceAll("[^0-9]", "");
                if (!numStr.isEmpty()) {
                    try {
                        int val = Integer.parseInt(numStr);
                        if (age < val) {
                            return true;
                        }
                    } catch (NumberFormatException ignored) {}
                }
                continue;
            }
            
            try {
                int val = Integer.parseInt(clean);
                if (age == val) {
                    return true;
                }
            } catch (NumberFormatException ignored) {}
        }
        return false;
    }
}
