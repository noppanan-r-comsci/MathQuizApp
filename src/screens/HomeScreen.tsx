import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import StorageService from '../services/StorageService';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [playerName, setPlayerName] = useState('');
  const [hasPlayerData, setHasPlayerData] = useState(false);
  const [playerStats, setPlayerStats] = useState({
    totalGames: 0,
    bestScore: 0,
    averageScore: 0,
    averageTime: 0,
  });

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = async () => {
    try {
      const name = await StorageService.getPlayerName();
      const hasData = await StorageService.hasPlayerData();
      const stats = await StorageService.getPlayerStats();
      
      if (name) {
        setPlayerName(name);
      }
      setHasPlayerData(hasData);
      setPlayerStats(stats);
    } catch (error) {
      console.error('Error loading player data:', error);
    }
  };

  const savePlayerName = async () => {
    if (playerName.trim().length < 2) {
      Alert.alert('กรุณาใส่ชื่อ', 'กรุณาใส่ชื่อผู้เล่นอย่างน้อย 2 ตัวอักษร');
      return;
    }
    
    try {
      await StorageService.savePlayerName(playerName.trim());
      setHasPlayerData(true);
      Alert.alert('บันทึกเสร็จแล้ว!', `ยินดีต้อนรับ ${playerName.trim()}!`);
    } catch (error) {
      Alert.alert('Error', 'ไม่สามารถบันทึกชื่อได้');
    }
  };

  const startQuiz = () => {
    navigation.navigate('Quiz');
  };

  const viewLeaderboard = () => {
    navigation.navigate('Leaderboard');
  };

  const resetData = () => {
    Alert.alert(
      'รีเซ็ตข้อมูล',
      'คุณแน่ใจว่าต้องการลบข้อมูลทั้งหมด?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'รีเซ็ต',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              setPlayerName('');
              setHasPlayerData(false);
              setPlayerStats({
                totalGames: 0,
                bestScore: 0,
                averageScore: 0,
                averageTime: 0,
              });
              Alert.alert('สำเร็จ!', 'ข้อมูลถูกรีเซ็ตแล้ว');
            } catch (error) {
              Alert.alert('Error', 'ไม่สามารถรีเซ็ตข้อมูลได้');
            }
          }
        }
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Math Quiz</Text>
          <Text style={styles.subtitle}>ทดสอบความรู้คณิตศาสตร์</Text>
        </View>

        {/* Player Input/Info */}
        <View style={styles.playerSection}>
          {!hasPlayerData ? (
            <View style={styles.nameInputContainer}>
              <Text style={styles.inputLabel}>ใส่ชื่อของคุณ</Text>
              <TextInput
                style={styles.nameInput}
                value={playerName}
                onChangeText={setPlayerName}
                placeholder="ชื่อผู้เล่น..."
                placeholderTextColor="#999"
                maxLength={20}
              />
              <TouchableOpacity 
                style={styles.saveNameButton}
                onPress={savePlayerName}
              >
                <Text style={styles.saveNameButtonText}>บันทึกชื่อ</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>สวัสดี {playerName}!</Text>
              
              {playerStats.totalGames > 0 && (
                <View style={styles.statsContainer}>
                  <Text style={styles.statsTitle}>สถิติของคุณ</Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{playerStats.totalGames}</Text>
                      <Text style={styles.statLabel}>เกมที่เล่น</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{playerStats.bestScore}%</Text>
                      <Text style={styles.statLabel}>คะแนนสูงสุด</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{playerStats.averageScore}%</Text>
                      <Text style={styles.statLabel}>คะแนนเฉลี่ย</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{formatTime(playerStats.averageTime)}</Text>
                      <Text style={styles.statLabel}>เวลาเฉลี่ย</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Game Info */}
        <View style={styles.gameInfoContainer}>
          <Text style={styles.gameInfoTitle}>รายละเอียดข้อสอบ</Text>
          <View style={styles.gameInfoItems}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📝</Text>
              <Text style={styles.infoText}>20 ข้อ คณิตศาสตร์พื้นฐาน</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>⏰</Text>
              <Text style={styles.infoText}>เวลา 30 นาที</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🎲</Text>
              <Text style={styles.infoText}>4 ตัวเลือก เลือก 1 คำตอบ</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🏆</Text>
              <Text style={styles.infoText}>แข่งขันกับผู้เล่นคนอื่น</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.primaryButton,
              !hasPlayerData && styles.disabledButton
            ]}
            onPress={startQuiz}
            disabled={!hasPlayerData}
          >
            <Text style={[
              styles.primaryButtonText,
              !hasPlayerData && styles.disabledButtonText
            ]}>
            เริ่มเกม
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={viewLeaderboard}
          >
            <Text style={styles.secondaryButtonText}>อันดับคะแนน</Text>
          </TouchableOpacity>

          {hasPlayerData && (
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetData}
            >
              <Text style={styles.resetButtonText}>รีเซ็ตข้อมูล</Text>
            </TouchableOpacity>
          )}
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  playerSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  nameInputContainer: {
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 12,
  },
  nameInput: {
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    width: '100%',
    textAlign: 'center',
    marginBottom: 16,
  },
  saveNameButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveNameButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  statsContainer: {
    width: '100%',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    textAlign: 'center',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  gameInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  gameInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  gameInfoItems: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
  },
  infoText: {
    fontSize: 16,
    color: '#34495e',
    flex: 1,
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
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#7f8c8d',
  },
  secondaryButton: {
    backgroundColor: '#3498db',
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
  secondaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HomeScreen;
