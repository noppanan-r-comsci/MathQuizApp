import { formatTime, sortLeaderboard } from '../src/data/mockLeaderboard';
import { LeaderboardEntry } from '../src/types';

describe('Utility Functions', () => {
  describe('formatTime', () => {
    it('should format seconds to MM:SS format correctly', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(30)).toBe('0:30');
      expect(formatTime(60)).toBe('1:00');
      expect(formatTime(90)).toBe('1:30');
      expect(formatTime(3661)).toBe('61:01');
    });

    it('should pad single digits with zero', () => {
      expect(formatTime(5)).toBe('0:05');
      expect(formatTime(65)).toBe('1:05');
    });

    it('should handle large numbers', () => {
      expect(formatTime(3600)).toBe('60:00');
      expect(formatTime(7200)).toBe('120:00');
    });
  });

  describe('sortLeaderboard', () => {
    const mockEntries: LeaderboardEntry[] = [
      {
        rank: 0,
        playerId: 'player1',
        playerName: 'Player 1',
        score: 85,
        percentage: 85,
        timeUsed: 200,
        completedAt: new Date('2024-01-01'),
      },
      {
        rank: 0,
        playerId: 'player2',
        playerName: 'Player 2',
        score: 95,
        percentage: 95,
        timeUsed: 150,
        completedAt: new Date('2024-01-02'),
      },
      {
        rank: 0,
        playerId: 'player3',
        playerName: 'Player 3',
        score: 85,
        percentage: 85,
        timeUsed: 180, // Better time than player1
        completedAt: new Date('2024-01-03'),
      },
    ];

    it('should sort by score descending', () => {
      const sorted = sortLeaderboard(mockEntries);
      
      expect(sorted[0].score).toBe(95);
      expect(sorted[0].playerName).toBe('Player 2');
      expect(sorted[0].rank).toBe(1);
    });

    it('should use time as tiebreaker when scores are equal', () => {
      const sorted = sortLeaderboard(mockEntries);
      
      // Both Player 1 and Player 3 have score 85, but Player 3 has better time (180 < 200)
      expect(sorted[1].playerName).toBe('Player 3');
      expect(sorted[1].rank).toBe(2);
      expect(sorted[2].playerName).toBe('Player 1');
      expect(sorted[2].rank).toBe(3);
    });

    it('should assign correct ranks', () => {
      const sorted = sortLeaderboard(mockEntries);
      
      expect(sorted[0].rank).toBe(1);
      expect(sorted[1].rank).toBe(2);
      expect(sorted[2].rank).toBe(3);
    });

    it('should handle empty array', () => {
      const sorted = sortLeaderboard([]);
      expect(sorted).toEqual([]);
    });

    it('should handle single entry', () => {
      const single = [mockEntries[0]];
      const sorted = sortLeaderboard(single);
      
      expect(sorted).toHaveLength(1);
      expect(sorted[0].rank).toBe(1);
    });
  });
});
