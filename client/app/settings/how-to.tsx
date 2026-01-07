import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HowToScreen() {
  const router = useRouter();

  const sections = [
    {
      title: 'Getting Started',
      icon: 'rocket-outline',
      items: [
        'Sign up with your email and password',
        'Set your preferences in Settings',
        'Start creating tasks, notes, and projects',
        'Track your expenses in the Expenses tab',
      ],
    },
    {
      title: 'Managing Tasks',
      icon: 'checkbox-outline',
      items: [
        'Tap the + button to create a new task',
        'Set priority (Low, Medium, High)',
        'Add due dates and reminders',
        'Mark tasks as complete with the checkmark',
        'View overdue, today, and upcoming tasks',
      ],
    },
    {
      title: 'Working with Projects',
      icon: 'folder-outline',
      items: [
        'Create projects to organize related tasks',
        'Add tasks to projects for better organization',
        'Track project progress and deadlines',
        'View all tasks within a project',
      ],
    },
    {
      title: 'Taking Notes',
      icon: 'document-text-outline',
      items: [
        'Create quick notes for ideas and reminders',
        'Format your notes with rich text',
        'Organize notes by categories',
        'Search through your notes easily',
      ],
    },
    {
      title: 'Tracking Expenses',
      icon: 'wallet-outline',
      items: [
        'Add expenses with amount and date',
        'Categorize spending (Food, Transport, etc.)',
        'Add tags for flexible organization',
        'View analytics and spending trends',
        'Compare spending across time periods',
      ],
    },
    {
      title: 'Notifications',
      icon: 'notifications-outline',
      items: [
        'Enable push notifications in Settings',
        'Receive reminders for upcoming tasks',
        'Get alerts for overdue items',
        'Customize notification sounds',
      ],
    },
    {
      title: 'Tips & Tricks',
      icon: 'bulb-outline',
      items: [
        'Use high priority for urgent tasks',
        'Set reminders 15-30 minutes before due time',
        'Review your tasks daily in the morning',
        'Check analytics weekly to track spending',
        'Use tags to cross-reference expenses',
        'Keep notes brief and actionable',
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FF8C00" />
        </TouchableOpacity>
        <Text style={styles.title}>How to Use</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Image source={require('../../assets/images/Howtouse.jpg')} style={styles.bannerImage} />
          <Text style={styles.bannerTitle}>TrackMate Guide</Text>
          <Text style={styles.bannerSubtitle}>
            Learn how to make the most of your productivity companion
          </Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={section.icon as any} size={24} color="#FF8C00" />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.card}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <View style={styles.listItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.listItemText}>{item}</Text>
                  </View>
                  {itemIndex < section.items.length - 1 && <View/>}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need more help? Check out the Documentation or FAQ sections.
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
    paddingTop: 1,
    margin: 1,
    marginBottom: 40,
    alignItems: 'center',
    borderWidth: 1,
    // borderColor: '#2A2A2A',
  },
  bannerImage: {
    width: 500,
    height: 230,
    // borderRadius: 16,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF8C00',
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  card: {
    // backgroundColor: '#000000ff',
    // borderRadius: 12,
    padding: 16,
    // borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  bullet: {
    // width: 6,
    // height: 6,
      backgroundColor: '#FF8C00',
    marginTop: 6,
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    color: '#8b8b8bff',
    lineHeight: 22,
  },
  // divider: {
  //   height: 1,
  //   backgroundColor: '#2A2A2A',
  //   marginVertical: 4,
  // },
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
