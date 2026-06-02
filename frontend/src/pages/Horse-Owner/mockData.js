// Mock Database for Horse Owner Frontend

export const initialOwnerProfile = {
  fullName: "Lam Hoang Kiet",
  email: "kietlh@prestigeturf.com",
  phoneNumber: "0901234567",
  identityNumber: "079096001234",
  dateOfBirth: "1988-11-24",
  stableName: "Royal Stable",
  stableAddress: "Binh Duong Boulevard, Thu Dau Mot, Binh Duong",
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
    age: 6,
    gender: "Gelding",
    sire: "Northern Dancer",
    dam: "Wind Runner",
    status: "Race Ready", // Race Ready, In Training, Recovery
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDX7HoMSdMb6JPWb7leEl52QM6KQJGuBPP2NbEP9D9Bm4nVtpQ9885-X0rie7N4lV-iVulVS_70IR-XGLFP9MIq_B9-3wDKM0PWmwkIA6APdv6fDmjXjxEHJsDWZGJecnubUw1EMiBzjR-HluVcLBxG6ruPF607Aq9b8MLfl1M-hZUusD0pS8k11SHJ4CMcq5cI3E94TXxU2t2rOL5O2gFSIpz3EXAhVDMtlDOe08Nm0OXnOaYJ-zDKsGm7JWLXRL1bPqRrwXED",
    metrics: { speed: 92, stamina: 88, gatePerformance: 95 },
    medicalLogs: [
      { id: 1, desc: "Routine Checkup", date: "2026-05-12", status: "Cleared" },
      { id: 2, desc: "Shoeing replacement", date: "2026-04-28", status: "Completed" }
    ]
  },
  {
    id: "H002",
    name: "Silver Cloud",
    age: 4,
    gender: "Colt",
    sire: "Secretariat",
    dam: "Silver Spoon",
    status: "In Training",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyody69QQzixiJLWEKdQV0aaleOZAo4jb7ZhUVMIgEffv8-1JgwF6MbombNSSs-mAdSxs2agxSBNO4fTs3h3aFrBlRvjCIF6JbsJOLPxXVkUyVk4vxm6NUtz12AdgrpPM9s4FGYYpl3GkaLj9CXk0muXz_HwaijuAVr44O59NfquTTDLNpSYRY5e29u-eO1OztHyQkquE8yHRDwnvSzHgdMgmzqpk_4C9r1O5srY_eEJaIJFKSxt2B2fq1ocs_4rrpXVIzZALZ",
    metrics: { speed: 78, stamina: 82, gatePerformance: 80 },
    medicalLogs: [
      { id: 1, desc: "Vaccination Booster", date: "2026-05-02", status: "Completed" },
      { id: 2, desc: "Minor Dental check", date: "2026-03-14", status: "Resolved" }
    ]
  },
  {
    id: "H003",
    name: "Storm Weaver",
    age: 5,
    gender: "Stallion",
    sire: "Seattle Slew",
    dam: "Stormy Petrel",
    status: "Recovery",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyody69QQzixiJLWEKdQV0aaleOZAo4jb7ZhUVMIgEffv8-1JgwF6MbombNSSs-mAdSxs2agxSBNO4fTs3h3aFrBlRvjCIF6JbsJOLPxXVkUyVk4vxm6NUtz12AdgrpPM9s4FGYYpl3GkaLj9CXk0muXz_HwaijuAVr44O59NfquTTDLNpSYRY5e29u-eO1OztHyQkquE8yHRDwnvSzHgdMgmzqpk_4C9r1O5srY_eEJaIJFKSxt2B2fq1ocs_4rrpXVIzZALZ",
    metrics: { speed: 85, stamina: 65, gatePerformance: 88 },
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
    experienceYears: 12
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
    experienceYears: 8
  },
  {
    id: "JOK003",
    fullName: "Nguyen Van Hung",
    role: "JOCKEY",
    weight: 50,
    height: 160,
    licenseNumber: "LIC-JOC-4456",
    friendStatus: "PENDING_SENT",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    experienceYears: 4
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
    experienceYears: 6
  },
  // Other Horse Owners
  {
    id: "OWN202",
    fullName: "Tran The Anh",
    role: "HORSE_OWNER",
    stableName: "Heavenly Horse Stable",
    stableAddress: "Cu Chi, Ho Chi Minh City",
    friendStatus: "FRIEND",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "OWN203",
    fullName: "Pham Thuy Linh",
    role: "HORSE_OWNER",
    stableName: "Platinum Stable",
    stableAddress: "Dong Anh, Hanoi",
    friendStatus: "NONE",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
  }
];

export const initialTournaments = [
  {
    id: "T001",
    tournamentName: "Dubai World Cup 2026",
    location: "Meydan Racecourse, Dubai",
    date: "2026-06-30",
    prizePool: "12,000,000 USD",
    status: "OPEN_FOR_REGISTER", // OPEN_FOR_REGISTER, CLOSED, COMPLETED
    registeredHorses: []
  },
  {
    id: "T002",
    tournamentName: "Royal Ascot Series 2026",
    location: "Ascot, Berkshire, UK",
    date: "2026-07-18",
    prizePool: "8,000,000 GBP",
    status: "OPEN_FOR_REGISTER",
    registeredHorses: ["Midnight Runner"]
  },
  {
    id: "T003",
    tournamentName: "Binh Duong International Championship 2026",
    location: "Dai Nam Racecourse, Binh Duong",
    date: "2026-08-15",
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
    prizeMoney: 150000000,
    revenueShare: "Horse Owner: 70% (105,000,000 VND) • Jockey: 30% (45,000,000 VND)",
  },
  {
    id: "RH002",
    date: "2026-04-12",
    tournament: "Phu Tho Horse Racing Open",
    raceRound: "Qualifying Round 2 - 1400m",
    horseName: "Silver Cloud",
    jockeyName: "Ryan Moore",
    placement: 3,
    prizeMoney: 30000000,
    revenueShare: "Horse Owner: 70% (21,000,000 VND) • Jockey: 30% (9,000,000 VND)",
  }
];

