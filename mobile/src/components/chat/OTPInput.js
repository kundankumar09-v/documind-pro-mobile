import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import colors from '../../theme/colors';

export default function OTPInput({ value = '', onChange, disabled = false, length = 6 }) {
  const inputs = useRef([]);

  useEffect(() => {
    if (!disabled) inputs.current[0]?.focus();
  }, []);

  const handleChange = (text, idx) => {
    const digit = text.replace(/\D/g, '');
    const chars = value.split('');
    chars[idx] = digit.slice(-1);
    const next = chars.join('');
    onChange(next);
    if (digit && idx < length - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace' && !value[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent.key === 'ArrowLeft' && idx > 0) inputs.current[idx - 1]?.focus();
    if (e.nativeEvent.key === 'ArrowRight' && idx < length - 1) inputs.current[idx + 1]?.focus();
  };

  return (
    <View style={styles.row}>
      {Array(length).fill('').map((_, idx) => (
        <TextInput
          key={idx}
          ref={(el) => (inputs.current[idx] = el)}
          value={value[idx] || ''}
          onChangeText={(t) => handleChange(t, idx)}
          onKeyPress={(e) => {
            handleKeyDown(e, idx);
            handleKeyPress(e, idx);
          }}
          keyboardType="numeric"
          maxLength={1}
          editable={!disabled}
          selectTextOnFocus
          style={[styles.box, value[idx] ? styles.boxFilled : null]}
          selectionColor={colors.brandPrimary}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  box: {
    width: 44,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    ...(Platform.OS === 'ios' ? {} : {}),
  },
  boxFilled: {
    borderColor: colors.brandPrimary,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
  },
});
