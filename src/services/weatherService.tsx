import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = 'T5HEBDCEBXX4ATF6KWFPV8R83';
const BASE_URL =
  'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

export const fetchWeatherData = async (city: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}/${city}?unitGroup=metric&key=${API_KEY}&contentType=json`,
    );
    if (!response.ok) {
      throw new Error('Invalid city name. No data found.');
    }

    const data = await response.json();

    // Store latest valid weather data
    await AsyncStorage.setItem(
      'lastWeatherData',
      JSON.stringify({...data, cityName: city}),
    );

    return data;
  } catch (error) {
    console.error('Error fetching weather:', error);

    // If API fails, do NOT return cached data
    throw error;
  }
};
