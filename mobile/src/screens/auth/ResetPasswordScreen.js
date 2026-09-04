import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import InputField from '../../components/ui/InputField';
import GradientButton from '../../components/ui/GradientButton';
import AlertBanner from '../../components/ui/AlertBanner';
import colors from '../../theme/colors';

export default function ResetPasswordScreen({ route, navigation }) {
  const token = route.params?.token;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.invalidWrap}>
          <Text style={styles.invalidTitle}>Invalid Link</Text>
          <Text style={styles.invalidText}>This reset link is missing or invalid.</Text>
          <GradientButton
            title="Request a New Link"
            onPress={() => navigation.navigate('ForgotPassword')}
            style={{ marginTop: 20 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    setError('');
    if (!password) { setError('Password is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigation.navigate('Login'), 3000);
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
          {success ? (
            <View style={styles.successWrap}>
              <Ionicons name="checkmark-circle" size={56} color={colors.success} />
              <Text style={styles.successTitle}>Password Reset!</Text>
              <Text style={styles.successText}>
                Your password has been changed successfully. Redirecting to login…
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.logoWrap}>
                <View style={styles.logoIcon}>
                  <Ionicons name="key" size={26} color={colors.brandAccent} />
                </View>
              </View>

              <Text style={styles.title}>Set New Password</Text>
              <Text style={styles.subtitle}>Enter your new password below</Text>

              <View style={styles.form}>
                <AlertBanner type="error" message={error} />

                <InputField
                  label="New Password"
                  value={password}
                  onChangeText={(v) => { setPassword(v); setError(''); }}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  icon="lock-closed-outline"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />

                <GradientButton
                  title="Update Password"
                  onPress={handleSubmit}
                  loading={loading}
                  style={styles.submitBtn}
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },
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
  invalidWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
  },
  invalidTitle: { fontSize: 22, fontWeight: '800', color: colors.brandAccent, marginBottom: 8 },
  invalidText: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
  successWrap: { alignItems: 'center', paddingVertical: 48 },
  successTitle: { fontSize: 22, fontWeight: '800', color: colors.success, marginTop: 16, marginBottom: 8 },
  successText: {
    color: colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20,
  },
});
