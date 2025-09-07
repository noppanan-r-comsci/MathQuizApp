import AsyncStorage from '@react-native-async-storage/async-storage';
import { Score, LeaderboardEntry } from '../types';
import { mockLeaderboardData, sortLeaderboard } from '../data/mockLeaderboard';

class StorageService {
  private static readonly KEYS = {
    SCORES: 'quiz_scores',
    PLAYER_NAME: 'player_name',
    BEST_SCORE: 'best_score',
  };

  // บันทึกชื่อผู้เล่น
  static async savePlayerName(name: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.PLAYER_NAME, name);
    } catch (error) {
      console.error('Error saving player name:', error);
      throw error;
    }
  }

  // อ่านชื่อผู้เล่น
  static async getPlayerName(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.KEYS.PLAYER_NAME);
    } catch (error) {
      console.error('Error getting player name:', error);
      return null;
    }
  }

  // บันทึกคะแนน
  static async saveScore(score: Score): Promise<void> {
    try {
      const existingScores = await this.getAllScores();
      const updatedScores = [...existingScores, score];
      
      await AsyncStorage.setItem(
        this.KEYS.SCORES,
        JSON.stringify(updatedScores)
      );

      // อัปเดตคะแนนสูงสุด
      await this.updateBestScore(score);
    } catch (error) {
      console.error('Error saving score:', error);
      throw error;
    }
  }

  // อ่านคะแนนทั้งหมด
  static async getAllScores(): Promise<Score[]> {
    try {
      const scoresJson = await AsyncStorage.getItem(this.KEYS.SCORES);
      if (scoresJson) {
        const scores: Score[] = JSON.parse(scoresJson);
        // แปลง Date strings กลับเป็น Date objects
        return scores.map(score => ({
          ...score,
          completedAt: new Date(score.completedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting scores:', error);
      return [];
    }
  }

  // อ่านคะแนนสูงสุดของผู้เล่น
  static async getBestScore(): Promise<Score | null> {
    try {
      const scores = await this.getAllScores();
      if (scores.length === 0) return null;

      return scores.reduce((best, current) => {
        if (current.score > best.score) return current;
        if (current.score === best.score && current.timeUsed < best.timeUsed) {
          return current;
        }
        return best;
      });
    } catch (error) {
      console.error('Error getting best score:', error);
      return null;
    }
  }

  // อัปเดตคะแนนสูงสุด
  private static async updateBestScore(newScore: Score): Promise<void> {
    try {
      const currentBest = await this.getBestScore();
      
      if (!currentBest || 
          newScore.score > currentBest.score || 
          (newScore.score === currentBest.score && newScore.timeUsed < currentBest.timeUsed)) {
        await AsyncStorage.setItem(
          this.KEYS.BEST_SCORE,
          JSON.stringify(newScore)
        );
      }
    } catch (error) {
      console.error('Error updating best score:', error);
    }
  }

  // สร้าง Leaderboard รวมข้อมูล Mock + ข้อมูลจริง
  static async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const userScores = await this.getAllScores();
      const mockData = [...mockLeaderboardData];
      
      // แปลงคะแนนผู้เล่นเป็น LeaderboardEntry
      const userEntries: LeaderboardEntry[] = userScores.map(score => ({
        rank: 0, // จะคำนวณใหม่ตอนจัดเรียง
        playerId: score.playerId,
        playerName: score.playerName,
        score: score.score,
        percentage: Math.round((score.correctAnswers / score.totalQuestions) * 100),
        timeUsed: score.timeUsed,
        completedAt: score.completedAt,
      }));

      // รวมข้อมูล Mock กับข้อมูลจริง
      const allEntries = [...mockData, ...userEntries];
      
      // จัดเรียงและกำหนด rank ใหม่
      return sortLeaderboard(allEntries).slice(0, 20); // แสดงแค่ 20 อันดับแรก
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return mockLeaderboardData;
    }
  }

  // ลบข้อมูลทั้งหมด (สำหรับ reset)
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.KEYS.SCORES,
        this.KEYS.PLAYER_NAME,
        this.KEYS.BEST_SCORE,
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  // ตรวจสอบว่ามีข้อมูลผู้เล่นหรือไม่
  static async hasPlayerData(): Promise<boolean> {
    try {
      const playerName = await this.getPlayerName();
      return playerName !== null;
    } catch (error) {
      return false;
    }
  }

  // สถิติของผู้เล่น
  static async getPlayerStats(): Promise<{
    totalGames: number;
    bestScore: number;
    averageScore: number;
    averageTime: number;
  }> {
    try {
      const scores = await this.getAllScores();
      
      if (scores.length === 0) {
        return {
          totalGames: 0,
          bestScore: 0,
          averageScore: 0,
          averageTime: 0,
        };
      }

      const bestScore = Math.max(...scores.map(s => s.score));
      const averageScore = Math.round(
        scores.reduce((sum, s) => sum + s.score, 0) / scores.length
      );
      const averageTime = Math.round(
        scores.reduce((sum, s) => sum + s.timeUsed, 0) / scores.length
      );

      return {
        totalGames: scores.length,
        bestScore,
        averageScore,
        averageTime,
      };
    } catch (error) {
      console.error('Error getting player stats:', error);
      return {
        totalGames: 0,
        bestScore: 0,
        averageScore: 0,
        averageTime: 0,
      };
    }
  }
}

export default StorageService;
