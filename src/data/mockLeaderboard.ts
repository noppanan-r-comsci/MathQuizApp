import { LeaderboardEntry } from '../types';

// Mock Data สำหรับ Leaderboard
export const mockLeaderboardData: LeaderboardEntry[] = [
  {
    rank: 1,
    playerId: 'player_001',
    playerName: 'อัจฉรา นักคิด',
    score: 98,
    percentage: 98,
    timeUsed: 105, // 1:45
    completedAt: new Date('2024-01-15T14:30:00'),
  },
  {
    rank: 2,
    playerId: 'player_002',
    playerName: 'สมชาย เก่งเลข',
    score: 95,
    percentage: 95,
    timeUsed: 132, // 2:12
    completedAt: new Date('2024-01-15T15:15:00'),
  },
  {
    rank: 3,
    playerId: 'player_003',
    playerName: 'มาลี คิดเร็ว',
    score: 92,
    percentage: 92,
    timeUsed: 150, // 2:30
    completedAt: new Date('2024-01-15T16:00:00'),
  },
  {
    rank: 4,
    playerId: 'player_004',
    playerName: 'กิตติ แม่นยำ',
    score: 90,
    percentage: 90,
    timeUsed: 168, // 2:48
    completedAt: new Date('2024-01-15T16:45:00'),
  },
  {
    rank: 5,
    playerId: 'player_005',
    playerName: 'วิทยา คิดดี',
    score: 87,
    percentage: 87,
    timeUsed: 195, // 3:15
    completedAt: new Date('2024-01-15T17:30:00'),
  },
  {
    rank: 6,
    playerId: 'player_006',
    playerName: 'สุดา มั่นใจ',
    score: 85,
    percentage: 85,
    timeUsed: 210, // 3:30
    completedAt: new Date('2024-01-15T18:00:00'),
  },
  {
    rank: 7,
    playerId: 'player_007',
    playerName: 'ธนวัฒน์ รวดเร็ว',
    score: 83,
    percentage: 83,
    timeUsed: 180, // 3:00
    completedAt: new Date('2024-01-15T18:30:00'),
  },
  {
    rank: 8,
    playerId: 'player_008',
    playerName: 'นิรมล ใจเย็น',
    score: 80,
    percentage: 80,
    timeUsed: 240, // 4:00
    completedAt: new Date('2024-01-15T19:00:00'),
  },
  {
    rank: 9,
    playerId: 'player_009',
    playerName: 'ประเสริฐ ลองดู',
    score: 78,
    percentage: 78,
    timeUsed: 270, // 4:30
    completedAt: new Date('2024-01-15T19:30:00'),
  },
  {
    rank: 10,
    playerId: 'player_010',
    playerName: 'เกศวรา พยายาม',
    score: 75,
    percentage: 75,
    timeUsed: 300, // 5:00
    completedAt: new Date('2024-01-15T20:00:00'),
  },
];

// ฟังก์ชันแปลงเวลา (วินาที) เป็น string
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// ฟังก์ชันจัดเรียงคะแนน
export const sortLeaderboard = (entries: LeaderboardEntry[]): LeaderboardEntry[] => {
  return entries.sort((a, b) => {
    // เรียงตามคะแนนสูงสุดก่อน
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    // ถ้าคะแนนเท่ากัน เรียงตามเวลาที่ใช้น้อยกว่า
    return a.timeUsed - b.timeUsed;
  }).map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
};
