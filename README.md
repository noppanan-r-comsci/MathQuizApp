
# MyReactNativeApp

แอปพลิเคชัน React Native สำหรับแบบทดสอบคณิตศาสตร์และระบบ Leaderboard

## คุณสมบัติ
- ทำแบบทดสอบคณิตศาสตร์
- แสดงอันดับคะแนนผู้เล่น
- บันทึกข้อมูลผู้เล่นด้วย AsyncStorage
- รองรับทั้ง Android และ iOS

## โครงสร้างโปรเจกต์
```
app.json
App.tsx
babel.config.js
index.js
jest.config.js
metro.config.js
package.json
README.md
src/
  data/
  screens/
  services/
  types/
__tests__/
android/
ios/
```

## วิธีติดตั้งและรัน
1. ติดตั้ง dependencies:
	```sh
	npm install
	```
2. รันแอปบน Android:
	```sh
	npx react-native run-android
	```
3. รันแอปบน iOS:
	```sh
	npx react-native run-ios
	```

## คำสั่งที่สำคัญ
- ติดตั้ง dependency: `npm install`
- รันแอป: `npx react-native run-android` หรือ `npx react-native run-ios`

## ข้อมูลเพิ่มเติม
- ใช้ [React Navigation](https://reactnavigation.org/)
- ใช้ [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/)

