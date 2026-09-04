import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import colors from '../../theme/colors';

export default function LoadingOverlay({ visible, message = 'Loading…', transparent = true }) {
  if (!visible) return null;

  if (transparent) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <ActivityIndicator size="large" color={colors.brandPrimary} />
            {message && <Text style={styles.message}>{message}</Text>}
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size="large" color={colors.brandPrimary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    minWidth: 160,
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});
