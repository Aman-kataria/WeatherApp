/* eslint-disable react-native/no-inline-styles */

import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  ScrollView,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchWeatherData} from '../services/weatherService';
import {useNavigation} from '@react-navigation/native';

const HomeScreen = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  // const [historyData, setHistoryData] = useState([]);
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();
  useEffect(() => {
    loadLastWeather();
  }, []);

  const data = [
    {
      id: 1,
      city: 'Delhi',
      temperature: '25',
      condition: 'Cloudy ',
    },
    {
      id: 2,
      city: 'Manali',
      temperature: '-5',
      condition: 'Cloudy ',
    },
    {
      id: 3,
      city: 'Patiala',
      temperature: '35',
      condition: 'Cloudy',
    },
  ];
  const loadLastWeather = async () => {
    try {
      const cachedData = await AsyncStorage.getItem('lastWeatherData');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setCity(parsedData.cityName);
        setWeather(parsedData);
      }
    } catch (err) {
      console.error('Failed to load cached weather data:', err);
    }
  };
  const saveSearchHistory = async (weatherData: any) => {
    try {
      const history = await AsyncStorage.getItem('searchHistory');
      const parsedHistory = history ? JSON.parse(history) : [];

      const newEntry = {
        city: weatherData.cityName,
        temperature: weatherData.currentConditions.temp,
        condition: weatherData.currentConditions.conditions,
        icon: weatherData.currentConditions.icon, // Weather icon
        timestamp: new Date().toISOString(), // Store time of search
      };

      const updatedHistory = [newEntry, ...parsedHistory].slice(0, 10); // Keep only last 10 searches
      await AsyncStorage.setItem(
        'searchHistory',
        JSON.stringify(updatedHistory),
      );
    } catch (err) {
      console.error('Error saving search history:', err);
    }
  };

  const getWeather = async () => {
    if (!city.trim()) {
      return;
    }

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const data = await fetchWeatherData(city);
      if (data?.address) {
        const newWeatherData = {...data, cityName: city};
        setWeather(newWeatherData);
        saveSearchHistory(newWeatherData);
        // setHistoryData(...historyData);
        await AsyncStorage.setItem(
          'lastWeatherData',
          JSON.stringify(newWeatherData),
        );
      } else {
        throw new Error('Invalid city name. No data found.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      await AsyncStorage.removeItem('lastWeatherData'); // Clear invalid cached data
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getWeather().finally(() => setRefreshing(false));
  }, [city]);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {backgroundColor: isDarkMode ? '#121212' : '#ADD8E6'},
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <StatusBar
        backgroundColor={isDarkMode ? '#121212' : '#ADD8E6'}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />

      <Text style={[styles.title, {color: isDarkMode ? '#fff' : '#000'}]}>
        Weather App
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDarkMode ? '#333' : '#fff',
            color: isDarkMode ? '#fff' : '#000',
          },
        ]}
        placeholder="Enter city name"
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        value={city}
        onChangeText={setCity}
      />

      <TouchableOpacity style={styles.button} onPress={getWeather}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Get Weather</Text>
        )}
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.button}>
        <TouchableOpacity
          onPress={() => navigation.navigate('History', {})}>
          <Text style={{color: isDarkMode ? 'black' : 'white'}}>
            Search History
          </Text>
        </TouchableOpacity>
      </View>
      {weather && (
        <View
          style={[
            styles.weatherContainer,
            {backgroundColor: isDarkMode ? '#222' : 'rgba(255, 255, 255, 0.2)'},
          ]}>
          <Text
            style={[styles.weatherText, {color: isDarkMode ? '#fff' : '#000'}]}>
            📍 {weather.cityName}
          </Text>
          <Text
            style={[styles.weatherText, {color: isDarkMode ? '#fff' : '#000'}]}>
            🌡️ Temperature: {weather.currentConditions.temp}°C
          </Text>
          <Text
            style={[styles.weatherText, {color: isDarkMode ? '#fff' : '#000'}]}>
            💧 Humidity: {weather.currentConditions.humidity}%
          </Text>
          <Text
            style={[styles.weatherText, {color: isDarkMode ? '#fff' : '#000'}]}>
            🌬️ Wind Speed: {weather.currentConditions.windspeed} km/h
          </Text>
          <Text
            style={[styles.weatherText, {color: isDarkMode ? '#fff' : '#000'}]}>
            ⛅ Condition: {weather.currentConditions.conditions}
          </Text>
        </View>
      )}
      <View
        style={[
          styles.weatherContainer,
          {backgroundColor: isDarkMode ? '#222' : 'rgba(255, 255, 255, 0.2)'},
        ]}>
        <Text
          style={[styles.weatherText, {color: isDarkMode ? '#fff' : '#000'}]}>
          Search History
        </Text>
        {data.map((item, index) => (
          <Text
            style={[styles.weatherText, {color: isDarkMode ? '#fff' : '#000'}]}>
            {item.city}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {fontSize: 28, fontWeight: 'bold', marginBottom: 20},
  input: {
    width: '80%',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    elevation: 5,
  },
  button: {
    backgroundColor: '#ff9800',
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 5,
    marginBottom: 15,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {fontSize: 18, fontWeight: 'bold', color: '#ffffff'},
  error: {color: 'red', fontSize: 16, marginTop: 10},
  weatherContainer: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 0.2,
    alignItems: 'center',
    marginTop: 20,
    width: '90%',
  },
  weatherText: {fontSize: 18, marginVertical: 5, fontWeight: '600'},
});

export default HomeScreen;
