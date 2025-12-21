import { supabase } from '../lib/supabase';
import { UserProfile, UserProfileInput } from '../types/profile';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
};

export const updateUserProfile = async (
  userId: string,
  updates: UserProfileInput
): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const uploadAvatar = async (userId: string, imageUri: string): Promise<string> => {
  try {
    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    // Get file extension
    const ext = imageUri.split('.').pop() || 'jpg';
    const fileName = `${userId}/avatar.${ext}`;

    // Convert base64 to blob
    const blob = await (await fetch(`data:image/${ext};base64,${base64}`)).blob();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

export const uploadProjectImage = async (userId: string, projectId: string, imageUri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    const ext = imageUri.split('.').pop() || 'jpg';
    const fileName = `${userId}/${projectId}.${ext}`;

    const blob = await (await fetch(`data:image/${ext};base64,${base64}`)).blob();

    const { data, error } = await supabase.storage
      .from('project-images')
      .upload(fileName, blob, {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('project-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading project image:', error);
    throw error;
  }
};

export const uploadTaskImage = async (userId: string, taskId: string, imageUri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    const ext = imageUri.split('.').pop() || 'jpg';
    const fileName = `${userId}/${taskId}.${ext}`;

    const blob = await (await fetch(`data:image/${ext};base64,${base64}`)).blob();

    const { data, error } = await supabase.storage
      .from('task-images')
      .upload(fileName, blob, {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('task-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading task image:', error);
    throw error;
  }
};

export const pickImage = async (): Promise<string | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    throw new Error('Permission to access media library was denied');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    return result.assets[0].uri;
  }

  return null;
};
