import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import LeaderboardScreen from '../src/screens/LeaderboardScreen';
import StorageService from '../src/services/StorageService';
import { LeaderboardEntry } from '../src/types';

// Mock StorageService
jest.mock('../src/services/StorageService', () => ({
  getLeaderboard: jest.fn(),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockLeaderboardData: LeaderboardEntry[] = [
  {
    rank: 1,
    playerId: 'player1',
    playerName: 'อัจฉรา นักคิด',
    score: 98,
    percentage: 98,
    timeUsed: 105,
    completedAt: new Date('2024-01-15T14:30:00'),
  },
  {
    rank: 2,
    playerId: 'player2',
    playerName: 'สมชาย เก่งเลข',
    score: 95,
    percentage: 95,
    timeUsed: 132,
    completedAt: new Date('2024-01-15T15:15:00'),
  },
  {
    rank: 3,
    playerId: 'player3',
    playerName: 'มาลี คิดเร็ว',
    score: 92,
    percentage: 92,
    timeUsed: 150,
    completedAt: new Date('2024-01-15T16:00:00'),
  },
];

describe('LeaderboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (StorageService.getLeaderboard as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    const { getByText } = render(<LeaderboardScreen />);

    expect(getByText('กำลังโหลด...')).toBeTruthy();
  });

  it('should render leaderboard data correctly', async () => {
    (StorageService.getLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboardData);

    const { getByText } = render(<LeaderboardScreen />);

    await waitFor(() => {
      expect(getByText('อันดับคะแนน')).toBeTruthy();
      expect(getByText('อัจฉรา นักคิด')).toBeTruthy();
      expect(getByText('สมชาย เก่งเลข')).toBeTruthy();
      expect(getByText('มาลี คิดเร็ว')).toBeTruthy();
    });
  });

  it('should display correct scores and times', async () => {
    (StorageService.getLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboardData);

    const { getByText } = render(<LeaderboardScreen />);

    await waitFor(() => {
      expect(getByText('98%')).toBeTruthy();
      expect(getByText('95%')).toBeTruthy();
      expect(getByText('92%')).toBeTruthy();
      expect(getByText('ใช้เวลาไป 1:45')).toBeTruthy(); // 105 seconds
      expect(getByText('ใช้เวลาไป 2:12')).toBeTruthy(); // 132 seconds
    });
  });

  it('should display rank badges correctly', async () => {
    (StorageService.getLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboardData);

    const { getByText } = render(<LeaderboardScreen />);

    await waitFor(() => {
      // Check for rank emojis/numbers
      expect(getByText('🥇')).toBeTruthy(); // 1st place
      expect(getByText('🥈')).toBeTruthy(); // 2nd place  
      expect(getByText('🥉')).toBeTruthy(); // 3rd place
    });
  });

  it('should call refresh when refresh button is pressed', async () => {
    (StorageService.getLeaderboard as jest.Mock)
      .mockResolvedValueOnce(mockLeaderboardData)
      .mockResolvedValueOnce([...mockLeaderboardData, {
        rank: 4,
        playerId: 'player4',
        playerName: 'นักเล่นใหม่',
        score: 90,
        percentage: 90,
        timeUsed: 180,
        completedAt: new Date(),
      }]);

    const { getByText } = render(<LeaderboardScreen />);

    await waitFor(() => {
      expect(getByText('รีเฟรช')).toBeTruthy();
    });

    fireEvent.press(getByText('รีเฟรช'));

    expect(StorageService.getLeaderboard).toHaveBeenCalledTimes(2);
  });

  it('should handle empty leaderboard', async () => {
    (StorageService.getLeaderboard as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(<LeaderboardScreen />);

    await waitFor(() => {
      expect(getByText('อันดับคะแนน')).toBeTruthy();
      // Should still show header even with empty data
    });
  });
});
