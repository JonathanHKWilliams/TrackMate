import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function FAQScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I create a new task?',
      answer: 'Tap the + button at the bottom right of the Tasks screen. Fill in the task details including title, description, due date, priority, and reminders. Tap Save to create your task.',
    },
    {
      question: 'Can I set recurring tasks?',
      answer: 'Currently, recurring tasks are not supported. However, you can duplicate tasks or create multiple tasks with different due dates.',
    },
    {
      question: 'How do I track my expenses?',
      answer: 'Navigate to the Expenses tab, tap the + button, and enter your expense details including amount, category, payment method, and optional tags. You can view analytics and trends in the Analytics section.',
    },
    {
      question: 'What are the default expense categories?',
      answer: 'TrackMate includes 10 default categories: Food & Dining, Transportation, Bills & Utilities, Shopping, Entertainment, Healthcare, Business, Personal, Travel, and Other. You can also create custom categories.',
    },
    {
      question: 'How do I change notification settings?',
      answer: 'Go to Settings > Notifications and toggle push notifications and notification sounds on or off. You can also set default reminder times for new tasks.',
    },
    {
      question: 'Can I export my data?',
      answer: 'Data export functionality is planned for a future update. Currently, all your data is securely stored in your account.',
    },
    {
      question: 'How do I delete my account?',
      answer: 'Account deletion is not currently available in the app. Please contact support if you need to delete your account.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes! All data is stored securely using Supabase with Row Level Security enabled. Only you can access your data, and all connections are encrypted.',
    },
    {
      question: 'Can I use TrackMate offline?',
      answer: 'TrackMate requires an internet connection to sync data. Offline mode is planned for a future update.',
    },
    {
      question: 'How do I organize tasks into projects?',
      answer: 'Create a project from the Projects tab, then when creating or editing a task, select the project from the dropdown menu.',
    },
    {
      question: 'What do the priority levels mean?',
      answer: 'Low priority (gray) for non-urgent tasks, Medium priority (yellow) for important tasks, and High priority (orange) for urgent tasks that need immediate attention.',
    },
    {
      question: 'How do I search for expenses?',
      answer: 'Use the search bar at the top of the Expenses screen to search by title, description, or merchant name. You can also use filters to narrow down results by category, date, or tags.',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FF8C00" />
        </TouchableOpacity>
        <Text style={styles.title}>FAQ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Image source={require('../../assets/images/FAQreal.jpg')} style={styles.bannerImage} />
          <Text style={styles.bannerTitle}>Frequently Asked Questions</Text>
          <Text style={styles.bannerSubtitle}>
            Find answers to common questions
          </Text>
        </View>

        <View style={styles.section}>
          {faqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqCard}
              onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.question}>{faq.question}</Text>
                <Ionicons
                  name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#FF8C00"
                />
              </View>
              {expandedIndex === index && (
                <Text style={styles.answer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Still have questions? Check out the How to Use guide or Documentation.
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
    // backgroundColor: '#1A1A1A',
    // borderRadius: 16,
    padding: 2,
    margin: 1,
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: '#2A2A2A',
  },
  bannerImage: {
    width: 500,
    height: 230,
    borderRadius: 16,
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
    marginBottom: 40,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  faqCard: {
    backgroundColor: '#000000ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderBottomColor: '#2A2A2A',
    // borderColor: '#2A2A2A',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginRight: 12,
  },
  answer: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
    marginTop: 12,
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
