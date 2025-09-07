// ข้อมูลคำถาม
export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// ข้อมูลแบบทดสอบ
export interface Quiz {
  title: string;
  description: string;
  totalQuestions: number;
  timeLimit: number;
  questions: Question[];
}

// ข้อมูลผู้เล่น
export interface Player {
  id: string;
  name: string;
  avatar?: string;
}

// ข้อมูลคะแนน
export interface Score {
  id: string;
  playerId: string;
  playerName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeUsed: number; // in seconds
  completedAt: Date;
  answers: PlayerAnswer[];
}

// คำตอบของผู้เล่น
export interface PlayerAnswer {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

// ข้อมูล Leaderboard
export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  score: number;
  percentage: number;
  timeUsed: number;
  completedAt: Date;
}

// สถานะของเกม
export interface GameState {
  currentQuestionIndex: number;
  answers: PlayerAnswer[];
  startTime: Date;
  isCompleted: boolean;
  score: number;
}

// การตั้งค่าเกม
export interface GameSettings {
  showTimer: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showExplanation: boolean;
}
