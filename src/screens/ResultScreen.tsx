import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Share,
} from 'react-native';
import { Score, PlayerAnswer, Question } from '../types';

interface ResultScreenProps {
  navigation: any;
  route: {
    params: {
      score: Score;
      answers: PlayerAnswer[];
      questions: Question[];
    };
  };
}

const ResultScreen: React.FC<ResultScreenProps> = ({ navigation, route }) => {
  const { score, answers, questions } = route.params;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreEmoji = (percentage: number): string => {
    if (percentage >= 95) return '🏆';
    if (percentage >= 85) return '🥇';
    if (percentage >= 75) return '🥈';
    if (percentage >= 65) return '🥉';
    if (percentage >= 50) return '👍';
    return '💪';
  };

  const getScoreMessage = (percentage: number): string => {
    if (percentage >= 95) return 'เยี่ยมมาก! คุณเก่งมาก!';
    if (percentage >= 85) return 'ดีมาก! คุณทำได้ดีแล้ว!';
    if (percentage >= 75) return 'ดี! ผลงานที่น่าพอใจ!';
    if (percentage >= 65) return 'พอใช้ ยังต้องฝึกฝนต่อ!';
    if (percentage >= 50) return 'ผ่าน แต่ควรทบทวนเพิ่ม!';
    return 'ไม่เป็นไร ลองใหม่อีกครั้ง!';
  };

  const goHome = () => {
    navigation.navigate('Home');
  };

  const viewLeaderboard = () => {
    navigation.navigate('Leaderboard');
  };

  const playAgain = () => {
    navigation.navigate('Quiz');
  };

  const shareResult = async () => {
    try {
      const message = `🧮 Math Quiz Results 🧮
      
คะแนน: ${score.score}% (${score.correctAnswers}/${score.totalQuestions} ข้อ)
เวลาที่ใช้: ${formatTime(score.timeUsed)}
ผู้เล่น: ${score.playerName}

${getScoreMessage(score.score)}

ลองเล่นด้วยกัน! 🎯`;

      await Share.share({
        message: message,
        title: 'Math Quiz Results',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getAnswerDetails = () => {
    return answers.map((answer, index) => {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) return null;

      return {
        question,
        answer,
        questionIndex: index + 1,
      };
    }).filter(Boolean);
  };

  const answerDetails = getAnswerDetails();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>{getScoreEmoji(score.score)}</Text>
          <Text style={styles.title}>ผลคะแนนของคุณ</Text>
          <Text style={styles.message}>{getScoreMessage(score.score)}</Text>
        </View>

        {/* Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>คะแนน</Text>
            <Text style={styles.scoreValue}>{score.score}%</Text>
          </View>
          
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>ข้อถูก</Text>
            <Text style={styles.scoreValue}>
              {score.correctAnswers}/{score.totalQuestions} ข้อ
            </Text>
          </View>
          
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>เวลาที่ใช้</Text>
            <Text style={styles.scoreValue}>{formatTime(score.timeUsed)}</Text>
          </View>
          
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>ผู้เล่น</Text>
            <Text style={styles.scoreValue}>{score.playerName}</Text>
          </View>
        </View>

        {/* Answer Review */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>📝 รายละเอียดคำตอบ</Text>
          
          {answerDetails.map((detail, index) => {
            if (!detail) return null;
            
            const { question, answer, questionIndex } = detail;
            const isCorrect = answer.isCorrect;
            const selectedOption = question.options[answer.selectedAnswer];
            const correctOption = question.options[question.correctAnswer];

            return (
              <View 
                key={question.id}
                style={[
                  styles.reviewItem,
                  isCorrect ? styles.correctItem : styles.incorrectItem
                ]}
              >
                <View style={styles.reviewHeader}>
                  <Text style={styles.questionNumber}>ข้อ {questionIndex}</Text>
                  <Text style={[
                    styles.resultBadge,
                    isCorrect ? styles.correctBadge : styles.incorrectBadge
                  ]}>
                    {isCorrect ? '✅ ถูก' : '❌ ผิด'}
                  </Text>
                </View>
                
                <Text style={styles.questionText}>{question.question}</Text>
                
                <View style={styles.answerSection}>
                  <Text style={styles.answerLabel}>คำตอบที่เลือก:</Text>
                  <Text style={[
                    styles.answerText,
                    isCorrect ? styles.correctAnswer : styles.incorrectAnswer
                  ]}>
                    {selectedOption}
                  </Text>
                </View>
                
                {!isCorrect && (
                  <View style={styles.answerSection}>
                    <Text style={styles.answerLabel}>คำตอบที่ถูก:</Text>
                    <Text style={styles.correctAnswerText}>
                      {correctOption}
                    </Text>
                  </View>
                )}
                
                <Text style={styles.explanation}>{question.explanation}</Text>
              </View>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={playAgain}
          >
            <Text style={styles.primaryButtonText}>🎮 เล่นอีกครั้ง</Text>
          </TouchableOpacity>

          <View style={styles.secondaryButtonsRow}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={viewLeaderboard}
            >
              <Text style={styles.secondaryButtonText}>🏆 อันดับ</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={shareResult}
            >
              <Text style={styles.secondaryButtonText}>📤 แชร์</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.homeButton}
            onPress={goHome}
          >
            <Text style={styles.homeButtonText}>🏠 หน้าหลัก</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  scoreCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#34495e',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  reviewItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  correctItem: {
    borderLeftColor: '#27ae60',
  },
  incorrectItem: {
    borderLeftColor: '#e74c3c',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  resultBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  correctBadge: {
    backgroundColor: '#d5f4e6',
    color: '#27ae60',
  },
  incorrectBadge: {
    backgroundColor: '#fdf2f2',
    color: '#e74c3c',
  },
  questionText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 12,
    fontWeight: '500',
  },
  answerSection: {
    marginBottom: 8,
  },
  answerLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 15,
    fontWeight: '500',
  },
  correctAnswer: {
    color: '#27ae60',
  },
  incorrectAnswer: {
    color: '#e74c3c',
  },
  correctAnswerText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#27ae60',
  },
  explanation: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#27ae60',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#95a5a6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ResultScreen;
