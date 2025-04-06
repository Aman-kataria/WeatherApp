import React, {useState} from 'react';
import {
  View,
  Image,
  ScrollView,
  Alert,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {Button, Text, useTheme} from 'react-native-paper';
import {FFmpegKit} from 'ffmpeg-kit-react-native';
import RNFS from 'react-native-fs';
import Video from 'react-native-video';
import {ActivityIndicator} from 'react-native-paper'; // For loading spinner

const CameraFeature = () => {
  const [images, setImages] = useState([]);
  const theme = useTheme();
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    try {
      const selected: any = await ImagePicker.openPicker({
        multiple: true,
        maxFiles: 5,
        minFiles: 3,
        mediaType: 'photo',
      });
      setImages(selected);
    } catch (error) {
      console.log('Image pick error:', error);
    }
  };

  const copyMusicToCache = async (): Promise<string> => {
    const destPath = `${RNFS.CachesDirectoryPath}/acousticbreeze.mp3`;

    if (Platform.OS === 'android') {
      const sourcePath = 'acousticbreeze.mp3';
      const assetPath = `assets/${sourcePath}`;

      try {
        await RNFS.copyFileAssets(sourcePath, destPath);
        return destPath;
      } catch (err) {
        console.log('Error copying audio:', err);
        throw err;
      }
    } else {
      // For iOS if needed
    }

    return '';
  };
  const generateVideo = async () => {
    if (images.length < 3 || images.length > 5) {
      Alert.alert('Select 3 to 5 photos');
      return;
    }

    setLoading(true); // Show loader

    try {
      const musicPath = await copyMusicToCache();
      const outputPath = `${RNFS.CachesDirectoryPath}/output.mp4`;

      // Delete existing file to prevent overwrite error
      const fileExists = await RNFS.exists(outputPath);
      if (fileExists) await RNFS.unlink(outputPath);

      const imageInputs = images
        .map((img, i) => `-loop 1 -t 6 -i "${img.path}"`)
        .join(' ');

      const filterComplex = images
        .map(
          (_, i) =>
            `[${i}:v]scale=1080:1080,fade=t=in:st=0:d=1,fade=t=out:st=1:d=1[v${i}]`,
        )
        .join('; ');

      const concatInputs = images.map((_, i) => `[v${i}]`).join('');
      const filter = `${filterComplex};${concatInputs}concat=n=${images.length}:v=1:a=0,format=yuv420p[v]`;

      const ffmpegCommand = `${imageInputs} -i "${musicPath}" -filter_complex "${filter}" -map "[v]" -map ${images.length}:a -shortest "${outputPath}"`;

      FFmpegKit.executeAsync(ffmpegCommand, async session => {
        const returnCode = await session.getReturnCode();
        setLoading(false);

        if (returnCode.isValueSuccess()) {
          setVideoUri('file://' + outputPath);
          Alert.alert('Video created!');
        } else {
          Alert.alert('Error in video creation');
        }
      });
    } catch (error) {
      setLoading(false);
      console.error('Video generation error:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Photo Sequence Video
      </Text>

      <Button
        icon="folder-multiple-image"
        mode="contained"
        onPress={pickImages}
        style={styles.button}>
        Select 3–5 Photos
      </Button>

      <View style={styles.imageContainer}>
        {images.map((img, i) => (
          <Image
            key={i}
            source={{uri: img.path}}
            style={[styles.image, {borderColor: theme.colors.primary}]}
          />
        ))}
      </View>

      <Button
        icon="folder-multiple-image"
        mode="contained"
        onPress={generateVideo}
        disabled={images.length < 3}
        style={styles.button}>
        Generate Video with Music
      </Button>
      {loading && (
        <ActivityIndicator
          animating={true}
          size="large"
          style={{marginTop: 20}}
        />
      )}

      {videoUri && !loading && (
        <View style={{marginTop: 20, width: '100%', height: 200}}>
          <Video
            muted={false}
            source={{uri: videoUri}}
            style={{width: '100%', height: '100%'}}
            controls
            resizeMode="cover"
          />
        </View>
      )}
    </ScrollView>
  );
};

export default CameraFeature;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Dimensions.get('window').height,
    backgroundColor: '#fdfdfd',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginVertical: 10,
    width: '80%',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 20,
  },
  image: {
    width: 100,
    height: 100,
    margin: 6,
    borderRadius: 8,
    borderWidth: 2,
  },
});
