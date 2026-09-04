import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import MarkdownRenderer from './MarkdownRenderer';
import colors from '../../theme/colors';

export default function MessageBubble({ message, isLast }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message.text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <Text style={[styles.label, isUser ? styles.labelUser : styles.labelAssistant]}>
        {isUser ? 'You' : 'DocuMind'}
      </Text>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {isUser ? (
          <Text style={styles.userText}>{message.text}</Text>
        ) : (
          <MarkdownRenderer text={message.text} />
        )}

        {/* Streaming cursor */}
        {message.streaming && (
          <View style={styles.cursor} />
        )}

        {/* Copy button */}
        {!isUser && !message.streaming && message.text ? (
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.7}>
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={12}
              color={copied ? colors.success : colors.textMuted}
            />
            <Text style={[styles.copyText, copied && { color: colors.success }]}>
              {copied ? 'Copied' : 'Copy'}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Citations */}
        {message.citations?.length > 0 && !message.streaming && (
          <View style={styles.citationsWrap}>
            {message.citations.map((c, i) => (
              <View key={i} style={styles.citationPill}>
                <Text style={styles.citationText}>{c}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 12, paddingHorizontal: 16 },
  rowUser: { alignItems: 'flex-end' },
  rowAssistant: { alignItems: 'flex-start' },
  label: { fontSize: 11, fontWeight: '600', marginBottom: 4, letterSpacing: 0.03 },
  labelUser: { color: colors.brandAccent, marginRight: 4 },
  labelAssistant: { color: colors.brandSecondary, marginLeft: 4 },
  bubble: {
    maxWidth: '88%',
    borderRadius: 16,
    padding: 12,
    position: 'relative',
  },
  bubbleUser: {
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.25)',
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderBottomLeftRadius: 4,
  },
  userText: { color: colors.textPrimary, fontSize: 15, lineHeight: 22 },
  cursor: {
    width: 2,
    height: 16,
    backgroundColor: colors.brandAccent,
    borderRadius: 1,
    marginLeft: 2,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  copyText: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  citationsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  citationPill: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  citationText: { color: colors.brandSecondary, fontSize: 10, fontWeight: '600' },
});
