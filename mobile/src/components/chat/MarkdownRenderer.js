import React from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import colors from '../../theme/colors';

const TECH_KW = [
  'Machine Learning', 'Deep Learning', 'Neural Network', 'NLP', 'LLM', 'RAG',
  'Vector', 'Embedding', 'Semantic', 'Retrieval', 'FastAPI', 'Docker', 'Python',
  'JavaScript', 'React', 'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'GCP', 'Azure',
  'Kubernetes', 'REST API', 'GraphQL', 'WebSocket', 'OAuth', 'JWT', 'OCR', 'PDF',
  'RoBERTa', 'BERT', 'GPT', 'Transformer', 'Tokenization', 'API', 'Authentication',
];

function highlightKeywords(text) {
  if (!text) return null;
  const pattern = new RegExp(`\\b(${TECH_KW.join('|')})\\b`, 'gi');
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    if (TECH_KW.some(kw => kw.toLowerCase() === part.toLowerCase())) {
      return (
        <Text key={i} style={styles.highlight}>{part}</Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <Text key={i} style={styles.bold}>{highlightKeywords(inner)}</Text>
      );
    }
    return <Text key={i}>{highlightKeywords(part)}</Text>;
  });
}

function renderLine(line, index) {
  const trimmed = line.trim();
  if (!trimmed) return <View key={index} style={{ height: 8 }} />;

  // Image: ![alt](url)
  const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
  if (imgMatch) {
    return (
      <View key={index} style={styles.imageWrap}>
        <Image
          source={{ uri: imgMatch[2] }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Headers
  if (trimmed.startsWith('### ')) {
    return (
      <Text key={index} style={styles.h4}>
        {renderInline(trimmed.slice(4))}
      </Text>
    );
  }
  if (trimmed.startsWith('## ')) {
    return (
      <Text key={index} style={styles.h3}>
        {renderInline(trimmed.slice(3))}
      </Text>
    );
  }
  if (trimmed.startsWith('# ')) {
    return (
      <Text key={index} style={styles.h2}>
        {renderInline(trimmed.slice(2))}
      </Text>
    );
  }

  // Numbered list
  const numMatch = trimmed.match(/^\d+\.\s(.+)$/);
  if (numMatch) {
    return (
      <View key={index} style={styles.listItem}>
        <Text style={styles.listBullet}>{trimmed.match(/^\d+/)[0]}.</Text>
        <Text style={styles.listText}>{renderInline(numMatch[1])}</Text>
      </View>
    );
  }

  // Bullet list
  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
    return (
      <View key={index} style={styles.listItem}>
        <Text style={styles.listBullet}>•</Text>
        <Text style={styles.listText}>{renderInline(trimmed.slice(2))}</Text>
      </View>
    );
  }

  // Code block
  if (trimmed.startsWith('```')) return null;

  // Normal paragraph
  return (
    <Text key={index} style={styles.paragraph}>
      {renderInline(trimmed)}
    </Text>
  );
}

export default function MarkdownRenderer({ text }) {
  if (!text) return null;

  return (
    <View>
      {text.split('\n').map((line, i) => renderLine(line, i))}
    </View>
  );
}

const styles = StyleSheet.create({
  paragraph: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  highlight: {
    color: colors.brandSecondary,
    fontWeight: '700',
  },
  h2: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.brandPrimary,
    marginTop: 18,
    marginBottom: 12,
  },
  h3: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.brandSecondary,
    marginTop: 16,
    marginBottom: 10,
  },
  h4: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.brandSecondary,
    marginTop: 14,
    marginBottom: 8,
    letterSpacing: 0.02,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 18,
  },
  listBullet: {
    color: colors.brandSecondary,
    fontSize: 14,
    fontWeight: '600',
    width: 16,
  },
  listText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },
  imageWrap: {
    marginVertical: 12,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.bgElevated,
  },
  image: {
    width: '100%',
    height: 200,
    maxHeight: 300,
  },
});
