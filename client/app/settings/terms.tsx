import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FF8C00" />
        </TouchableOpacity>
        <Text style={styles.title}>Terms of Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Image source={require('../../assets/images/terms.jpg')} style={styles.bannerImage} />
          <Text style={styles.bannerTitle}>Terms of Service</Text>
          <Text style={styles.bannerSubtitle}>Last updated: December 2025 2025</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              By accessing and using TrackMate (&quot;the App&quot;), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use the App.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Use License</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              Permission is granted to use TrackMate for personal and commercial productivity purposes. This license shall automatically terminate if you violate any of these restrictions.
            </Text>
            <Text style={styles.subheading}>You may not:</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Modify or copy the App&apos;s materials</Text>
              <Text style={styles.listItem}>• Use the materials for commercial purposes without authorization</Text>
              <Text style={styles.listItem}>• Attempt to reverse engineer any software in the App</Text>
              <Text style={styles.listItem}>• Remove any copyright or proprietary notations</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </Text>
            <Text style={styles.paragraph}>
              You must notify us immediately of any unauthorized use of your account or any other breach of security.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Content</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              You retain all rights to the content you create and store in TrackMate, including tasks, notes, projects, and expense records. We do not claim ownership of your content.
            </Text>
            <Text style={styles.paragraph}>
              You are solely responsible for your content and the consequences of posting or publishing it.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Privacy</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              Your use of TrackMate is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Service Availability</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              We strive to provide reliable service but do not guarantee that the App will be available at all times. We may experience hardware, software, or other problems that could lead to interruptions, delays, or errors.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              TrackMate and its suppliers will not be liable for any damages arising out of the use or inability to use the App, even if we have been advised of the possibility of such damages.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Modifications</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              We reserve the right to modify these terms at any time. We will notify users of any material changes. Your continued use of the App after such modifications constitutes acceptance of the updated terms.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Termination</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              We may terminate or suspend your account and access to the App immediately, without prior notice, for any reason, including breach of these Terms.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Governing Law</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              These terms shall be governed by and construed in accordance with applicable laws, without regard to its conflict of law provisions.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Contact</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              If you have any questions about these Terms, please contact us through the App&apos;s support channels.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using TrackMate, you acknowledge that you have read and understood these Terms of Service.
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
    paddingBottom: 10,
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
    borderRadius: 16,
    paddingTop: 1,
    margin: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000ff',
  },
  bannerImage: {
    width: 500,
    height: 200,    
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
    marginBottom: 20,
    color: '#B0B0B0',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
  },
  card: {
    padding: 16,
  },
  paragraph: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
    marginBottom: 12,
  },
  subheading: {
    fontSize: 15,
    color: '#FFF',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  list: {
    gap: 6,
  },
  listItem: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 13,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
