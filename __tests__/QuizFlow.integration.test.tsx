import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../src/screens/HomeScreen';
import QuizScreen from '../src/screens/QuizScreen';
import ResultScreen from '../src/screens/ResultScreen';
import StorageService from '../src/services/StorageService';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('../src/services/StorageService');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock mathQuestions data
jest.mock('../data/mathQuestions.json', () => ({
  quiz: {
    title: 'Test Quiz',
    description: 'Test Description',
    totalQuestions: 3, // Shorter for testing
    timeLimit: 30,
    questions: [
      {
        id: 1,
        question: '2 + 2 = ?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1,
        explanation: '2 + 2 = 4',
      },
      {
        id: 2,
        question: '5 × 3 = ?',
        options: ['14', '15', '16', '17'],
        correctAnswer: 1,
        explanation: '5 × 3 = 15',
      },
      {
        id: 3,
        question: '10 ÷ 2 = ?',
        options: ['4', '5', '6', '7'],
        correctAnswer: 1,
        explanation: '10 ÷ 2 = 5',
      },
    ],
  },
}));

const Stack = createNativeStackNavigator();

const TestApp = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Quiz Flow Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Setup default mocks
    (StorageService.hasPlayerData as jest.Mock).mockResolvedValue(true);
    (StorageService.getPlayerName as jest.Mock).mockResolvedValue('Test Player');
    (StorageService.getPlayerStats as jest.Mock).mockResolvedValue({
      totalGames: 0,
      bestScore: 0,
      averageScore: 0,
      averageTime: 0,
    });
    (StorageService.saveScore as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should complete full quiz flow from home to result', async () => {
    const { getByText, queryByText } = render(<TestApp />);

    // 1. Start at Home Screen
    await waitFor(() => {
      expect(getByText('Math Quiz')).toBeTruthy();
      expect(getByText('สวัสดี Test Player!')).toBeTruthy();
    });

    // 2. Start Quiz
    fireEvent.press(getByText('เริ่มเกม'));

    // 3. Should be in Quiz Screen - First Question
    await waitFor(() => {
      expect(getByText('2 + 2 = ?')).toBeTruthy();
      expect(getByText('ข้อ 1/3')).toBeTruthy();
    });

    // 4. Answer first question correctly
    fireEvent.press(getByText('4')); // Correct answer
    fireEvent.press(getByText('ข้อต่อไป'));

    // 5. Second Question
    await waitFor(() => {
      expect(getByText('5 × 3 = ?')).toBeTruthy();
      expect(getByText('ข้อ 2/3')).toBeTruthy();
    });

    // 6. Answer second question correctly
    fireEvent.press(getByText('15')); // Correct answer
    fireEvent.press(getByText('ข้อต่อไป'));

    // 7. Third Question
    await waitFor(() => {
      expect(getByText('10 ÷ 2 = ?')).toBeTruthy();
      expect(getByText('ข้อ 3/3')).toBeTruthy();
    });

    // 8. Answer third question correctly and finish
    fireEvent.press(getByText('5')); // Correct answer
    fireEvent.press(getByText('ส่งข้อสอบ'));

    // 9. Should be in Result Screen
    await waitFor(() => {
      expect(getByText('ผลคะแนนของคุณ')).toBeTruthy();
      expect(getByText('100%')).toBeTruthy(); // All answers correct
      expect(getByText('3/3 ข้อ')).toBeTruthy();
    });

    // 10. Verify StorageService was called to save score
    expect(StorageService.saveScore).toHaveBeenCalledWith(
      expect.objectContaining({
        playerName: 'Test Player',
        score: 100,
        correctAnswers: 3,
        totalQuestions: 3,
      })
    );
  });

  it('should handle wrong answers correctly', async () => {
    const { getByText } = render(<TestApp />);

    // Navigate to quiz
    await waitFor(() => {
      expect(getByText('เริ่มเกม')).toBeTruthy();
    });
    fireEvent.press(getByText('เริ่มเกม'));

    // Answer first question incorrectly
    await waitFor(() => {
      expect(getByText('2 + 2 = ?')).toBeTruthy();
    });
    fireEvent.press(getByText('3')); // Wrong answer
    fireEvent.press(getByText('ข้อต่อไป'));

    // Answer second question correctly
    await waitFor(() => {
      expect(getByText('5 × 3 = ?')).toBeTruthy();
    });
    fireEvent.press(getByText('15')); // Correct answer
    fireEvent.press(getByText('ข้อต่อไป'));

    // Answer third question incorrectly
    await waitFor(() => {
      expect(getByText('10 ÷ 2 = ?')).toBeTruthy();
    });
    fireEvent.press(getByText('4')); // Wrong answer
    fireEvent.press(getByText('ส่งข้อสอบ'));

    // Check result shows 1 correct out of 3
    await waitFor(() => {
      expect(getByText('33%')).toBeTruthy(); // 1/3 = 33%
      expect(getByText('1/3 ข้อ')).toBeTruthy();
    });
  });

  it('should prevent starting quiz without selecting answer', async () => {
    const { getByText } = render(<TestApp />);

    // Navigate to quiz
    await waitFor(() => {
      expect(getByText('เริ่มเกม')).toBeTruthy();
    });
    fireEvent.press(getByText('เริ่มเกม'));

    // Try to proceed without selecting answer
    await waitFor(() => {
      expect(getByText('2 + 2 = ?')).toBeTruthy();
    });
    
    fireEvent.press(getByText('ข้อต่อไป'));

    // Should show alert
    expect(Alert.alert).toHaveBeenCalledWith(
      'กรุณาเลือกคำตอบ',
      'กรุณาเลือกคำตอบก่อนไปข้อต่อไป'
    );
  });

  it('should handle quiz timeout', async () => {
    const { getByText } = render(<TestApp />);

    // Navigate to quiz
    await waitFor(() => {
      expect(getByText('เริ่มเกม')).toBeTruthy();
    });
    fireEvent.press(getByText('เริ่มเกม'));

    await waitFor(() => {
      expect(getByText('2 + 2 = ?')).toBeTruthy();
    });

    // Fast forward time to trigger timeout (30 minutes = 1800 seconds)
    jest.advanceTimersByTime(1800 * 1000);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'หมดเวลา! ⏰',
        'เวลาในการทำข้อสอบหมดแล้ว',
        expect.any(Array),
        { cancelable: false }
      );
    });
  });

  it('should show progress correctly throughout quiz', async () => {
    const { getByText } = render(<TestApp />);

    // Navigate to quiz
    fireEvent.press(getByText('เริ่มเกม'));

    // First question - 0% progress initially, then 33% after answering
    await waitFor(() => {
      expect(getByText('ข้อ 1/3')).toBeTruthy();
      expect(getByText('0%')).toBeTruthy(); // Initial progress
    });

    fireEvent.press(getByText('4'));
    fireEvent.press(getByText('ข้อต่อไป'));

    // Second question - 33% progress
    await waitFor(() => {
      expect(getByText('ข้อ 2/3')).toBeTruthy();
      expect(getByText('33%')).toBeTruthy();
    });

    fireEvent.press(getByText('15'));
    fireEvent.press(getByText('ข้อต่อไป'));

    // Third question - 67% progress
    await waitFor(() => {
      expect(getByText('ข้อ 3/3')).toBeTruthy();
      expect(getByText('67%')).toBeTruthy();
    });
  });
});
