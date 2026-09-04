import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/ui/InputField';
import GradientButton from '../../components/ui/GradientButton';
import AlertBanner from '../../components/ui/AlertBanner';
import colors from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
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
          {/* Back to Landing */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate('Landing')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoWrap}>
            <LinearGradient
              colors={colors.brandGradientBlue}
              style={styles.logoIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="shield-checkmark" size={22} color="white" />
            </LinearGradient>
            <Text style={styles.logoText}>
              Docu<Text style={styles.logoAccent}>Mind</Text>
            </Text>
          </View>

          {/* Header */}
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue to your workspace</Text>

          {/* Form */}
          <View style={styles.form}>
            <AlertBanner type="error" message={error} />

            <InputField
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="yourname@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
              returnKeyType="next"
            />

            <InputField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              icon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotRow}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <GradientButton
              title="Sign In to Workspace"
              onPress={handleLogin}
              loading={loading}
              style={styles.submitBtn}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>New to DocuMind? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>Create an account</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.securityNote}>
            🔒 Your session is secured with JWT. Documents never leave your machine.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backBtn: { marginBottom: 20, alignSelf: 'flex-start', padding: 4 },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  logoAccent: { color: colors.brandSecondary },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.02,
    marginBottom: 6,
  },
  subtitle: { color: colors.textMuted, fontSize: 15, marginBottom: 28, lineHeight: 21 },
  form: { gap: 4 },
  forgotRow: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -4 },
  forgotText: { color: colors.brandSecondary, fontSize: 13, fontWeight: '600' },
  submitBtn: { marginTop: 4 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: { color: colors.textMuted, fontSize: 14 },
  footerLink: { color: colors.brandSecondary, fontSize: 14, fontWeight: '700' },
  securityNote: {
    color: colors.textMuted,
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 17,
  },
});
