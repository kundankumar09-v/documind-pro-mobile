import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';

const ICON_MAP = {
  error: 'close-circle',
  success: 'checkmark-circle',
  warning: 'warning',
  info: 'information-circle',
};

const COLOR_MAP = {
  error: { bg: colors.errorBg, border: colors.errorBorder, text: colors.error, icon: colors.error },
  success: { bg: colors.successBg, border: colors.successBorder, text: colors.success, icon: colors.success },
  warning: { bg: colors.warningBg, border: colors.warningBorder, text: colors.warning, icon: colors.warning },
  info: { bg: colors.infoBg, border: 'rgba(6,182,212,0.3)', text: '#06b6d4', icon: '#06b6d4' },
};

export default function AlertBanner({ type = 'error', message, onDismiss, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const palette = COLOR_MAP[type] || COLOR_MAP.error;

  useEffect(() => {
    if (message) {
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true }).start();
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [message]);

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor: palette.bg, borderColor: palette.border, opacity },
        style,
      ]}
    >
      <Ionicons name={ICON_MAP[type] || 'alert-circle'} size={16} color={palette.icon} />
      <Text style={[styles.text, { color: palette.text }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  text: { fontSize: 13, fontWeight: '500', flex: 1 },
});
