import { supabase } from '../lib/supabase';
import { UserProfile, UserProfileInput } from '../types/user';
import * as Crypto from 'expo-crypto';

// Hash function for passwords
async function hashString(input: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input
  );
  return digest;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

export async function createUserProfile(userId: string, profile: UserProfileInput): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      user_id: userId,
      ...profile,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, profile: UserProfileInput): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(profile)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function setNoteLockPassword(
  userId: string,
  password: string,
  securityQuestion: string,
  securityAnswer: string
): Promise<void> {
  const hashedPassword = await hashString(password);
  const hashedAnswer = await hashString(securityAnswer.toLowerCase().trim());

  // Check if profile exists
  const profile = await getUserProfile(userId);
  
  if (!profile) {
    // Create profile if it doesn't exist
    await createUserProfile(userId, {
      note_lock_password: hashedPassword,
      note_lock_security_question: securityQuestion,
      note_lock_security_answer: hashedAnswer,
    });
  } else {
    // Update existing profile
    const { error } = await supabase
      .from('user_profiles')
      .update({
        note_lock_password: hashedPassword,
        note_lock_security_question: securityQuestion,
        note_lock_security_answer: hashedAnswer,
      })
      .eq('user_id', userId);

    if (error) throw error;
  }
}

export async function verifyNoteLockPassword(
  userId: string,
  password: string
): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile || !profile.note_lock_password) {
    return false;
  }

  const hashedPassword = await hashString(password);
  return hashedPassword === profile.note_lock_password;
}

export async function verifyNoteLockSecurityAnswer(
  userId: string,
  answer: string
): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile || !profile.note_lock_security_answer) {
    return false;
  }

  const hashedAnswer = await hashString(answer.toLowerCase().trim());
  return hashedAnswer === profile.note_lock_security_answer;
}

export async function hasNoteLockPassword(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return !!(profile && profile.note_lock_password);
}

export async function getNoteLockSecurityQuestion(userId: string): Promise<string | null> {
  const profile = await getUserProfile(userId);
  return profile?.note_lock_security_question || null;
}

export async function uploadAvatar(userId: string, fileUri: string): Promise<string> {
  try {
    // Convert file URI to blob for React Native
    const response = await fetch(fileUri);
    if (!response.ok) {
      throw new Error('Failed to fetch image file');
    }
    const blob = await response.blob();
    
    // Get file extension, default to jpg
    const fileExt = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const fileName = `${timestamp}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Delete old avatar if exists
    const { data: existingFiles } = await supabase.storage
      .from('avatars')
      .list(userId);
    
    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(file => `${userId}/${file.name}`);
      await supabase.storage
        .from('avatars')
        .remove(filesToDelete);
    }

    // Upload new avatar
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        contentType: blob.type || `image/${fileExt}`,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error details:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Avatar upload error:', error);
    throw error;
  }
}
