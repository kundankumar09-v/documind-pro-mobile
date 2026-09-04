import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';

export default function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  hint,
  icon,
  rightIcon,
  onRightIconPress,
  disabled = false,
  autoCapitalize = 'none',
  returnKeyType = 'done',
  onSubmitEditing,
  autoFocus = false,
  style,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputRow,
          focused && styles.inputRowFocused,
          error ? styles.inputRowError : null,
        ]}
      >
        {icon && (
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={16} color={colors.textMuted} />
          </View>
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.inputPlaceholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={!disabled}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          selectionColor={colors.brandPrimary}
        />
        {/* Show toggle for password fields or custom right icon */}
        {(secureTextEntry || rightIcon) && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.eyeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={rightIcon || 'eye-off-outline'}
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.02,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputRowFocused: { borderColor: colors.inputBorderFocus },
  inputRowError: { borderColor: colors.errorBorder },
  iconWrap: { marginRight: 10 },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    paddingVertical: 14,
  },
  eyeBtn: { padding: 4 },
  errorText: { color: colors.error, fontSize: 12, marginTop: 4, fontWeight: '500' },
  hintText: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
});
