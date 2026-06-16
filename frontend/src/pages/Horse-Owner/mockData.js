// Mock Database for Horse Owner Frontend

export const initialOwnerProfile = {
  fullName: "",
  email: "kietlh@prestigeturf.com",
  phoneNumber: "0901234567",
  identityNumber: "079096001234",
  dateOfBirth: "1988-11-24",
  stableName: "",
  stableAddress: "Binh Duong Boulevard, Thu Dau Mot, Binh Duong",
  description: "Royal Stable chuyên cung cấp các giống ngựa thuần chủng xuất sắc nhất thế giới, định hình tương lai của đua ngựa chuyên nghiệp.",
  walletBalance: 1250000000, // in VND
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
  avatarZoom: 1,
  avatarOffsetX: 0,
  avatarOffsetY: 0
};

export const initialHorses = [
  {
    id: "H001",
    name: "Midnight Runner",
    breed: "Thoroughbred",
    age: 6,
    gender: "Gelding",
    sire: "Northern Dancer",
    dam: "Wind Runner",
    status: "READY", 
    matchesPlayed: 24,
    winRate: 68,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDX7HoMSdMb6JPWb7leEl52QM6KQJGuBPP2NbEP9D9Bm4nVtpQ9885-X0rie7N4lV-iVulVS_70IR-XGLFP9MIq_B9-3wDKM0PWmwkIA6APdv6fDmjXjxEHJsDWZGJecnubUw1EMiBzjR-HluVcLBxG6ruPF607Aq9b8MLfl1M-hZUusD0pS8k11SHJ4CMcq5cI3E94TXxU2t2rOL5O2gFSIpz3EXAhVDMtlDOe08Nm0OXnOaYJ-zDKsGm7JWLXRL1bPqRrwXED",
    metrics: { speed: 92, stamina: 88, gatePerformance: 95 },
    top1Rate: 68,
    top2Rate: 16,
    top3Rate: 10,
    medicalLogs: [
      { id: 1, desc: "Routine Checkup", date: "2026-05-12", status: "Cleared" },
      { id: 2, desc: "Shoeing replacement", date: "2026-04-28", status: "Completed" }
    ]
  },
  {
    id: "H002",
    name: "Silver Cloud",
    breed: "Arabian",
    age: 4,
    gender: "Colt",
    sire: "Secretariat",
    dam: "Silver Spoon",
    status: "TRAINING",
    matchesPlayed: 12,
    winRate: 45,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyody69QQzixiJLWEKdQV0aaleOZAo4jb7ZhUVMIgEffv8-1JgwF6MbombNSSs-mAdSxs2agxSBNO4fTs3h3aFrBlRvjCIF6JbsJOLPxXVkUyVk4vxm6NUtz12AdgrpPM9s4FGYYpl3GkaLj9CXk0muXz_HwaijuAVr44O59NfquTTDLNpSYRY5e29u-eO1OztHyQkquE8yHRDwnvSzHgdMgmzqpk_4C9r1O5srY_eEJaIJFKSxt2B2fq1ocs_4rrpXVIzZALZ",
    metrics: { speed: 78, stamina: 82, gatePerformance: 80 },
    top1Rate: 45,
    top2Rate: 25,
    top3Rate: 15,
    medicalLogs: [
      { id: 1, desc: "Vaccination Booster", date: "2026-05-02", status: "Completed" },
      { id: 2, desc: "Minor Dental check", date: "2026-03-14", status: "Resolved" }
    ]
  },
  {
    id: "H003",
    name: "Storm Weaver",
    breed: "Quarter Horse",
    age: 5,
    gender: "Stallion",
    sire: "Seattle Slew",
    dam: "Stormy Petrel",
    status: "SICK",
    matchesPlayed: 18,
    winRate: 55,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyody69QQzixiJLWEKdQV0aaleOZAo4jb7ZhUVMIgEffv8-1JgwF6MbombNSSs-mAdSxs2agxSBNO4fTs3h3aFrBlRvjCIF6JbsJOLPxXVkUyVk4vxm6NUtz12AdgrpPM9s4FGYYpl3GkaLj9CXk0muXz_HwaijuAVr44O59NfquTTDLNpSYRY5e29u-eO1OztHyQkquE8yHRDwnvSzHgdMgmzqpk_4C9r1O5srY_eEJaIJFKSxt2B2fq1ocs_4rrpXVIzZALZ",
    metrics: { speed: 85, stamina: 65, gatePerformance: 88 },
    top1Rate: 55,
    top2Rate: 20,
    top3Rate: 12,
    medicalLogs: [
      { id: 1, desc: "Hoof inflammation check", date: "2026-05-20", status: "Under Treatment" },
      { id: 2, desc: "Laser therapy session", date: "2026-05-28", status: "Completed" }
    ]
  }
];

export const initialSystemUsers = [
  // Jockeys
  {
    id: "JOK001",
    fullName: "Lafitt Dettori",
    role: "JOCKEY",
    weight: 52,
    height: 163,
    licenseNumber: "LIC-JOC-9981",
    friendStatus: "FRIEND", // FRIEND, PENDING_SENT, PENDING_RECEIVED, NONE
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    experienceYears: 12,
    winRate: 65,
    matchesPlayed: 450,
    description: "Nài ngựa chuyên nghiệp với hơn 12 năm kinh nghiệm chinh chiến tại các giải đấu cự ly trung bình châu Á."
  },
  {
    id: "JOK002",
    fullName: "Ryan Moore",
    role: "JOCKEY",
    weight: 54,
    height: 165,
    licenseNumber: "LIC-JOC-1290",
    friendStatus: "NONE",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    experienceYears: 8,
    winRate: 58,
    matchesPlayed: 320,
    description: "Kỷ lục gia đua ngựa tốc độ, chuyên gia bứt phá ở các vòng đua nước rút 1200m."
  },
  {
    id: "JOK003",
    fullName: "Nguyen Van Hung",
    role: "JOCKEY",
    weight: 50,
    height: 160,
    licenseNumber: "LIC-JOC-4456",
    friendStatus: "FRIEND",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    experienceYears: 4,
    winRate: 40,
    matchesPlayed: 120,
    description: "Nài ngựa trẻ triển vọng với phong cách thi đấu điềm tĩnh và khả năng phối hợp ăn ý với các giống ngựa Arabian."
  },
  {
    id: "JOK004",
    fullName: "Le Minh Tuan",
    role: "JOCKEY",
    weight: 51,
    height: 162,
    licenseNumber: "LIC-JOC-8872",
    friendStatus: "PENDING_RECEIVED",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
    experienceYears: 6,
    winRate: 45,
    matchesPlayed: 180,
    description: "Chuyên gia vượt chướng ngại vật và điều khiển nhịp độ trận đấu xuất sắc ở các đường chạy cỏ Turf."
  },
  // Other Horse Owners
  {
    id: "OWN202",
    fullName: "Tran The Anh",
    role: "HORSE_OWNER",
    stableName: "Heavenly Horse Stable",
    stableAddress: "Cu Chi, Ho Chi Minh City",
    friendStatus: "FRIEND",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    description: "Chủ trang trại Heavenly Horse Stable chuyên nhập khẩu và nhân giống ngựa thuần chủng từ châu Âu."
  },
  {
    id: "OWN203",
    fullName: "Pham Thuy Linh",
    role: "HORSE_OWNER",
    stableName: "Platinum Stable",
    stableAddress: "Dong Anh, Hanoi",
    friendStatus: "NONE",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    description: "Platinum Stable - Nơi nuôi dưỡng những chiến mã tốc độ và bền bỉ hàng đầu cho giải vô địch quốc gia."
  }
];

export const initialTournaments = [
  {
    id: "T001",
    tournamentName: "Dubai World Cup 2026",
    location: "Meydan Racecourse, Dubai",
    date: "2026-06-30",
    time: "17:00",
    trackType: "Dirt • Fast",
    prizePool: "12,000,000 USD",
    status: "OPEN_FOR_REGISTER", 
    registeredHorses: []
  },
  {
    id: "T002",
    tournamentName: "Royal Ascot Series 2026",
    location: "Ascot, Berkshire, UK",
    date: "2026-07-18",
    time: "14:30",
    trackType: "Turf • Good",
    prizePool: "8,000,000 GBP",
    status: "OPEN_FOR_REGISTER",
    registeredHorses: ["Midnight Runner"]
  },
  {
    id: "T003",
    tournamentName: "Binh Duong International Championship 2026",
    location: "Dai Nam Racecourse, Binh Duong",
    date: "2026-08-15",
    time: "09:00",
    trackType: "Turf • Excellent",
    prizePool: "5,000,000,000 VND",
    status: "OPEN_FOR_REGISTER",
    registeredHorses: []
  }
];

export const initialTransactions = [
  {
    id: "TX001",
    date: "2026-05-28 14:32:10",
    type: "WINNINGS",
    horse: "Midnight Runner",
    event: "Dai Nam Cup Tournament - 1st Place",
    amount: 150000000, // +150,000,000 VND
  },
  {
    id: "TX002",
    date: "2026-05-15 09:00:00",
    type: "ENTRY_FEE",
    horse: "Silver Cloud",
    event: "Registration Fee - Royal Ascot 2026",
    amount: -12000000, // -12,000,000 VND
  },
  {
    id: "TX003",
    date: "2026-04-20 10:15:44",
    type: "DEPOSIT",
    event: "Deposit from linked bank account",
    amount: 500000000, // +500,000,000 VND
  }
];

export const initialRaceHistory = [
  {
    id: "RH001",
    date: "2026-05-28",
    tournament: "Dai Nam Cup 2026",
    raceRound: "A-League Finals - 1200m",
    horseName: "Midnight Runner",
    jockeyName: "Lafitt Dettori",
    placement: 1,
    finishTime: "1:09.45",
    prizeMoney: 150000000,
    revenueShare: "Horse Owner: 70% (105M) • Jockey: 30% (45M)",
  },
  {
    id: "RH002",
    date: "2026-04-12",
    tournament: "Phu Tho Horse Racing Open",
    raceRound: "Qualifying Round 2 - 1400m",
    horseName: "Silver Cloud",
    jockeyName: "Ryan Moore",
    placement: 3,
    finishTime: "1:25.12",
    prizeMoney: 30000000,
    revenueShare: "Horse Owner: 70% (21M) • Jockey: 30% (9M)",
  }
];
