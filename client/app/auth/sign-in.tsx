import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, uploadAvatar } from '../../services/userProfileService';
import { Ionicons } from '@expo/vector-icons';
import ImagePicker from '../../components/ImagePicker';
import CustomAlert from '../../components/CustomAlert';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({ visible: false, title: '', message: '', type: 'info' });
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) {
      setAlert({ visible: true, title: 'Error', message: 'Please fill in all fields', type: 'error' });
      return;
    }

    if (isSignUp && !username.trim()) {
      setAlert({ visible: true, title: 'Error', message: 'Please enter a username', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await signUp(email, password);
        if (error) throw error;
        
        // Profile and settings are auto-created by database trigger
        // Now update profile with username and avatar if provided
        if (data?.user && data.session) {
          try {
            let avatarUrl = null;
            
            // Upload avatar if selected
            if (avatarUri) {
              try {
                avatarUrl = await uploadAvatar(data.user.id, avatarUri);
              } catch (uploadError) {
                console.error('Error uploading avatar:', uploadError);
              }
            }
            
            // Update profile with username and avatar
            if (username.trim() || avatarUrl) {
              await updateUserProfile(data.user.id, {
                full_name: username.trim() || undefined,
                avatar_url: avatarUrl || undefined,
              });
            }
          } catch (profileError) {
            console.error('Error updating profile:', profileError);
            // Don't block signup for profile update failures
          }
        }
        
        setAlert({ visible: true, title: 'Success', message: 'Account created successfully! Please check your email to verify your account.', type: 'success' });
        setIsSignUp(false);
        setUsername('');
        setAvatarUri(null);
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      setAlert({ visible: true, title: 'Error', message: error.message || 'An error occurred', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#FF8C00" />
          </View>
          <Text style={styles.appName}>TrackMate</Text>
          <Text style={styles.tagline}>Your productivity companionn</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
          </Text>
          
          <View style={styles.form}>
            {isSignUp && (
              <>
                <View style={styles.avatarSection}>
                  <ImagePicker
                    currentImage={avatarUri}
                    onImageSelected={setAvatarUri}
                    size={100}
                  />
                  <Text style={styles.avatarHint}>Tap to add profile picture</Text>
                </View>
                
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#9d9d9dff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="#a1a1a1ff"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                </View>
              </>
            )}
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#9d9d9dff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#a1a1a1ff"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#9d9d9dff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#a1a1a1ff"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#9d9d9dff"
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
              {!loading && (
                <Ionicons name="arrow-forward" size={20} color="#FFF" style={styles.buttonIcon} />
              )}
            </TouchableOpacity>
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsSignUp(!isSignUp)}
              disabled={loading}
            >
              <Text style={styles.toggleText}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={styles.toggleTextBold}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 16,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B0B0B0',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#FFF',
  },
  button: {
    backgroundColor: '#FF8C00',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#B8660A',
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A2A2A',
  },
  dividerText: {
    color: '#666',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleText: {
    color: '#B0B0B0',
    fontSize: 15,
  },
  toggleTextBold: {
    color: '#FF8C00',
    fontWeight: '600',
  },
  eyeIcon: {
    padding: 8,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarHint: {
    fontSize: 13,
    color: '#B0B0B0',
    marginTop: 8,
  },
});
