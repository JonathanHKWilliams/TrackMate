import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { verifyNoteLockPassword, verifyNoteLockSecurityAnswer, getNoteLockSecurityQuestion } from '../services/userProfileService';
import { useAuth } from '../contexts/AuthContext';

interface NoteUnlockModalProps {
  visible: boolean;
  noteId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NoteUnlockModal({ visible, noteId, onClose, onSuccess }: NoteUnlockModalProps) {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');

  const handleUnlock = async () => {
    if (!user) return;
    
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifyNoteLockPassword(user.id, password.trim());
      
      if (isValid) {
        resetForm();
        onSuccess();
      } else {
        Alert.alert('Error', 'Incorrect password');
      }
    } catch (error) {
      console.error('Error unlocking note:', error);
      Alert.alert('Error', 'Failed to unlock note');
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async () => {
    if (!user) return;
    
    if (!securityAnswer.trim()) {
      Alert.alert('Error', 'Please enter your security answer');
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifyNoteLockSecurityAnswer(user.id, securityAnswer.trim());
      
      if (isValid) {
        resetForm();
        onSuccess();
      } else {
        Alert.alert('Error', 'Incorrect security answer');
      }
    } catch (error) {
      console.error('Error unlocking note:', error);
      Alert.alert('Error', 'Failed to unlock note');
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityQuestion = async () => {
    if (!user) return;
    
    try {
      const question = await getNoteLockSecurityQuestion(user.id);
      if (question) {
        setSecurityQuestion(question);
        setShowRecovery(true);
      } else {
        Alert.alert('Error', 'No security question found');
      }
    } catch (error) {
      console.error('Error loading security question:', error);
      Alert.alert('Error', 'Failed to load security question');
    }
  };

  const resetForm = () => {
    setPassword('');
    setSecurityAnswer('');
    setShowPassword(false);
    setShowRecovery(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Ionicons name="lock-open" size={24} color="#FF8C00" />
            <Text style={styles.headerTitle}>
              {showRecovery ? 'Recover Access' : 'Unlock Note'}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {!showRecovery ? (
              <>
                <View style={styles.iconContainer}>
                  <Ionicons name="lock-closed" size={64} color="#FF8C00" />
                </View>

                <Text style={styles.message}>
                  This note is locked. Enter your password to view it.
                </Text>

                <View style={styles.section}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.passwordInput}>
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter password"
                      placeholderTextColor="#666"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoFocus
                      onSubmitEditing={handleUnlock}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#B0B0B0"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.forgotButton}
                  onPress={loadSecurityQuestion}
                >
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.unlockButton, loading && styles.buttonDisabled]}
                  onPress={handleUnlock}
                  disabled={loading}
                >
                  <Ionicons name="lock-open" size={18} color="#FFF" />
                  <Text style={styles.unlockButtonText}>
                    {loading ? 'Unlocking...' : 'Unlock'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.iconContainer}>
                  <Ionicons name="help-circle" size={64} color="#FF8C00" />
                </View>

                <Text style={styles.message}>
                  Answer your security question to recover access
                </Text>

                <View style={styles.section}>
                  <Text style={styles.label}>Security Question</Text>
                  <View style={styles.questionBox}>
                    <Text style={styles.questionText}>{securityQuestion}</Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>Your Answer</Text>
                  <TextInput
                    style={styles.textInput}
                    value={securityAnswer}
                    onChangeText={setSecurityAnswer}
                    placeholder="Enter your answer"
                    placeholderTextColor="#666"
                    autoCapitalize="none"
                    autoFocus
                    onSubmitEditing={handleRecovery}
                  />
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.backButton]}
                    onPress={() => setShowRecovery(false)}
                  >
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.recoverButton, loading && styles.buttonDisabled]}
                    onPress={handleRecovery}
                    disabled={loading}
                  >
                    <Text style={styles.recoverButtonText}>
                      {loading ? 'Verifying...' : 'Recover'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
    marginLeft: 12,
  },
  content: {
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 15,
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#FFF',
  },
  textInput: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFF',
  },
  questionBox: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    padding: 16,
  },
  questionText: {
    fontSize: 15,
    color: '#FF8C00',
    fontWeight: '500',
  },
  forgotButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 14,
    color: '#FF8C00',
    fontWeight: '500',
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF8C00',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B0B0B0',
  },
  recoverButton: {
    backgroundColor: '#FF8C00',
  },
  recoverButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
