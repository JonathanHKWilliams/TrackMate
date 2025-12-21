import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lockNote } from '../services/noteService';

interface NoteLockModalProps {
  visible: boolean;
  noteId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NoteLockModal({ visible, noteId, onClose, onSuccess }: NoteLockModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const predefinedQuestions = [
    "What is your pet's name?",
    "What city were you born in?",
    "What is your mother's maiden name?",
    "What was your first car?",
    "What is your favorite color?",
  ];

  const handleLock = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (password.length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!securityQuestion.trim()) {
      Alert.alert('Error', 'Please select or enter a security question');
      return;
    }

    if (!securityAnswer.trim()) {
      Alert.alert('Error', 'Please enter a security answer');
      return;
    }

    setLoading(true);
    try {
      await lockNote(noteId, {
        password: password.trim(),
        securityQuestion: securityQuestion.trim(),
        securityAnswer: securityAnswer.trim(),
      });

      Alert.alert('Success', 'Note locked successfully');
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error locking note:', error);
      Alert.alert('Error', 'Failed to lock note');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPassword('');
    setConfirmPassword('');
    setSecurityQuestion('');
    setSecurityAnswer('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Ionicons name="lock-closed" size={24} color="#FF8C00" />
            <Text style={styles.headerTitle}>Lock Note</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#FF8C00" />
              <Text style={styles.infoText}>
                Set a password to protect this note. You&apos;ll need this password to view or edit the note.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor="#666"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
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

            <View style={styles.section}>
              <Text style={styles.label}>Confirm Password *</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter password"
                  placeholderTextColor="#666"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#B0B0B0"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Security Question *</Text>
              <Text style={styles.hint}>Used to recover access if you forget your password</Text>
              <View style={styles.questionsContainer}>
                {predefinedQuestions.map((question) => (
                  <TouchableOpacity
                    key={question}
                    style={[
                      styles.questionChip,
                      securityQuestion === question && styles.questionChipActive,
                    ]}
                    onPress={() => setSecurityQuestion(question)}
                  >
                    <Text
                      style={[
                        styles.questionText,
                        securityQuestion === question && styles.questionTextActive,
                      ]}
                    >
                      {question}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.orText}>Or enter your own:</Text>
              <TextInput
                style={styles.textInput}
                value={securityQuestion}
                onChangeText={setSecurityQuestion}
                placeholder="Enter custom security question"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Security Answer *</Text>
              <TextInput
                style={styles.textInput}
                value={securityAnswer}
                onChangeText={setSecurityAnswer}
                placeholder="Enter answer"
                placeholderTextColor="#666"
                autoCapitalize="none"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.lockButton, loading && styles.buttonDisabled]}
              onPress={handleLock}
              disabled={loading}
            >
              <Ionicons name="lock-closed" size={18} color="#FFF" />
              <Text style={styles.lockButtonText}>
                {loading ? 'Locking...' : 'Lock Note'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#2A2A2A',
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
    padding: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FF8C00' + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#FF8C00',
    lineHeight: 18,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 12,
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
  questionsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  questionChip: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
  },
  questionChipActive: {
    backgroundColor: '#FF8C00' + '20',
    borderColor: '#FF8C00',
  },
  questionText: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  questionTextActive: {
    color: '#FF8C00',
    fontWeight: '600',
  },
  orText: {
    fontSize: 13,
    color: '#B0B0B0',
    marginBottom: 8,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B0B0B0',
  },
  lockButton: {
    backgroundColor: '#FF8C00',
  },
  lockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
