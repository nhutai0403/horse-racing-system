package com.horseracing.services;

import com.horseracing.dto.request.AddBlacklistRequest;
import com.horseracing.dto.request.AddFlagRequest;
import com.horseracing.dto.request.UpdateConditionsRequest;
import com.horseracing.dto.response.FlagResponse;
import com.horseracing.dto.response.PreCheckResponse;
import com.horseracing.dto.response.RefereeRaceResponse;
import com.horseracing.entities.*;
import com.horseracing.repositories.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.stereotype.Service;
import com.horseracing.entities.enums.NotificationType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefereeService {

    private final UserRepository userRepository;
    private final RaceRepository raceRepository;
    private final RaceParticipantRepository raceParticipantRepository;
    private final RaceRegistrationRepository raceRegistrationRepository;
    private final JockeyProfileRepository jockeyProfileRepository;
    private final HorseRepository horseRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final BetRepository betRepository;
    private final RaceSimulationRepository raceSimulationRepository;
    private final SimulationHorseStateRepository simulationHorseStateRepository;
    private final RefereeFlagRepository refereeFlagRepository;
    private final BlacklistRepository blacklistRepository;
    private final BanHistoryRepository banHistoryRepository;
    private final PrizeDistributionRepository prizeDistributionRepository;
    private final PlatformTransactionManager transactionManager;
    private final NotificationService notificationService;

    private TransactionTemplate transactionTemplate;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);
    private final ConcurrentHashMap<Integer, ScheduledFuture<?>> activeSimulations = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @Transactional(readOnly = true)
    public List<RefereeRaceResponse> getAssignedRaces(String refereeEmail, String status) {
        User referee = userRepository.findByEmail(refereeEmail)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        List<Race> races = raceRepository.findByRefereeId(referee.getId());
        List<RefereeRaceResponse> result = new ArrayList<>();

        for (Race r : races) {
            boolean matches = false;
            if (status == null || status.isBlank()) {
                matches = true;
            } else if ("upcoming".equalsIgnoreCase(status) || "preparation".equalsIgnoreCase(status)) {
                matches = "Upcoming".equalsIgnoreCase(r.getStatus()) 
                        || "OPEN_FOR_REGISTER".equalsIgnoreCase(r.getStatus()) 
                        || "CLOSED_FOR_REGISTER".equalsIgnoreCase(r.getStatus());
            } else if ("running".equalsIgnoreCase(status) || "ongoing".equalsIgnoreCase(status)) {
                matches = "RUNNING".equalsIgnoreCase(r.getStatus());
            } else if ("finished".equalsIgnoreCase(status) || "completed".equalsIgnoreCase(status)) {
                matches = "FINISHED".equalsIgnoreCase(r.getStatus());
            }

            if (matches) {
                result.add(RefereeRaceResponse.fromEntity(r));
            }
        }
        return result;
    }

    @Transactional(readOnly = true)
    public PreCheckResponse getPreCheck(Integer raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        List<RaceParticipant> participants = raceParticipantRepository.findByRaceId(raceId);
        List<PreCheckResponse.ParticipantPreCheck> list = new ArrayList<>();

        for (RaceParticipant p : participants) {
            JockeyProfile jockey = p.getJockey();
            list.add(PreCheckResponse.ParticipantPreCheck.builder()
                    .participantId(p.getId())
                    .horseId(p.getHorse().getId())
                    .horseName(p.getHorse().getName())
                    .jockeyId(jockey.getId())
                    .jockeyName(jockey.getUser().getFullName())
                    .registeredWeight(jockey.getWeight())
                    .actualWeight(jockey.getWeight()) // actualWeight can be updated via the weight endpoint
                    .status(p.getStatus())
                    .build());
        }

        return PreCheckResponse.builder()
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .trackCondition(race.getRaceTrack().getSurfaceCondition())
                .weather(race.getWeather())
                .participants(list)
                .build();
    }

    @Transactional
    public RefereeRaceResponse updateConditions(Integer raceId, UpdateConditionsRequest request) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if (request.getWeather() != null) {
            race.setWeather(request.getWeather());
        }
        if (request.getTrackCondition() != null) {
            race.setSurfaceType(request.getTrackCondition());
        }

        race = raceRepository.save(race);
        return RefereeRaceResponse.fromEntity(race);
    }

    @Transactional
    public void updateJockeyWeight(Integer raceId, Integer jockeyId, Double actualWeight) {
        JockeyProfile jockey = jockeyProfileRepository.findById(jockeyId)
                .orElseThrow(() -> new RuntimeException("Jockey profile not found"));

        jockey.setWeight(actualWeight);
        jockeyProfileRepository.save(jockey);
    }

    @Transactional
    public void disqualifyParticipant(Integer raceId, Integer participantId, String reason) {
        RaceParticipant participant = raceParticipantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        participant.setStatus("DISQUALIFIED");
        raceParticipantRepository.save(participant);

        RaceRegistration reg = raceRegistrationRepository
                .findFirstByRaceIdAndHorseId(raceId, participant.getHorse().getId())
                .orElse(null);
        if (reg != null) {
            reg.setStatus("REJECTED");
            raceRegistrationRepository.save(reg);

            // Notify Owner and Jockey
            notificationService.sendNotification(
                    reg.getOwner().getUser(),
                    "Truất quyền thi đấu trước trận",
                    "Cặp đấu của bạn (Ngựa: " + participant.getHorse().getName() + ", Jockey: " + participant.getJockey().getUser().getFullName() + ") đã bị Trọng tài loại khỏi vòng đua " + participant.getRace().getRaceName() + " do vi phạm điều lệ thi đấu. Lý do: " + reason + ". Phí tham gia không được hoàn lại.",
                    NotificationType.RACE_STATUS
            );
            notificationService.sendNotification(
                    reg.getJockey().getUser(),
                    "Truất quyền thi đấu trước trận",
                    "Cặp đấu của bạn (Ngựa: " + participant.getHorse().getName() + ", Jockey: " + participant.getJockey().getUser().getFullName() + ") đã bị Trọng tài loại khỏi vòng đua " + participant.getRace().getRaceName() + " do vi phạm điều lệ thi đấu. Lý do: " + reason + ". Phí tham gia không được hoàn lại.",
                    NotificationType.RACE_STATUS
            );
        }

        // Refund all spectator bets on this horse in this race
        List<Bet> bets = betRepository.findByParticipantIdAndStatus(participantId, "PENDING");
        for (Bet bet : bets) {
            bet.setStatus("REFUNDED");
            betRepository.save(bet);

            Wallet wallet = walletRepository.findByUserId(bet.getUser().getId())
                    .orElseGet(() -> {
                        Wallet w = Wallet.builder().user(bet.getUser()).balance(BigDecimal.ZERO).build();
                        return walletRepository.save(w);
                    });

            wallet.setBalance(wallet.getBalance().add(bet.getAmount()));
            walletRepository.save(wallet);

            WalletTransaction transaction = WalletTransaction.builder()
                    .wallet(wallet)
                    .transactionType("REFUND")
                    .amount(bet.getAmount())
                    .status("SUCCESS")
                    .referenceType("BET")
                    .referenceId(bet.getId())
                    .build();
            walletTransactionRepository.save(transaction);

            notificationService.sendNotification(
                    bet.getUser(),
                    "Hoàn tiền cược cuộc đua",
                    "Ngựa " + participant.getHorse().getName() + " đã bị loại khỏi vòng đua " + participant.getRace().getRaceName() + " trước giờ chạy. Hệ thống đã hoàn trả 100% số tiền đặt cược (" + bet.getAmount() + " VNĐ) vào ví của bạn.",
                    NotificationType.WALLET
            );
        }
    }

    @Transactional
    public void startRace(Integer raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if ("RUNNING".equalsIgnoreCase(race.getStatus())) {
            throw new RuntimeException("Race is already running");
        }

        race.setStatus("RUNNING");
        raceRepository.save(race);

        Tournament tournament = race.getTournament();
        if ("Upcoming".equalsIgnoreCase(tournament.getTournamentStatus())) {
            tournament.setTournamentStatus("Active");
            raceRepository.save(race); // save via cascade or directly
        }

        // Reject and refund any remaining PENDING or PENDING_JOCKEY registrations
        List<RaceRegistration> remainingRegs = raceRegistrationRepository.findByRaceId(raceId).stream()
                .filter(r -> "PENDING".equalsIgnoreCase(r.getStatus()) || "PENDING_JOCKEY".equalsIgnoreCase(r.getStatus()))
                .collect(java.util.stream.Collectors.toList());
        BigDecimal entryFee = tournament.getEntryFee();
        for (RaceRegistration reg : remainingRegs) {
            reg.setStatus("REJECTED");
            raceRegistrationRepository.save(reg);

            if (entryFee != null && entryFee.compareTo(BigDecimal.ZERO) > 0) {
                Wallet wallet = walletRepository.findByUserId(reg.getOwner().getUser().getId())
                        .orElseThrow(() -> new RuntimeException("Wallet not found"));
                wallet.setBalance(wallet.getBalance().add(entryFee));
                walletRepository.save(wallet);

                WalletTransaction transaction = WalletTransaction.builder()
                        .wallet(wallet)
                        .transactionType("REFUND")
                        .amount(entryFee)
                        .status("SUCCESS")
                        .referenceType("RACE_REGISTRATION")
                        .referenceId(reg.getId())
                        .build();
                walletTransactionRepository.save(transaction);
            }
        }

        RaceSimulation simulation = RaceSimulation.builder()
                .race(race)
                .startTime(LocalDateTime.now())
                .status("RUNNING")
                .currentTick(0)
                .build();
        simulation = raceSimulationRepository.save(simulation);

        List<RaceParticipant> participants = raceParticipantRepository.findByRaceId(raceId);
        for (RaceParticipant p : participants) {
            if (!"DISQUALIFIED".equalsIgnoreCase(p.getStatus())) {
                p.setStatus("RACING");
                raceParticipantRepository.save(p);

                SimulationHorseState state = SimulationHorseState.builder()
                        .simulation(simulation)
                        .horse(p.getHorse())
                        .currentPosition(0.0)
                        .speed(0.0)
                        .stamina(100.0)
                        .status("RACING")
                        .build();
                simulationHorseStateRepository.save(state);
            }
        }

        startSimulation(simulation.getId());
    }

    @SuppressWarnings("all")
    private void startSimulation(Integer simulationId) {
        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(() -> {
            try {
                Boolean isFinished = transactionTemplate.execute(status -> {
                    RaceSimulation sim = raceSimulationRepository.findById(simulationId).orElse(null);
                    if (sim == null || !"RUNNING".equals(sim.getStatus())) {
                        return true; // Stop task
                    }

                    sim.setCurrentTick(sim.getCurrentTick() + 1);
                    raceSimulationRepository.save(sim);

                    Race race = sim.getRace();
                    List<SimulationHorseState> states = simulationHorseStateRepository.findBySimulationId(simulationId);
                    
                    boolean allFinishedOrDisqualified = true;

                    for (SimulationHorseState state : states) {
                        if ("FINISHED".equals(state.getStatus()) || "DISQUALIFIED".equals(state.getStatus())) {
                            continue;
                        }

                        allFinishedOrDisqualified = false;

                        Horse horse = state.getHorse();
                        RaceParticipant part = raceParticipantRepository.findByRaceIdAndHorseId(race.getId(), horse.getId())
                                .orElse(null);
                        
                        if (part == null || "DISQUALIFIED".equals(part.getStatus())) {
                            state.setStatus("DISQUALIFIED");
                            simulationHorseStateRepository.save(state);
                            continue;
                        }

                        JockeyProfile jockey = part.getJockey();

                        double baseSpeed = 15.0;
                        if (horse.getSpeedRating() != null) {
                            baseSpeed += horse.getSpeedRating() * 0.05;
                        }
                        if (jockey.getRankingScore() != null) {
                            baseSpeed += jockey.getRankingScore() * 0.001;
                        }

                        double currentStamina = state.getStamina();
                        currentStamina = Math.max(0.0, currentStamina - 2.0);
                        state.setStamina(currentStamina);

                        double staminaFactor = currentStamina < 30.0 ? 0.8 : 1.0;
                        double variation = (ThreadLocalRandom.current().nextDouble() - 0.5) * 1.5;

                        double speed = (baseSpeed + variation) * staminaFactor;
                        if (speed < 5.0) speed = 5.0;

                        state.setSpeed(speed);

                        double newPos = state.getCurrentPosition() + speed;
                        state.setCurrentPosition(newPos);

                        if (newPos >= race.getDistance()) {
                            state.setStatus("FINISHED");
                            part.setFinishTime(sim.getCurrentTick());
                            raceParticipantRepository.save(part);
                        }

                        simulationHorseStateRepository.save(state);
                    }

                    if (allFinishedOrDisqualified) {
                        sim.setStatus("FINISHED");
                        sim.setEndTime(LocalDateTime.now());
                        raceSimulationRepository.save(sim);

                        List<RaceParticipant> participants = raceParticipantRepository.findByRaceId(race.getId());
                        List<ParticipantRankInfo> rankInfos = new ArrayList<>();
                        for (RaceParticipant p : participants) {
                            if ("DISQUALIFIED".equals(p.getStatus())) {
                                continue;
                            }
                            long flags = refereeFlagRepository.countBySimulationIdAndHorseId(sim.getId(), p.getHorse().getId());
                            Integer ft = p.getFinishTime();
                            int finishTime = ft != null ? ft : 9999;
                            int finalTime = finishTime + (int)(flags * 3);
                            p.setFinishTime(finalTime);
                            
                            rankInfos.add(new ParticipantRankInfo(p, finalTime));
                        }

                        rankInfos.sort(Comparator.comparingInt(a -> a.finalTime));

                        for (int rank = 0; rank < rankInfos.size(); rank++) {
                            RaceParticipant p = rankInfos.get(rank).participant;
                            p.setFinalRank(rank + 1);
                            p.setStatus("FINISHED");
                            raceParticipantRepository.save(p);
                        }

                        int nextRank = rankInfos.size() + 1;
                        for (RaceParticipant p : participants) {
                            if ("DISQUALIFIED".equals(p.getStatus())) {
                                p.setFinalRank(nextRank++);
                                raceParticipantRepository.save(p);
                            }
                        }

                        return true;
                    }

                    return false;
                });

                if (isFinished) {
                    cancelSimulation(simulationId);
                }
            } catch (RuntimeException e) {
                log.error("Error occurred during race simulation for simulation ID: {}", simulationId, e);
                cancelSimulation(simulationId);
            }
        }, 1, 1, TimeUnit.SECONDS);

        activeSimulations.put(simulationId, future);
    }

    private void cancelSimulation(Integer simulationId) {
        ScheduledFuture<?> future = activeSimulations.remove(simulationId);
        if (future != null) {
            future.cancel(true);
        }
    }

    @Transactional
    public FlagResponse addFlag(Integer raceId, AddFlagRequest request, String refereeEmail) {
        User referee = userRepository.findByEmail(refereeEmail)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        Horse horse = horseRepository.findById(request.getHorseId())
                .orElseThrow(() -> new RuntimeException("Horse not found"));

        RaceSimulation simulation = raceSimulationRepository.findById(request.getSimulationId())
                .orElseThrow(() -> new RuntimeException("Simulation not found"));

        RefereeFlag flag = RefereeFlag.builder()
                .referee(referee)
                .horse(horse)
                .simulation(simulation)
                .violationType(request.getViolationType())
                .description(request.getDescription())
                .build();
        refereeFlagRepository.save(flag);

        long count = refereeFlagRepository.countBySimulationIdAndHorseId(simulation.getId(), horse.getId());
        boolean disqualified = false;
        RaceParticipant part = raceParticipantRepository.findByRaceIdAndHorseId(raceId, horse.getId())
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        if (count >= 3) {
            disqualified = true;
            // Disqualify participant
            part.setStatus("DISQUALIFIED");
            raceParticipantRepository.save(part);

            SimulationHorseState state = simulationHorseStateRepository.findBySimulationIdAndHorseId(simulation.getId(), horse.getId())
                    .orElseThrow(() -> new RuntimeException("Simulation state not found"));
            state.setStatus("DISQUALIFIED");
            simulationHorseStateRepository.save(state);
        }

        if (disqualified) {
            notificationService.sendNotification(
                    horse.getOwner().getUser(),
                    "Truất quyền thi đấu do nhận đủ 3 cờ vi phạm",
                    "Ngựa " + horse.getName() + " đã bị xử thua và truất quyền thi đấu trực tiếp (Disqualified) tại vòng đua " + part.getRace().getRaceName() + " do nhận đủ 3 cờ vi phạm từ Trọng tài.",
                    NotificationType.RACE_STATUS
            );
            notificationService.sendNotification(
                    part.getJockey().getUser(),
                    "Truất quyền thi đấu do nhận đủ 3 cờ vi phạm",
                    "Ngựa " + horse.getName() + " đã bị xử thua và truất quyền thi đấu trực tiếp (Disqualified) tại vòng đua " + part.getRace().getRaceName() + " do nhận đủ 3 cờ vi phạm từ Trọng tài.",
                    NotificationType.RACE_STATUS
            );
        } else {
            notificationService.sendNotification(
                    horse.getOwner().getUser(),
                    "Cảnh cáo vi phạm trên sân đua",
                    "Cảnh cáo: Ngựa " + horse.getName() + " của bạn bị Trọng tài gắn cờ vi phạm (" + request.getViolationType() + " - " + request.getDescription() + ") tại vòng đua " + part.getRace().getRaceName() + ". Tổng số cờ hiện tại: " + count + "/3. Bị phạt cộng thêm " + (count * 3) + " giây vào thời gian về đích.",
                    NotificationType.RACE_STATUS
            );
            notificationService.sendNotification(
                    part.getJockey().getUser(),
                    "Cảnh cáo vi phạm trên sân đua",
                    "Cảnh cáo: Ngựa " + horse.getName() + " của bạn bị Trọng tài gắn cờ vi phạm (" + request.getViolationType() + " - " + request.getDescription() + ") tại vòng đua " + part.getRace().getRaceName() + ". Tổng số cờ hiện tại: " + count + "/3. Bị phạt cộng thêm " + (count * 3) + " giây vào thời gian về đích.",
                    NotificationType.RACE_STATUS
            );
        }

        return FlagResponse.builder()
                .flagId(flag.getId())
                .horseId(horse.getId())
                .totalFlags(count)
                .penaltySeconds((int) (count * 3))
                .isDisqualified(disqualified)
                .build();
    }

    @Transactional
    public void addBlacklist(AddBlacklistRequest request, String refereeEmail) {
        User referee = userRepository.findByEmail(refereeEmail)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        Blacklist blacklist = Blacklist.builder()
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .reason(request.getReason())
                .startDate(request.getEndDate() != null ? LocalDate.now() : LocalDate.now())
                .endDate(request.getEndDate())
                .isPermanent(request.getIsPermanent())
                .status("ACTIVE")
                .build();
        blacklist = blacklistRepository.save(blacklist);

        BanHistory history = BanHistory.builder()
                .blacklist(blacklist)
                .actionBy(referee)
                .actionNote(request.getReason())
                .build();
        banHistoryRepository.save(history);

        if ("USER".equalsIgnoreCase(request.getTargetType())) {
            User target = userRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new RuntimeException("Target user not found"));
            target.setEnabled(false);
            userRepository.save(target);

            notificationService.sendNotification(
                    target,
                    "Tài khoản bị tạm khóa / Đưa vào Blacklist",
                    "Tài khoản của bạn đã bị khóa bởi Trọng tài. Lý do: " + request.getReason() + ". Thời hạn cấm: " + (Boolean.TRUE.equals(request.getIsPermanent()) ? "Vĩnh viễn" : request.getEndDate()) + ". Vui lòng liên hệ Admin để được giải quyết.",
                    NotificationType.SYSTEM_ALERT
            );
        } else if ("HORSE".equalsIgnoreCase(request.getTargetType())) {
            Horse target = horseRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new RuntimeException("Target horse not found"));
            target.setStatus("INACTIVE");
            horseRepository.save(target);

            notificationService.sendNotification(
                    target.getOwner().getUser(),
                    "Chiến mã bị đưa vào Blacklist",
                    "Ngựa " + target.getName() + " của bạn đã bị đưa vào Blacklist bởi Trọng tài. Lý do: " + request.getReason() + ".",
                    NotificationType.SYSTEM_ALERT
            );
        }
    }

    @Transactional
    public void confirmResults(Integer raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if (!"RUNNING".equalsIgnoreCase(race.getStatus())) {
            throw new RuntimeException("Race is not running or already confirmed");
        }

        race.setStatus("FINISHED");
        raceRepository.save(race);

        Tournament tournament = race.getTournament();

        // 1. Prize Distribution
        List<RaceParticipant> participants = raceParticipantRepository.findByRaceId(raceId);
        for (RaceParticipant p : participants) {
            if (p.getFinalRank() != null && p.getFinalRank() <= 3) {
                BigDecimal totalPrize = switch (p.getFinalRank()) {
                    case 1 -> tournament.getPrizeFirst();
                    case 2 -> tournament.getPrizeSecond();
                    case 3 -> tournament.getPrizeThird();
                    default -> BigDecimal.ZERO;
                };

                if (totalPrize == null) totalPrize = BigDecimal.ZERO;

                RaceRegistration reg = raceRegistrationRepository
                        .findFirstByRaceIdAndHorseId(raceId, p.getHorse().getId())
                        .orElse(null);

                if (reg != null && totalPrize.compareTo(BigDecimal.ZERO) > 0) {
                    Double ownerShare = reg.getOwnerSharePercent();
                    double ownerPercent = ownerShare != null ? ownerShare : 100.0;
                    Double jockeyShare = reg.getJockeySharePercent();
                    double jockeyPercent = jockeyShare != null ? jockeyShare : 0.0;

                    BigDecimal ownerAmount = totalPrize.multiply(BigDecimal.valueOf(ownerPercent / 100.0));
                    BigDecimal jockeyAmount = totalPrize.multiply(BigDecimal.valueOf(jockeyPercent / 100.0));

                    // Distribute to Owner
                    Wallet ownerWallet = walletRepository.findByUserId(reg.getOwner().getUser().getId())
                            .orElseGet(() -> {
                                Wallet w = Wallet.builder().user(reg.getOwner().getUser()).balance(BigDecimal.ZERO).build();
                                return walletRepository.save(w);
                            });
                    ownerWallet.setBalance(ownerWallet.getBalance().add(ownerAmount));
                    walletRepository.save(ownerWallet);

                    WalletTransaction wtOwner = WalletTransaction.builder()
                            .wallet(ownerWallet)
                            .transactionType("PRIZE")
                            .amount(ownerAmount)
                            .status("SUCCESS")
                            .referenceType("RACE_PARTICIPANT")
                            .referenceId(p.getId())
                            .build();
                    walletTransactionRepository.save(wtOwner);

                    // Distribute to Jockey
                    Wallet jockeyWallet = walletRepository.findByUserId(reg.getJockey().getUser().getId())
                            .orElseGet(() -> {
                                Wallet w = Wallet.builder().user(reg.getJockey().getUser()).balance(BigDecimal.ZERO).build();
                                return walletRepository.save(w);
                            });
                    jockeyWallet.setBalance(jockeyWallet.getBalance().add(jockeyAmount));
                    walletRepository.save(jockeyWallet);

                    WalletTransaction wtJockey = WalletTransaction.builder()
                            .wallet(jockeyWallet)
                            .transactionType("PRIZE")
                            .amount(jockeyAmount)
                            .status("SUCCESS")
                            .referenceType("RACE_PARTICIPANT")
                            .referenceId(p.getId())
                            .build();
                    walletTransactionRepository.save(wtJockey);

                    // Save PrizeDistribution
                    PrizeDistribution pd = PrizeDistribution.builder()
                            .participant(p)
                            .totalPrize(totalPrize)
                            .ownerAmount(ownerAmount)
                            .jockeyAmount(jockeyAmount)
                            .status("DISTRIBUTED")
                            .distributedAt(LocalDateTime.now())
                            .build();
                    prizeDistributionRepository.save(pd);

                    notificationService.sendNotification(
                            reg.getOwner().getUser(),
                            "Nhận tiền thưởng giải đấu",
                            "Chúc mừng! Ngựa " + p.getHorse().getName() + " và Jockey " + p.getJockey().getUser().getFullName() + " đã đạt Giải " + (p.getFinalRank() == 1 ? "Nhất" : (p.getFinalRank() == 2 ? "Nhì" : "Ba")) + " tại vòng đua " + race.getRaceName() + ". Số tiền thưởng " + ownerAmount + " VNĐ đã được cộng vào ví của bạn.",
                            NotificationType.WALLET
                    );

                    notificationService.sendNotification(
                            reg.getJockey().getUser(),
                            "Nhận tiền thưởng giải đấu",
                            "Chúc mừng! Ngựa " + p.getHorse().getName() + " và Jockey " + p.getJockey().getUser().getFullName() + " đã đạt Giải " + (p.getFinalRank() == 1 ? "Nhất" : (p.getFinalRank() == 2 ? "Nhì" : "Ba")) + " tại vòng đua " + race.getRaceName() + ". Số tiền thưởng " + jockeyAmount + " VNĐ đã được cộng vào ví của bạn.",
                            NotificationType.WALLET
                    );
                }
            }
        }

        // 2. Betting Payout
        RaceParticipant winner = participants.stream()
                .filter(p -> p.getFinalRank() != null && p.getFinalRank() == 1)
                .findFirst()
                .orElse(null);

        List<Bet> bets = betRepository.findByRaceId(raceId);
        for (Bet bet : bets) {
            if ("PENDING".equals(bet.getStatus())) {
                if (winner != null && bet.getParticipant().getId().equals(winner.getId())) {
                    bet.setStatus("WON");
                    BigDecimal payout = bet.getAmount().multiply(bet.getOdds());
                    bet.setPayoutAmount(payout);
                    betRepository.save(bet);

                    Wallet wallet = walletRepository.findByUserId(bet.getUser().getId())
                            .orElseGet(() -> {
                                Wallet w = Wallet.builder().user(bet.getUser()).balance(BigDecimal.ZERO).build();
                                return walletRepository.save(w);
                            });
                    wallet.setBalance(wallet.getBalance().add(payout));
                    walletRepository.save(wallet);

                    WalletTransaction transaction = WalletTransaction.builder()
                            .wallet(wallet)
                            .transactionType("PRIZE")
                            .amount(payout)
                            .status("SUCCESS")
                            .referenceType("BET")
                            .referenceId(bet.getId())
                            .build();
                    walletTransactionRepository.save(transaction);

                    notificationService.sendNotification(
                            bet.getUser(),
                            "Chúc mừng thắng cược cuộc đua",
                            "Chúc mừng! Bạn đã thắng cược tại vòng đua " + race.getRaceName() + " với số tiền thắng cược " + payout + " VNĐ (dựa trên tỷ lệ odds x số tiền đặt cược). Số tiền đã được cộng vào ví.",
                            NotificationType.WALLET
                    );
                } else {
                    bet.setStatus("LOST");
                    bet.setPayoutAmount(BigDecimal.ZERO);
                    betRepository.save(bet);

                    notificationService.sendNotification(
                            bet.getUser(),
                            "Kết quả đặt cược cuộc đua",
                            "Kết quả vòng đua " + race.getRaceName() + " đã được Trọng tài xác nhận. Thật tiếc, vé cược của bạn vào ngựa " + bet.getParticipant().getHorse().getName() + " không trúng thưởng. Chúc bạn may mắn lần sau!",
                            NotificationType.RACE_STATUS
                    );
                }
            }
        }
    }

    private static class ParticipantRankInfo {
        RaceParticipant participant;
        int finalTime;

        ParticipantRankInfo(RaceParticipant participant, int finalTime) {
            this.participant = participant;
            this.finalTime = finalTime;
        }
    }
}
