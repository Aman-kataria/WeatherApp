import React, { useEffect, useState } from 'react';
import { 
  View, Text, TouchableOpacity, FlatList, StyleSheet, Image 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { format } from 'date-fns';

const SearchHistoryScreen = () => {
  const [history, setHistory] = useState<any[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem('searchHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (err) {
      console.error('Error loading search history:', err);
    }
  };

  const handleSelectCity = (city: string) => {
    navigation.navigate('Home', { city });
  };

  return (
    <LinearGradient colors={['#4A90E2', '#145DA0']} style={styles.container}>
      <Text style={styles.title}>Recent Searches</Text>
      <FlatList
        data={history}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleSelectCity(item.city)}>
            <View style={styles.row}>
              <Image source={{ uri: `https://www.weatherapi.com/icons/${item.icon}.png` }} style={styles.icon} />
              <View>
                <Text style={styles.cityName}>{item.city}</Text>
                <Text style={styles.details}>
                  {item.temperature}°C | {item.condition}
                </Text>
                <Text style={styles.timestamp}>{format(new Date(item.timestamp), 'MMM d, h:mm a')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 15 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 50, height: 50, marginRight: 15 },
  cityName: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  details: { fontSize: 14, color: 'white', opacity: 0.9 },
  timestamp: { fontSize: 12, color: '#E0E0E0', marginTop: 5 },
});

export default SearchHistoryScreen;
