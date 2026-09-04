import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';

export default function SummaryCard({ summary, compact = false }) {
  if (!summary) return null;

  if (compact) {
    return (
      <View style={styles.compact}>
        <Ionicons name="sparkles" size={12} color={colors.brandSecondary} />
        <Text style={styles.compactLabel} numberOfLines={1}>
          {summary.filename}
        </Text>
        {summary.file_type && (
          <View style={styles.typePill}>
            <Text style={styles.typeText}>{summary.file_type}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={14} color={colors.brandSecondary} />
        <Text style={styles.headerLabel}>
          Auto Summary · {summary.filename}
        </Text>
      </View>
      <Text style={styles.summaryText}>{summary.summary}</Text>
      <View style={styles.metaRow}>
        {summary.pages && (
          <Text style={styles.metaItem}>{summary.pages} page{summary.pages !== 1 ? 's' : ''}</Text>
        )}
        {summary.chunks && (
          <Text style={styles.metaItem}>{summary.chunks} chunks indexed</Text>
        )}
        {summary.file_type && (
          <Text style={[styles.metaItem, { color: colors.brandSecondary }]}>{summary.file_type}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(124, 58, 237, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.14)',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerLabel: {
    color: colors.brandSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.07,
  },
  summaryText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  metaItem: {
    color: colors.textMuted,
    fontSize: 11,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(124, 58, 237, 0.06)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.14)',
  },
  compactLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  typePill: {
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.25)',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  typeText: {
    color: colors.brandSecondary,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
