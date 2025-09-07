import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { LeaderboardEntry } from '../types';
import StorageService from '../services/StorageService';
import { formatTime } from '../data/mockLeaderboard';

const LeaderboardScreen: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await StorageService.getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      Alert.alert('Error', 'ไม่สามารถโหลดข้อมูลอันดับได้');
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const getRankEmoji = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}`;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return styles.goldRank;
      case 2: return styles.silverRank;
      case 3: return styles.bronzeRank;
      default: return styles.regularRank;
    }
  };

  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => (
    <View style={[styles.itemContainer, getRankStyle(item.rank)]}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>
          {typeof getRankEmoji(item.rank) === 'string' && getRankEmoji(item.rank).includes('🏅') 
            ? getRankEmoji(item.rank) 
            : getRankEmoji(item.rank)
          }
        </Text>
      </View>

      <View style={styles.playerContainer}>
        <Text style={styles.playerName} numberOfLines={1}>
          {item.playerName}
        </Text>
        <Text style={styles.completedTime}>
          {new Date(item.completedAt).toLocaleDateString('th-TH')}
        </Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{item.score}%</Text>
        <Text style={styles.timeText}>ใช้เวลาไป {formatTime(item.timeUsed)}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>กำลังโหลด...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>อันดับคะแนน</Text>
        <Text style={styles.subtitle}>แบบทดสอบคณิตศาสตร์</Text>
      </View>

      <FlatList
        data={leaderboard}
        keyExtractor={(item) => `${item.playerId}-${item.completedAt}`}
        renderItem={renderLeaderboardItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={loadLeaderboard}
      >
        <Text style={styles.refreshButtonText}>รีเฟรช</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
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
  goldRank: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  silverRank: {
    borderLeftWidth: 4,
    borderLeftColor: '#C0C0C0',
  },
  bronzeRank: {
    borderLeftWidth: 4,
    borderLeftColor: '#CD7F32',
  },
  regularRank: {
    borderLeftWidth: 4,
    borderLeftColor: '#E0E0E0',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  playerContainer: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  completedTime: {
    fontSize: 12,
    color: '#666',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LeaderboardScreen;
