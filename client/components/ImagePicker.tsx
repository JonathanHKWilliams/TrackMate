import { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePickerExpo from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface ImagePickerProps {
  currentImage?: string | null;
  onImageSelected: (uri: string) => void;
  size?: number;
}

export default function ImagePicker({ currentImage, onImageSelected, size = 100 }: ImagePickerProps) {
  const [loading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePickerExpo.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload a profile picture.');
        return;
      }

      const result = await ImagePickerExpo.launchImageLibraryAsync({
        mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePickerExpo.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take a photo.');
        return;
      }

      const result = await ImagePickerExpo.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showOptions = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}
      onPress={showOptions}
      disabled={loading}
    >
      {currentImage ? (
        <Image source={{ uri: currentImage }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="person" size={size * 0.5} color="#FF8C00" />
        </View>
      )}
      
      <View style={styles.editBadge}>
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Ionicons name="camera" size={16} color="#FFF" />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#2A2A2A',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF8C00',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
});
