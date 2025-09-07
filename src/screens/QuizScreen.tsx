import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { Question, PlayerAnswer, Score } from '../types';
import StorageService from '../services/StorageService';
import mathQuestions from '../../data/mathQuestions.json';

interface QuizScreenProps {
  navigation: any;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ navigation }) => {
  const [questions] = useState<Question[]>(mathQuestions.quiz.questions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<PlayerAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 นาที
  const [startTime] = useState(new Date());
  const [fadeAnim] = useState(new Animated.Value(1));

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;

  // Timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // หมดเวลา
      handleTimeUp();
    }
  }, [timeLeft]);

  const handleTimeUp = () => {
    Alert.alert(
      'หมดเวลา! ⏰',
      'เวลาในการทำข้อสอบหมดแล้ว',
      [
        {
          text: 'ดูผลคะแนน',
          onPress: () => finishQuiz(),
        },
      ],
      { cancelable: false }
    );
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      Alert.alert('กรุณาเลือกคำตอบ', 'กรุณาเลือกคำตอบก่อนไปข้อต่อไป');
      return;
    }

    const questionStartTime = new Date();
    const timeSpent = Math.floor(
      (questionStartTime.getTime() - startTime.getTime()) / 1000
    );

    const playerAnswer: PlayerAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: selectedAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
      timeSpent: timeSpent,
    };

    const newAnswers = [...answers, playerAnswer];
    setAnswers(newAnswers);

    // Animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      // จบข้อสอบ
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: PlayerAnswer[] = answers) => {
    try {
      const endTime = new Date();
      const totalTimeUsed = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000
      );

      const correctAnswers = finalAnswers.filter(a => a.isCorrect).length;
      const scorePercentage = Math.round((correctAnswers / questions.length) * 100);

      const playerName = await StorageService.getPlayerName();
      const score: Score = {
        id: `quiz_${Date.now()}`,
        playerId: `player_${Date.now()}`,
        playerName: playerName || 'ผู้เล่นไม่ระบุชื่อ',
        score: scorePercentage,
        totalQuestions: questions.length,
        correctAnswers: correctAnswers,
        timeUsed: totalTimeUsed,
        completedAt: endTime,
        answers: finalAnswers,
      };

      await StorageService.saveScore(score);

      navigation.navigate('Result', { score, answers: finalAnswers, questions });
    } catch (error) {
      console.error('Error saving score:', error);
      Alert.alert('Error', 'เกิดข้อผิดพลาดในการบันทึกคะแนน');
    }
  };

  const handleQuit = () => {
    Alert.alert(
      'ออกจากข้อสอบ?',
      'คุณแน่ใจว่าต้องการออกจากข้อสอบ? ความคืบหน้าจะหายไป',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ออก', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  const getOptionStyle = (optionIndex: number) => {
    if (selectedAnswer === optionIndex) {
      return [styles.optionButton, styles.selectedOption];
    }
    return styles.optionButton;
  };

  const getOptionTextStyle = (optionIndex: number) => {
    if (selectedAnswer === optionIndex) {
      return [styles.optionText, styles.selectedOptionText];
    }
    return styles.optionText;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleQuit} style={styles.quitButton}>
            <Text style={styles.quitButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerCenter}>
          <Text style={styles.questionCounter}>
            ข้อ {currentQuestionIndex + 1}/{questions.length}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <Text style={styles.timer}>⏱️ {formatTime(timeLeft)}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={getOptionStyle(index)}
                onPress={() => handleAnswerSelect(index)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>
                    {String.fromCharCode(65 + index)}.
                  </Text>
                  <Text style={getOptionTextStyle(index)}>{option}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.nextButton,
            selectedAnswer !== null ? styles.nextButtonEnabled : styles.nextButtonDisabled
          ]}
          onPress={handleNextQuestion}
          disabled={selectedAnswer === null}
        >
          <Text style={[
            styles.nextButtonText,
            selectedAnswer !== null ? styles.nextButtonTextEnabled : styles.nextButtonTextDisabled
          ]}>
            {currentQuestionIndex === questions.length - 1 ? 'ส่งข้อสอบ' : 'ข้อต่อไป'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flex: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  quitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff4757',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  questionCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2ed573',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 30,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8e9',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
    marginRight: 12,
    minWidth: 25,
  },
  optionText: {
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  selectedOptionText: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  nextButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonEnabled: {
    backgroundColor: '#4CAF50',
  },
  nextButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  nextButtonTextEnabled: {
    color: 'white',
  },
  nextButtonTextDisabled: {
    color: '#666666',
  },
});

export default QuizScreen;
