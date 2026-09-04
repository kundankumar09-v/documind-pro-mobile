import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import authService from '../../services/authService';
import InputField from '../../components/ui/InputField';
import GradientButton from '../../components/ui/GradientButton';
import AlertBanner from '../../components/ui/AlertBanner';
import colors from '../../theme/colors';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim()) { setError('Email is required.'); return; }

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgPrimary} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {!submitted ? (
            <>
              <View style={styles.logoWrap}>
                <View style={styles.logoIcon}>
                  <Ionicons name="shield-checkmark" size={26} color={colors.brandAccent} />
                </View>
              </View>

              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>Enter your email to receive a secure reset link</Text>

              <View style={styles.form}>
                <AlertBanner type="error" message={error} />

                <InputField
                  label="Email Address"
                  value={email}
                  onChangeText={(v) => { setEmail(v); setError(''); }}
                  placeholder="name@company.com"
                  keyboardType="email-address"
                  icon="mail-outline"
                />

                <GradientButton
                  title="Send Reset Instructions"
                  onPress={handleSubmit}
                  loading={loading}
                  style={styles.submitBtn}
                />
              </View>
            </>
          ) : (
            <View style={styles.successWrap}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={48} color={colors.success} />
              </View>
              <Text style={styles.successTitle}>Instructions Sent</Text>
              <Text style={styles.successText}>
                If that email is registered, a password reset link will arrive in your inbox shortly.
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLinkText}>← Back to Sign In</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  backBtn: { marginBottom: 20, alignSelf: 'flex-start', padding: 4 },
  logoWrap: { alignItems: 'center', marginBottom: 20 },
  logoIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(244,63,94,0.1)',
    borderWidth: 1, borderColor: 'rgba(244,63,94,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontSize: 28, fontWeight: '800', color: colors.textPrimary, textAlign: 'center',
    letterSpacing: -0.02, marginBottom: 6,
  },
  subtitle: {
    color: colors.textMuted, fontSize: 15, textAlign: 'center', marginBottom: 28, lineHeight: 21,
  },
  form: { gap: 4 },
  submitBtn: { marginTop: 8 },
  successWrap: { alignItems: 'center', paddingVertical: 24 },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 },
  successText: {
    color: colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20,
  },
  footerLink: { alignItems: 'center', marginTop: 32 },
  footerLinkText: { color: colors.brandSecondary, fontSize: 14, fontWeight: '600' },
});
