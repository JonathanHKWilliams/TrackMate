import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

let sound: Audio.Sound | null = null;

export const playTaskCompleteSound = async (soundEnabled: boolean = true) => {
  if (!soundEnabled) return;

  try {
    // Play haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Play sound file
    const { sound: audioSound } = await Audio.Sound.createAsync(
      require('../assets/sounds/complete.mp3')
    );
    sound = audioSound;
    await sound.playAsync();
    
    // Unload sound after playing
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound?.unloadAsync();
      }
    });
    
  } catch (error) {
    console.error('Error playing completion sound:', error);
  }
};

export const unloadSound = async () => {
  if (sound) {
    await sound.unloadAsync();
    sound = null;
  }
};
