import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DocumentationScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Documentation</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Ionicons name="document-text" size={48} color="#FF8C00" />
          <Text style={styles.bannerTitle}>TrackMate Documentation</Text>
          <Text style={styles.bannerSubtitle}>
            Complete guide to all features and functionality
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              TrackMate is your all-in-one productivity companion designed to help you manage tasks, organize projects, take notes, and track expenses efficiently. Built with a clean, modern interface and powerful features.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <View style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <Ionicons name="checkbox" size={24} color="#FF8C00" />
              <Text style={styles.featureTitle}>Task Management</Text>
            </View>
            <Text style={styles.featureDescription}>
              Create, organize, and track tasks with priorities, due dates, and reminders. View tasks by status: overdue, today, and upcoming.
            </Text>
            <View style={styles.featureDetails}>
              <Text style={styles.detailItem}>• Set priority levels (Low, Medium, High)</Text>
              <Text style={styles.detailItem}>• Add due dates and custom reminders</Text>
              <Text style={styles.detailItem}>• Mark tasks as complete</Text>
              <Text style={styles.detailItem}>• View task history</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <Ionicons name="folder" size={24} color="#FF8C00" />
              <Text style={styles.featureTitle}>Project Organization</Text>
            </View>
            <Text style={styles.featureDescription}>
              Group related tasks into projects for better organization and tracking.
            </Text>
            <View style={styles.featureDetails}>
              <Text style={styles.detailItem}>• Create unlimited projects</Text>
              <Text style={styles.detailItem}>• Assign tasks to projects</Text>
              <Text style={styles.detailItem}>• Track project progress</Text>
              <Text style={styles.detailItem}>• Set project deadlines</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <Ionicons name="document-text" size={24} color="#FF8C00" />
              <Text style={styles.featureTitle}>Note Taking</Text>
            </View>
            <Text style={styles.featureDescription}>
              Capture ideas, reminders, and important information quickly and easily.
            </Text>
            <View style={styles.featureDetails}>
              <Text style={styles.detailItem}>• Create quick notes</Text>
              <Text style={styles.detailItem}>• Rich text formatting</Text>
              <Text style={styles.detailItem}>• Search and filter notes</Text>
              <Text style={styles.detailItem}>• Organize by categories</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <Ionicons name="wallet" size={24} color="#FF8C00" />
              <Text style={styles.featureTitle}>Expense Tracking</Text>
            </View>
            <Text style={styles.featureDescription}>
              Track spending, analyze patterns, and make better financial decisions.
            </Text>
            <View style={styles.featureDetails}>
              <Text style={styles.detailItem}>• Record expenses with details</Text>
              <Text style={styles.detailItem}>• Categorize and tag expenses</Text>
              <Text style={styles.detailItem}>• View spending analytics</Text>
              <Text style={styles.detailItem}>• Compare time periods</Text>
              <Text style={styles.detailItem}>• Track payment methods</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings & Preferences</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              Customize TrackMate to match your workflow:
            </Text>
            <View style={styles.settingsList}>
              <Text style={styles.settingItem}>• Enable/disable notifications</Text>
              <Text style={styles.settingItem}>• Toggle notification sounds</Text>
              <Text style={styles.settingItem}>• Set default task priorities</Text>
              <Text style={styles.settingItem}>• Choose default reminder times</Text>
              <Text style={styles.settingItem}>• Configure task display options</Text>
              <Text style={styles.settingItem}>• Customize sort order</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Security</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              Your data is stored securely using Supabase with industry-standard encryption. All data is private to your account with Row Level Security enabled.
            </Text>
            <View style={styles.securityBadges}>
              <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                <Text style={styles.badgeText}>Encrypted</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="lock-closed" size={20} color="#4CAF50" />
                <Text style={styles.badgeText}>Secure</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="eye-off" size={20} color="#4CAF50" />
                <Text style={styles.badgeText}>Private</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Details</Text>
          <View style={styles.card}>
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>Platform</Text>
              <Text style={styles.techValue}>React Native + Expo</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>Backend</Text>
              <Text style={styles.techValue}>Supabase</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>Language</Text>
              <Text style={styles.techValue}>TypeScript</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>Version</Text>
              <Text style={styles.techValue}>1.0.0</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For more help, check out the How to Use guide or FAQ section.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  banner: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 32,
    margin: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
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
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  paragraph: {
    fontSize: 15,
    color: '#B0B0B0',
    lineHeight: 22,
  },
  featureCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  featureDescription: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
    marginBottom: 12,
  },
  featureDetails: {
    gap: 6,
  },
  detailItem: {
    fontSize: 14,
    color: '#FFF',
    lineHeight: 20,
  },
  settingsList: {
    marginTop: 12,
    gap: 6,
  },
  settingItem: {
    fontSize: 14,
    color: '#FFF',
    lineHeight: 20,
  },
  securityBadges: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4CAF50' + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  techLabel: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  techValue: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
  },
  footer: {
    padding: 16,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 20,
  },
});
