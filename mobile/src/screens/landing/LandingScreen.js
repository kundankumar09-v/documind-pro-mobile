import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../theme/colors';

const FEATURES = [
  { icon: 'document-text-outline', title: 'Smart Multi-Format Parsing', desc: 'PDF, DOCX, PPTX, Excel, CSV, Markdown, TXT, and Jupyter Notebooks.' },
  { icon: 'lock-closed-outline', title: 'Zero Cloud Leakage', desc: 'All processing runs locally on your machine. No data leaves your device.' },
  { icon: 'shield-checkmark-outline', title: 'Secure OTP Authentication', desc: 'Two-step email verification, timed OTP, and JWT-based multi-tenant isolation.' },
  { icon: 'cube-outline', title: 'Isolated RAG Pipelines', desc: 'Each session has its own isolated vector store. No cross-session contamination.' },
  { icon: 'flash-outline', title: 'Instant Answers', desc: 'Ask natural language questions and get precise, cited answers powered by Gemma2.' },
  { icon: 'git-network-outline', title: 'Citation Tracking', desc: 'Every AI response includes traceable source citations back to the exact sections.' },
];

export default function LandingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgPrimary} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <LinearGradient
              colors={colors.brandGradientBlue}
              style={styles.logoIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="shield-checkmark" size={24} color="white" />
            </LinearGradient>
            <Text style={styles.logoText}>
              Docu<Text style={styles.logoAccent}>Mind</Text>
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginBtnText}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.ctaBtnText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.badge}>
            <Ionicons name="terminal" size={13} color={colors.brandSecondary} />
            <Text style={styles.badgeText}>Next-Generation Document Intelligence</Text>
          </View>

          <Text style={styles.heroTitle}>
            Analyze Complex{'\n'}Documents{'\n'}
            <Text style={styles.heroHighlight}>Completely Offline</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Instantly parse, query, and extract intelligence from your documents
            using local AI. No API leaks. No cloud dependencies. Your data stays yours.
          </Text>

          <View style={styles.heroActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Signup')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={colors.brandGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.heroCta}
              >
                <Text style={styles.heroCtaText}>Start for Free</Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroSecondary}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.heroSecondaryText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsBar}>
          {[
            { num: '9+', label: 'File Formats' },
            { num: '25MB', label: 'Max Document' },
            { num: '∞', label: 'Chat Sessions' },
          ].map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statNum}>{stat.num}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why DocuMind?</Text>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={styles.featureIconWrap}>
                <Ionicons name={f.icon} size={22} color={colors.brandAccent} />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Engineered for zero-compromise local AI document intelligence.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { paddingBottom: 60 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 19, fontWeight: '800', color: colors.textPrimary },
  logoAccent: { color: colors.brandSecondary },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loginBtn: { paddingVertical: 8, paddingHorizontal: 14 },
  loginBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  ctaBtn: {
    backgroundColor: colors.brandPrimary,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  ctaBtnText: { color: 'white', fontSize: 14, fontWeight: '700' },

  // Hero
  heroSection: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40, alignItems: 'center' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(124,58,237,0.12)', borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)', borderRadius: 20,
    paddingVertical: 6, paddingHorizontal: 14, marginBottom: 24,
  },
  badgeText: { color: colors.brandSecondary, fontSize: 12, fontWeight: '700' },
  heroTitle: {
    fontSize: 32, fontWeight: '800', color: colors.textPrimary,
    textAlign: 'center', lineHeight: 40, letterSpacing: -0.03, marginBottom: 16,
  },
  heroHighlight: { color: colors.brandAccent },
  heroSubtitle: {
    color: colors.textMuted, fontSize: 15, textAlign: 'center',
    lineHeight: 22, marginBottom: 28, paddingHorizontal: 8,
  },
  heroActions: { gap: 12, width: '100%', alignItems: 'center' },
  heroCta: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 15, paddingHorizontal: 28, borderRadius: 14,
  },
  heroCtaText: { color: 'white', fontSize: 16, fontWeight: '700' },
  heroSecondary: {
    paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.brandPrimary,
  },
  heroSecondaryText: { color: colors.brandPrimary, fontSize: 15, fontWeight: '700' },

  // Stats
  statsBar: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: colors.bgElevated, borderRadius: 16,
    borderWidth: 1, borderColor: colors.borderDefault,
    paddingVertical: 20, marginHorizontal: 20, marginBottom: 48,
  },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '800', color: colors.brandSecondary },
  statLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600', marginTop: 4 },

  // Features
  featuresSection: { paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 20, fontWeight: '800', color: colors.textPrimary,
    textAlign: 'center', marginBottom: 20,
  },
  featureCard: {
    backgroundColor: colors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: colors.borderDefault,
    padding: 18, marginBottom: 12,
  },
  featureIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(244,63,94,0.1)', alignItems: 'center',
    justifyContent: 'center', marginBottom: 10,
  },
  featureTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  featureDesc: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },

  // Footer
  footer: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 32 },
  footerText: { color: colors.textMuted, fontSize: 12, fontStyle: 'italic' },
});
