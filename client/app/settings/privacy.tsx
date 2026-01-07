import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FF8C00" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Image source={require('../../assets/images/userpolicy.jpg')} style={styles.bannerImage} />
          <Text style={styles.bannerTitle}>Privacy Policy</Text>
          <Text style={styles.bannerSubtitle}>Last updated: December 2024</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Commitment</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              At TrackMate, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <View style={styles.card}>
            <Text style={styles.subheading}>Account Information</Text>
            <Text style={styles.paragraph}>
              When you create an account, we collect your email address and encrypted password. This information is necessary to provide you with access to your account.
            </Text>
            
            <Text style={styles.subheading}>User Content</Text>
            <Text style={styles.paragraph}>
              We store the content you create in TrackMate, including:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Tasks and their details</Text>
              <Text style={styles.listItem}>• Projects and project information</Text>
              <Text style={styles.listItem}>• Notes and note content</Text>
              <Text style={styles.listItem}>• Expense records and financial data</Text>
              <Text style={styles.listItem}>• Categories and tags you create</Text>
            </View>

            <Text style={styles.subheading}>Usage Data</Text>
            <Text style={styles.paragraph}>
              We may collect information about how you access and use the App, including device information, app usage patterns, and error logs.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <View style={styles.card}>
            <View style={styles.list}>
              <Text style={styles.listItem}>• To provide and maintain the App</Text>
              <Text style={styles.listItem}>• To manage your account</Text>
              <Text style={styles.listItem}>• To send you notifications (if enabled)</Text>
              <Text style={styles.listItem}>• To improve and optimize the App</Text>
              <Text style={styles.listItem}>• To detect and prevent technical issues</Text>
              <Text style={styles.listItem}>• To respond to your requests and support needs</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Security</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              We implement industry-standard security measures to protect your data:
            </Text>
            <View style={styles.securityFeatures}>
              <View style={styles.securityItem}>
                <Ionicons name="lock-closed" size={20} color="#4CAF50" />
                <Text style={styles.securityText}>Encrypted connections (HTTPS/TLS)</Text>
              </View>
              <View style={styles.securityItem}>
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                <Text style={styles.securityText}>Row Level Security (RLS)</Text>
              </View>
              <View style={styles.securityItem}>
                <Ionicons name="key" size={20} color="#4CAF50" />
                <Text style={styles.securityText}>Encrypted password storage</Text>
              </View>
              <View style={styles.securityItem}>
                <Ionicons name="server" size={20} color="#4CAF50" />
                <Text style={styles.securityText}>Secure cloud infrastructure</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sharing</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              We do not sell, trade, or rent your personal information to third parties. Your data is private and only accessible to you.
            </Text>
            <Text style={styles.paragraph}>
              We may share data only in the following circumstances:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• With your explicit consent</Text>
              <Text style={styles.listItem}>• To comply with legal obligations</Text>
              <Text style={styles.listItem}>• To protect our rights and safety</Text>
              <Text style={styles.listItem}>• With service providers who assist in app operation (under strict confidentiality)</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>You have the right to:</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Access your personal data</Text>
              <Text style={styles.listItem}>• Correct inaccurate data</Text>
              <Text style={styles.listItem}>• Delete your account and data</Text>
              <Text style={styles.listItem}>• Export your data</Text>
              <Text style={styles.listItem}>• Opt-out of notifications</Text>
              <Text style={styles.listItem}>• Withdraw consent at any time</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Retention</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              We retain your data for as long as your account is active or as needed to provide you services. If you delete your account, we will delete your data within 30 days, except where we are required to retain it for legal purposes.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children&apos;s Privacy</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              TrackMate is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to Privacy Policy</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy in the App and updating the &quot;Last updated&quot; date.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us through the App&apos;s support channels.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your privacy is important to us. We are committed to protecting your personal information and being transparent about our practices.
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
    borderColor: '#000000ff',
  },
  bannerImage: {
    width: 500,
    height: 230,
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
    marginBottom: 20,
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
    backgroundColor: '#000000ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#000000ff',
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
    marginBottom: 12,
  },
  listItem: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
  },
  securityFeatures: {
    gap: 12,
    marginTop: 8,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#4CAF50' + '10',
    padding: 12,
    borderRadius: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#FFF',
    flex: 1,
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
