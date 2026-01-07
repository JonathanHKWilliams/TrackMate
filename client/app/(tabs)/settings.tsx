import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, ActivityIndicator, TextInput, Modal, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useExpense } from '../../contexts/ExpenseContext';
import { useBudget } from '../../contexts/BudgetContext';
import { useBudgetList } from '../../contexts/BudgetListContext';
import { useEstimate } from '../../contexts/EstimateContext';
import { getUserProfile, updateUserProfile, uploadAvatar } from '../../services/userProfileService';
import ImagePicker from '../../components/ImagePicker';
import CustomAlert from '../../components/CustomAlert';
import { REMINDER_OPTIONS, SORT_OPTIONS } from '../../types/settings';
import { PRIORITY_OPTIONS } from '../../types/task';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { settings, updateSettings, loading } = useSettings();
  const { theme, setTheme } = useTheme();
  const { expenses } = useExpense();
  const { activeBudgetsWithSpending } = useBudget();
  const { budgetLists } = useBudgetList();
  const { estimates } = useEstimate();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({ visible: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    try {
      const profile = await getUserProfile(user.id);
      if (profile) {
        setUsername(profile.full_name || '');
        setAvatarUrl(profile.avatar_url || null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSaveUsername = async () => {
    if (!user || !editUsername.trim()) {
      setAlert({ visible: true, title: 'Error', message: 'Please enter a username', type: 'error' });
      return;
    }

    setSavingProfile(true);
    try {
      await updateUserProfile(user.id, { full_name: editUsername.trim() });
      setUsername(editUsername.trim());
      setShowEditModal(false);
      setAlert({ visible: true, title: 'Success', message: 'Username updated successfully', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlert({ visible: true, title: 'Error', message: 'Failed to update username', type: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarSelected = async (uri: string) => {
    if (!user) return;
    
    setSavingProfile(true);
    try {
      const newAvatarUrl = await uploadAvatar(user.id, uri);
      await updateUserProfile(user.id, { avatar_url: newAvatarUrl });
      setAvatarUrl(newAvatarUrl);
      setAlert({ visible: true, title: 'Success', message: 'Profile picture updated successfully', type: 'success' });
    } catch (error) {
      console.error('Error updating avatar:', error);
      setAlert({ visible: true, title: 'Error', message: 'Failed to update profile picture', type: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    setAlert({
      visible: true,
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      type: 'warning',
    });
  };

  const confirmSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      setAlert({ visible: true, title: 'Error', message: 'Failed to sign out', type: 'error' });
    }
  };

  const handleExportData = async () => {
    try {
      setExportingData(true);
      
      const summary = `TrackMate Data Export\n\nExpenses: ${expenses.length}\nBudgets: ${activeBudgetsWithSpending.length}\nBudget Lists: ${budgetLists.length}\nEstimates: ${estimates.length}\n\nExported on: ${new Date().toLocaleDateString()}`;

      await Share.share({
        message: summary,
        title: 'TrackMate Data Export',
      });

      setAlert({ visible: true, title: 'Success', message: 'Data export summary shared successfully', type: 'success' });
    } catch (error) {
      console.error('Error exporting data:', error);
      setAlert({ visible: true, title: 'Error', message: 'Failed to export data', type: 'error' });
    } finally {
      setExportingData(false);
    }
  };

  const handleBackupToCloud = () => {
    setAlert({
      visible: true,
      title: 'Cloud Backup',
      message: 'Cloud backup feature coming soon! Your data is automatically synced to Supabase.',
      type: 'info',
    });
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all your data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: confirmClearData,
        },
      ]
    );
  };

  const confirmClearData = () => {
    setAlert({
      visible: true,
      title: 'Feature Coming Soon',
      message: 'Clear data functionality will be available in the next update.',
      type: 'info',
    });
  };

  if (loading || !settings) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.profileInfo}>
              <ImagePicker
                currentImage={avatarUrl}
                onImageSelected={handleAvatarSelected}
                size={80}
              />
              <View style={styles.profileText}>
                <Text style={styles.profileName}>{username || 'Set your username'}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                setEditUsername(username);
                setShowEditModal(true);
              }}
            >
              <Ionicons name="pencil" size={20} color="#FF8C00" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || 'Not signed in'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive reminders and overdue alerts
              </Text>
            </View>
            <Switch
              value={settings.notifications_enabled}
              onValueChange={(value) => updateSettings({ notifications_enabled: value })}
              trackColor={{ false: '#2A2A2A', true: '#FF8C00' }}
              thumbColor={settings.notifications_enabled ? '#FFF' : '#B0B0B0'}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notification Sound</Text>
              <Text style={styles.settingDescription}>
                Play sound for reminders
              </Text>
            </View>
            <Switch
              value={settings.sound_enabled}
              onValueChange={(value) => updateSettings({ sound_enabled: value })}
              trackColor={{ false: '#2A2A2A', true: '#FF8C00' }}
              thumbColor={settings.sound_enabled ? '#FFF' : '#B0B0B0'}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Theme</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                theme === 'dark' && styles.optionButtonActive,
              ]}
              onPress={() => setTheme('dark')}
            >
              <Ionicons 
                name="moon" 
                size={18} 
                color={theme === 'dark' ? '#FFF' : '#B0B0B0'} 
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.optionButtonText,
                  theme === 'dark' && styles.optionButtonTextActive,
                ]}
              >
                Dark
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                theme === 'light' && styles.optionButtonActive,
              ]}
              onPress={() => setTheme('light')}
            >
              <Ionicons 
                name="sunny" 
                size={18} 
                color={theme === 'light' ? '#FFF' : '#B0B0B0'} 
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.optionButtonText,
                  theme === 'light' && styles.optionButtonTextActive,
                ]}
              >
                Light
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Finance Preferences</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Default Currency</Text>
              <Text style={styles.settingDescription}>
                Set your preferred currency for expenses and estimates
              </Text>
            </View>
          </View>
          <View style={styles.optionsRow}>
            {['LRD', 'USD', 'EUR', 'GBP'].map((currency) => (
              <TouchableOpacity
                key={currency}
                style={[
                  styles.optionButton,
                  styles.currencyButton,
                  settings.default_currency === currency && styles.optionButtonActive,
                ]}
                onPress={() => updateSettings({ default_currency: currency as 'LRD' | 'USD' | 'EUR' | 'GBP' })}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    settings.default_currency === currency && styles.optionButtonTextActive,
                  ]}
                >
                  {currency}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Expense Categories</Text>
              <Text style={styles.settingDescription}>
                Display category icons in expense list
              </Text>
            </View>
            <Switch
              value={settings.show_expense_categories}
              onValueChange={(value) => updateSettings({ show_expense_categories: value })}
              trackColor={{ false: '#2A2A2A', true: '#FF8C00' }}
              thumbColor={settings.show_expense_categories ? '#FFF' : '#B0B0B0'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-Generate Estimate Numbers</Text>
              <Text style={styles.settingDescription}>
                Automatically create sequential estimate numbers
              </Text>
            </View>
            <Switch
              value={settings.auto_generate_estimate_numbers}
              onValueChange={(value) => updateSettings({ auto_generate_estimate_numbers: value })}
              trackColor={{ false: '#2A2A2A', true: '#FF8C00' }}
              thumbColor={settings.auto_generate_estimate_numbers ? '#FFF' : '#B0B0B0'}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Budget Preferences</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Budget Alerts</Text>
              <Text style={styles.settingDescription}>
                Get notified when approaching budget limits
              </Text>
            </View>
            <Switch
              value={settings.budget_alerts_enabled}
              onValueChange={(value) => updateSettings({ budget_alerts_enabled: value })}
              trackColor={{ false: '#2A2A2A', true: '#FF8C00' }}
              thumbColor={settings.budget_alerts_enabled ? '#FFF' : '#B0B0B0'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Alert Threshold</Text>
              <Text style={styles.settingDescription}>
                Notify when spending reaches this percentage
              </Text>
            </View>
          </View>
          <View style={styles.optionsRow}>
            {[75, 80, 90, 95].map((threshold) => (
              <TouchableOpacity
                key={threshold}
                style={[
                  styles.optionButton,
                  settings.budget_alert_threshold === threshold && styles.optionButtonActive,
                ]}
                onPress={() => updateSettings({ budget_alert_threshold: threshold })}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    settings.budget_alert_threshold === threshold && styles.optionButtonTextActive,
                  ]}
                >
                  {threshold}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Task Defaults</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Default Reminder</Text>
          <View style={styles.optionsGrid}>
            {REMINDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  settings.default_reminder === option.value && styles.optionButtonActive,
                ]}
                onPress={() => updateSettings({ default_reminder: option.value })}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    settings.default_reminder === option.value && styles.optionButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.label}>Default Priority</Text>
          <View style={styles.optionsRow}>
            {PRIORITY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  settings.default_priority === option.value && styles.optionButtonActive,
                ]}
                onPress={() => updateSettings({ default_priority: option.value })}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    settings.default_priority === option.value && styles.optionButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Task Display</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Completed Tasks</Text>
              <Text style={styles.settingDescription}>
                Display completed tasks in task list
              </Text>
            </View>
            <Switch
              value={settings.show_completed_tasks}
              onValueChange={(value) => updateSettings({ show_completed_tasks: value })}
              trackColor={{ false: '#2A2A2A', true: '#FF8C00' }}
              thumbColor={settings.show_completed_tasks ? '#FFF' : '#B0B0B0'}
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.label}>Sort Tasks By</Text>
          <View style={styles.optionsRow}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  settings.task_sort_order === option.value && styles.optionButtonActive,
                ]}
                onPress={() => updateSettings({ task_sort_order: option.value })}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    settings.task_sort_order === option.value && styles.optionButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleExportData}
            disabled={exportingData}
          >
            <View style={styles.menuItemLeft}>
              {exportingData ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <Ionicons name="download-outline" size={22} color="#4CAF50" />
              )}
              <View>
                <Text style={styles.menuItemText}>
                  {exportingData ? 'Exporting...' : 'Export Data'}
                </Text>
                <Text style={styles.menuItemSubtext}>Download all your data as JSON</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleBackupToCloud}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="cloud-upload-outline" size={22} color="#4ECDC4" />
              <View>
                <Text style={styles.menuItemText}>Backup to Cloud</Text>
                <Text style={styles.menuItemSubtext}>Sync data to cloud storage</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleClearData}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="trash-outline" size={22} color="#FF4444" />
              <View>
                <Text style={[styles.menuItemText, { color: '#FF4444' }]}>Clear All Data</Text>
                <Text style={styles.menuItemSubtext}>Remove all local data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display Preferences</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Compact View</Text>
              <Text style={styles.settingDescription}>
                Show more items with smaller spacing
              </Text>
            </View>
            <Switch
              value={settings.compact_view}
              onValueChange={(value) => updateSettings({ compact_view: value })}
              trackColor={{ false: '#2A2A2A', true: '#FF8C00' }}
              thumbColor={settings.compact_view ? '#FFF' : '#B0B0B0'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Icons</Text>
              <Text style={styles.settingDescription}>
                Display icons throughout the app
              </Text>
            </View>
            <Switch
              value={settings.show_icons}
              onValueChange={(value) => updateSettings({ show_icons: value })}
              trackColor={{ false: '#2A2A2A', true: '#FF8C00' }}
              thumbColor={settings.show_icons ? '#FFF' : '#B0B0B0'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Animations</Text>
              <Text style={styles.settingDescription}>
                Enable smooth transitions and animations
              </Text>
            </View>
            <Switch
              value={settings.animations_enabled}
              onValueChange={(value) => updateSettings({ animations_enabled: value })}
              trackColor={{ false: '#2A2A2A', true: '#FF8C00' }}
              thumbColor={settings.animations_enabled ? '#FFF' : '#B0B0B0'}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & Support</Text>
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/settings/how-to' as any)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="book-outline" size={22} color="#FF8C00" />
              <Text style={styles.menuItemText}>How to Use</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/settings/documentation' as any)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="document-text-outline" size={22} color="#FF8C00" />
              <Text style={styles.menuItemText}>Documentation</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/settings/faq' as any)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={22} color="#FF8C00" />
              <Text style={styles.menuItemText}>FAQ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/settings/terms' as any)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="document-outline" size={22} color="#FF8C00" />
              <Text style={styles.menuItemText}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/settings/privacy' as any)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#FF8C00" />
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>App Name</Text>
            <Text style={styles.value}>TrackMate</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Versionn</Text>
            <Text style={styles.value}>2.1.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Build by Liight Design Inc inc</Text>
            <Text style={styles.value}>2025.12</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Dev</Text>
            <Text style={styles.value}>williamslight91@gmail.com</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        TrackMate — your productivity companion, designed to help you plan tasks, track progress, and stay focused every day.
      </Text>

      <CustomAlert
        visible={alert.visible && alert.type !== 'warning'}
        title={alert.title}
        message={alert.message}
        type={alert.type === 'warning' ? 'info' : alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
      />

      <CustomAlert
        visible={alert.visible && alert.type === 'warning'}
        title={alert.title}
        message={alert.message}
        type="warning"
        onClose={() => setAlert({ ...alert, visible: false })}
        onConfirm={confirmSignOut}
        confirmText="Sign Out"
        cancelText="Cancel"
      />

      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Username</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Username</Text>
              <TextInput
                style={styles.modalInput}
                value={editUsername}
                onChangeText={setEditUsername}
                placeholder="Enter your username"
                placeholderTextColor="#ffffffff"
                autoCapitalize="words"
                autoFocus
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton, savingProfile && styles.buttonDisabled]}
                onPress={handleSaveUsername}
                disabled={savingProfile}
              >
                <Text style={styles.modalSaveText}>
                  {savingProfile ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF8C00',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
    marginTop: 16,
  },
  card: {
    backgroundColor: '#000000ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 0,
    borderColor: '#2A2A2A',
  },
  label: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: 8,
  },
  signOutButton: {
    backgroundColor: '#FF8C00',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  footer: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 40,
    marginLeft: 16,
    marginRight: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 0,
    borderColor: '#2A2A2A',
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyButton: {
    flex: 1,
    justifyContent: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#B0B0B0',
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  menuItemSubtext: {
    fontSize: 13,
    color: '#B0B0B0',
    marginTop: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    gap: 8,
    marginLeft: 1,
    marginRight: 20,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#000000ff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#000',
    borderWidth: 0,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFF',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1c1c1cff',
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B0B0B0',
  },
  modalSaveButton: {
    backgroundColor: '#FF8C00',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  buttonDisabled: {
    opacity: 100,
    borderColor: '#B0B0B0',
  },
});
