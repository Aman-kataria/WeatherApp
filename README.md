# GitHub README

# WeatherApp

## Description
WeatherApp is a React Native application that provides real-time weather updates for any location. The app integrates with the VisualCrossing Weather API to fetch weather details and follows the MVVM architecture for better maintainability.

## Features
- Real-time weather updates
- Search by city name
- Save favorite locations using AsyncStorage
- Clean and responsive UI

## Tech Stack
- **Frontend:** React Native (TypeScript)
- **State Management:** React Hooks
- **API:** VisualCrossing Weather API
- **Navigation:** React Native Navigation
- **Storage:** AsyncStorage

## Installation & Setup
### Prerequisites
- Node.js (>=18)
- Yarn or npm
- React Native CLI
- Android Studio (for Android) or Xcode (for iOS)

### Steps to Run Locally
1. Clone the repository:
   ```sh
   git clone https://github.com/Aman-kataria/WeatherApp.git
   cd WeatherApp
   ```
2. Install dependencies:
   ```sh
   yarn install
   ```
3. Set up the environment variables in a `.env` file:
   ```sh
   WEATHER_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```sh
   yarn start
   ```
5. Run the app on an emulator or real device:
   ```sh
   yarn android  # For Android
   yarn ios      # For iOS (macOS only)
   ```

## Testing
Run the following command to test the app:
```sh
yarn test
```

## Deployment
The app is also available via Expo Go. Follow the [Expo README](#expo-go-readme) for easy testing.





