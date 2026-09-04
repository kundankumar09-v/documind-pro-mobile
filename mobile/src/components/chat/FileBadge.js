import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getFileExtension, getFileColor, getFileBgColor } from '../../utils/formatUtils';

export default function FileBadge({ filename, compact = false }) {
  const ext = getFileExtension(filename);
  const color = getFileColor(ext);
  const bgColor = getFileBgColor(ext);

  if (compact) {
    return (
      <View style={[styles.compactPill, { backgroundColor: bgColor, borderColor: `${color}40` }]}>
        <Text style={[styles.compactText, { color }]}>{ext}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.pill, { backgroundColor: bgColor, borderColor: `${color}40` }]}>
      <Text style={[styles.text, { color }]}>{ext.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  text: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  compactPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
  },
  compactText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
