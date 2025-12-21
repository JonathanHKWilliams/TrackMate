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
import { verifyNoteLockPassword } from '../services/userProfileService';
import { useAuth } from '../contexts/AuthContext';

interface VerifyNoteLockPasswordModalProps {
  visible: boolean;
  noteId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VerifyNoteLockPasswordModal({ 
  visible, 
  noteId, 
  onClose, 
  onSuccess 
}: VerifyNoteLockPasswordModalProps) {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
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
      console.error('Error verifying password:', error);
      Alert.alert('Error', 'Failed to verify password');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPassword('');
    setShowPassword(false);
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
            <Ionicons name="lock-closed" size={48} color="#FF8C00" />
            <Text style={styles.title}>Lock Note</Text>
            <Text style={styles.subtitle}>Enter your note lock password</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor="#666"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoFocus
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#B0B0B0"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.lockButton, loading && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={loading}
              >
                <Text style={styles.lockButtonText}>
                  {loading ? 'Locking...' : 'Lock Note'}
                </Text>
              </TouchableOpacity>
            </View>
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
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
    paddingVertical: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
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
