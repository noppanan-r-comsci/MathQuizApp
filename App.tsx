/**
 * Quiz App with Navigation
 * Math Quiz Application with Complete Navigation
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import QuizScreen from './src/screens/QuizScreen';
import ResultScreen from './src/screens/ResultScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerShown: false, // ซ่อน header เพราะเรามี custom header ใน component
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'หน้าหลัก' }}
          />
          <Stack.Screen 
            name="Quiz" 
            component={QuizScreen}
            options={{ title: 'ทำข้อสอบ' }}
          />
          <Stack.Screen 
            name="Result" 
            component={ResultScreen}
            options={{ 
              title: 'ผลคะแนน',
              gestureEnabled: false, // ป้องกันการ swipe back
            }}
          />
          <Stack.Screen 
            name="Leaderboard" 
            component={LeaderboardScreen}
            options={{ title: 'อันดับคะแนน' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
