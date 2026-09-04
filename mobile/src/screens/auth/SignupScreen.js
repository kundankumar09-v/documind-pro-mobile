import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import InputField from '../../components/ui/InputField';
import GradientButton from '../../components/ui/GradientButton';
import OTPInput from '../../components/chat/OTPInput';
import AlertBanner from '../../components/ui/AlertBanner';
import colors from '../../theme/colors';

const OTP_TOTAL_SECONDS = 600;

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SignupScreen({ navigation }) {
  const { login } = useAuth();

  const [step, setStep] = useState('form');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [otp, setOtp] = useState('');
  const [otpRemaining, setOtpRemaining] = useState(OTP_TOTAL_SECONDS);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (step !== 'otp') return;
    setOtpRemaining(OTP_TOTAL_SECONDS);
    const t = setInterval(() => {
      setOtpRemaining(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [step]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const pwStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();
  const pwColors = ['', '#f43f5e', '#f59e0b', '#f59e0b', '#10b981', '#10b981'];
  const pwLabels = ['', 'Weak', 'Fair', 'Fair', 'Strong', 'Very Strong'];

  const handleSignUp = async () => {
    setError('');
    if (!email.trim()) { setError('Email is required.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const data = await authService.signup(email.trim().toLowerCase(), password);
      setSuccess(data.message || 'OTP sent!');
      setTimeout(() => { setSuccess(''); setStep('otp'); setOtp(''); }, 900);
    } catch (err) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (otp.length !== 6) { setError('Enter the complete 6-digit code.'); return; }
    if (otpRemaining <= 0) { setError('Code expired. Request a new one.'); return; }

    setLoading(true);
    try {
      await authService.verifyOtp(email.trim().toLowerCase(), otp);
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(err.message || 'Verification failed.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      await authService.resendOtp(email.trim().toLowerCase());
      setSuccess('New code sent!');
      setOtp('');
      setOtpRemaining(OTP_TOTAL_SECONDS);
      setResendCooldown(30);
    } catch (err) {
      setError(err.message || 'Resend failed.');
    }
  };

  const timerColor = otpRemaining > 120 ? '#a855f7' : otpRemaining > 60 ? '#f59e0b' : '#f43f5e';

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
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => step === 'otp' ? setStep('form') : navigation.goBack()}
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

          {/* Step indicator */}
          <View style={styles.stepsRow}>
            <View style={[styles.stepDot, step === 'form' ? styles.stepActive : styles.stepDone]} />
            <View style={[styles.stepLine, step === 'otp' && styles.stepLineActive]} />
            <View style={[styles.stepDot, step === 'otp' ? styles.stepActive : null]} />
          </View>

          {step === 'form' ? (
            <>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Set up your secure DocuMind workspace</Text>

              <View style={styles.form}>
                <AlertBanner type="error" message={error} />
                <AlertBanner type="success" message={success} />

                <InputField
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="yourname@gmail.com"
                  keyboardType="email-address"
                  icon="mail-outline"
                />

                <InputField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min. 6 characters"
                  secureTextEntry={!showPassword}
                  icon="lock-closed-outline"
                  rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />

                {password.length > 0 && (
                  <View style={styles.strengthWrap}>
                    <View style={styles.strengthBars}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <View
                          key={i}
                          style={[
                            styles.strengthBar,
                            {
                              backgroundColor: i <= pwStrength ? pwColors[pwStrength] : colors.borderSubtle,
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={{ color: pwColors[pwStrength] || colors.textMuted, fontSize: 11 }}>
                      {pwLabels[pwStrength]}
                    </Text>
                  </View>
                )}

                <InputField
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repeat your password"
                  secureTextEntry={!showConfirm}
                  icon="lock-closed-outline"
                  rightIcon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => setShowConfirm(!showConfirm)}
                  error={
                    confirmPassword && confirmPassword !== password
                      ? 'Passwords do not match'
                      : undefined
                  }
                  style={
                    confirmPassword && confirmPassword === password
                      ? { borderColor: 'rgba(16,185,129,0.45)' }
                      : undefined
                  }
                />

                <GradientButton
                  title="Create Account & Send OTP"
                  onPress={handleSignUp}
                  loading={loading}
                  style={styles.submitBtn}
                />
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.footerLink}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit code to{' '}
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{email}</Text>
              </Text>

              {/* Timer ring */}
              <View style={styles.timerWrap}>
                <Text style={[styles.timerText, { color: timerColor }]}>
                  {formatTime(otpRemaining)}
                </Text>
                <Text style={styles.timerLabel}>
                  {otpRemaining <= 0 ? 'Code expired' : 'Code expires in'}
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.otpLabelWrap}>
                  <Text style={styles.otpLabel}>One-Time Password</Text>
                </View>
                <OTPInput value={otp} onChange={setOtp} disabled={loading || otpRemaining <= 0} />

                <AlertBanner type="error" message={error} />
                <AlertBanner type="success" message={success} />

                <GradientButton
                  title="Verify & Activate Account"
                  onPress={handleVerifyOtp}
                  loading={loading}
                  disabled={otp.length < 6 || otpRemaining <= 0}
                  style={styles.submitBtn}
                />
              </View>

              <View style={styles.footerCol}>
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={resendCooldown > 0}
                  style={styles.resendBtn}
                >
                  <Ionicons
                    name="refresh"
                    size={13}
                    color={resendCooldown > 0 ? colors.textMuted : colors.brandSecondary}
                  />
                  <Text style={[
                    styles.resendText,
                    resendCooldown > 0 && { color: colors.textMuted },
                  ]}>
                    {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => { setStep('form'); setError(''); setOtp(''); setSuccess(''); }}
                >
                  <Text style={styles.backToSignup}>
                    ← Back to signup
                  </Text>
                </TouchableOpacity>
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
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  backBtn: { marginBottom: 20, alignSelf: 'flex-start', padding: 4 },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  logoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  logoAccent: { color: colors.brandSecondary },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 0,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.borderDefault,
  },
  stepActive: { backgroundColor: colors.brandSecondary },
  stepDone: { backgroundColor: colors.success },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.borderDefault, marginHorizontal: 8 },
  stepLineActive: { backgroundColor: colors.brandSecondary },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.02,
    marginBottom: 6,
  },
  subtitle: { color: colors.textMuted, fontSize: 15, marginBottom: 24, lineHeight: 21 },
  form: { gap: 4 },
  strengthWrap: { marginBottom: 12, marginTop: -8 },
  strengthBars: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  submitBtn: { marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: colors.textMuted, fontSize: 14 },
  footerLink: { color: colors.brandSecondary, fontSize: 14, fontWeight: '700' },
  timerWrap: { alignItems: 'center', marginBottom: 20, marginTop: 8 },
  timerText: { fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
  timerLabel: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  otpLabelWrap: { alignItems: 'center', marginBottom: 12 },
  otpLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  footerCol: { alignItems: 'center', gap: 14, marginTop: 24 },
  resendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resendText: { color: colors.brandSecondary, fontSize: 13, fontWeight: '700' },
  backToSignup: { color: colors.textMuted, fontSize: 13 },
});
