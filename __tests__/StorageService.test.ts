import StorageService from '../src/services/StorageService';
import { Score } from '../src/types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  multiRemove: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

describe('StorageService', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('savePlayerName and getPlayerName', () => {
    it('should save and retrieve player name correctly', async () => {
      const testName = 'Test Player';
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(testName);

      await StorageService.savePlayerName(testName);
      const retrievedName = await StorageService.getPlayerName();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('player_name', testName);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('player_name');
      expect(retrievedName).toBe(testName);
    });

    it('should return null when no player name exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const retrievedName = await StorageService.getPlayerName();

      expect(retrievedName).toBe(null);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

      await expect(StorageService.savePlayerName('test')).rejects.toThrow('Storage error');
    });
  });

  describe('saveScore and getAllScores', () => {
    const mockScore: Score = {
      id: 'test-score-1',
      playerId: 'player-1',
      playerName: 'Test Player',
      score: 85,
      totalQuestions: 20,
      correctAnswers: 17,
      timeUsed: 180,
      completedAt: new Date('2024-01-01T10:00:00Z'),
      answers: [],
    };

    it('should save new score correctly', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('[]'); // No existing scores
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await StorageService.saveScore(mockScore);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'quiz_scores',
        JSON.stringify([mockScore])
      );
    });

    it('should append to existing scores', async () => {
      const existingScore: Score = { ...mockScore, id: 'existing-score' };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([existingScore]));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await StorageService.saveScore(mockScore);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'quiz_scores',
        JSON.stringify([existingScore, mockScore])
      );
    });

    it('should retrieve all scores correctly', async () => {
      const scores = [mockScore];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(scores));

      const retrievedScores = await StorageService.getAllScores();

      expect(retrievedScores).toHaveLength(1);
      expect(retrievedScores[0].playerName).toBe('Test Player');
      expect(retrievedScores[0].completedAt).toBeInstanceOf(Date);
    });

    it('should return empty array when no scores exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const retrievedScores = await StorageService.getAllScores();

      expect(retrievedScores).toEqual([]);
    });
  });

  describe('getBestScore', () => {
    it('should return the highest scoring entry', async () => {
      const scores: Score[] = [
        { ...createMockScore(), score: 85, timeUsed: 200 },
        { ...createMockScore(), score: 95, timeUsed: 150 },
        { ...createMockScore(), score: 80, timeUsed: 100 },
      ];
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(scores));

      const bestScore = await StorageService.getBestScore();

      expect(bestScore?.score).toBe(95);
    });

    it('should use time as tiebreaker for equal scores', async () => {
      const scores: Score[] = [
        { ...createMockScore(), id: 'slow', score: 90, timeUsed: 200 },
        { ...createMockScore(), id: 'fast', score: 90, timeUsed: 150 },
      ];
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(scores));

      const bestScore = await StorageService.getBestScore();

      expect(bestScore?.id).toBe('fast');
      expect(bestScore?.timeUsed).toBe(150);
    });

    it('should return null when no scores exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const bestScore = await StorageService.getBestScore();

      expect(bestScore).toBe(null);
    });
  });

  describe('hasPlayerData', () => {
    it('should return true when player name exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('Test Player');

      const hasData = await StorageService.hasPlayerData();

      expect(hasData).toBe(true);
    });

    it('should return false when no player name exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const hasData = await StorageService.hasPlayerData();

      expect(hasData).toBe(false);
    });
  });

  describe('getPlayerStats', () => {
    it('should calculate correct statistics', async () => {
      const scores: Score[] = [
        { ...createMockScore(), score: 80, timeUsed: 120 },
        { ...createMockScore(), score: 90, timeUsed: 180 },
        { ...createMockScore(), score: 70, timeUsed: 240 },
      ];
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(scores));

      const stats = await StorageService.getPlayerStats();

      expect(stats.totalGames).toBe(3);
      expect(stats.bestScore).toBe(90);
      expect(stats.averageScore).toBe(80); // (80 + 90 + 70) / 3
      expect(stats.averageTime).toBe(180); // (120 + 180 + 240) / 3
    });

    it('should return zero stats when no games played', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const stats = await StorageService.getPlayerStats();

      expect(stats.totalGames).toBe(0);
      expect(stats.bestScore).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.averageTime).toBe(0);
    });
  });

  describe('clearAllData', () => {
    it('should remove all storage keys', async () => {
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      await StorageService.clearAllData();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'quiz_scores',
        'player_name',
        'best_score',
      ]);
    });
  });
});

// Helper function to create mock score
function createMockScore(): Score {
  return {
    id: 'test-score',
    playerId: 'test-player',
    playerName: 'Test Player',
    score: 85,
    totalQuestions: 20,
    correctAnswers: 17,
    timeUsed: 180,
    completedAt: new Date('2024-01-01T10:00:00Z'),
    answers: [],
  };
}
