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
import { setNoteLockPassword } from '../services/userProfileService';
import { useAuth } from '../contexts/AuthContext';

interface SetNoteLockPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SetNoteLockPasswordModal({ visible, onClose, onSuccess }: SetNoteLockPasswordModalProps) {
  const { user } = useAuth();
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

  const handleSetPassword = async () => {
    if (!user) return;

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
      await setNoteLockPassword(
        user.id,
        password.trim(),
        securityQuestion.trim(),
        securityAnswer.trim()
      );

      Alert.alert('Success', 'Note lock password set successfully. You can now lock notes with this password.');
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error setting note lock password:', error);
      Alert.alert('Error', 'Failed to set note lock password');
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
            <Text style={styles.title}>Set Note Lock Password</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.description}>
              Set a password to protect all your locked notes. This password will be used for all notes you lock.
            </Text>

            <Text style={styles.label}>Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor="#666"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#B0B0B0"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                placeholderTextColor="#666"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#B0B0B0"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Security Question *</Text>
            <Text style={styles.hint}>Choose a question for password recovery</Text>
            {predefinedQuestions.map((question) => (
              <TouchableOpacity
                key={question}
                style={[
                  styles.questionOption,
                  securityQuestion === question && styles.questionOptionActive,
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

            <Text style={styles.orText}>Or enter your own question:</Text>
            <TextInput
              style={styles.input}
              value={securityQuestion}
              onChangeText={setSecurityQuestion}
              placeholder="Enter custom security question"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>Security Answer *</Text>
            <TextInput
              style={styles.input}
              value={securityAnswer}
              onChangeText={setSecurityAnswer}
              placeholder="Enter answer"
              placeholderTextColor="#666"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSetPassword}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Setting Password...' : 'Set Password'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 20,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
    marginTop: 16,
  },
  hint: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFF',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
    paddingVertical: 16,
  },
  questionOption: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  questionOptionActive: {
    borderColor: '#FF8C00',
    backgroundColor: '#FF8C00' + '20',
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
    fontSize: 12,
    color: '#B0B0B0',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF8C00',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
