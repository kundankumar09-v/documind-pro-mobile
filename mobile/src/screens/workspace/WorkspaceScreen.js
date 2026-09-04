import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar, Animated, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';
import documentService from '../../services/documentService';
import MessageBubble from '../../components/chat/MessageBubble';
import SummaryCard from '../../components/chat/SummaryCard';
import FileBadge from '../../components/chat/FileBadge';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import EmptyState from '../../components/ui/EmptyState';
import colors from '../../theme/colors';
import {
  loadSessions, saveSessions, createDefaultSession,
} from '../../utils/sessionStorage';
import { SUPPORTED_EXTENSIONS } from '../../utils/formatUtils';

export default function WorkspaceScreen() {
  const { user, logout } = useAuth();
  const username = user?.email?.split('@')[0] || 'user';

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveId] = useState(null);
  const [question, setQuestion] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [backendOk, setBackendOk] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const messagesRef = useRef(null);
  const chatEndRef = useRef(null);
  const drawerAnim = useRef(new Animated.Value(-300)).current;

  /* ── Load sessions from AsyncStorage ── */
  useEffect(() => {
    (async () => {
      const saved = await loadSessions(username);
      if (saved && saved.length > 0) {
        const restored = saved.map(s => ({ ...s, files: s.files || [] }));
        setSessions(restored);
        setActiveId(restored[0].id);
      } else {
        const def = createDefaultSession();
        setSessions([def]);
        setActiveId(def.id);
        await saveSessions(username, [def]);
      }
    })();
  }, [username]);

  /* ── Backend health ── */
  useEffect(() => {
    documentService.healthCheck()
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false));
  }, []);

  /* ── Drawer animation ── */
  const toggleDrawer = useCallback(() => {
    const toValue = drawerOpen ? -300 : 0;
    Animated.spring(drawerAnim, { toValue, useNativeDriver: true, tension: 65, friction: 11 }).start();
    setDrawerOpen(!drawerOpen);
  }, [drawerOpen]);

  const activeSession = useMemo(
    () => sessions.find(s => s.id === activeSessionId) || { id: '', title: '', history: [], files: [] },
    [sessions, activeSessionId]
  );
  const activeFiles = activeSession.files || [];

  const summaryMap = useMemo(() => {
    const map = {};
    sessions.forEach(s => {
      if (s.summary) map[s.id] = s.summary;
    });
    return map;
  }, [sessions]);
  const activeSummary = summaryMap[activeSessionId];

  /* ── Persistence helper ── */
  const persist = useCallback(async (updated) => {
    setSessions(updated);
    await saveSessions(username, updated);
  }, [username]);

  /* ── New chat ── */
  const handleNewChat = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const blank = sessions.find(s => s.history.length === 0 && s.files.length === 0);
    if (blank) {
      setActiveId(blank.id);
      toggleDrawer();
      return;
    }
    const def = createDefaultSession();
    persist([def, ...sessions]);
    setActiveId(def.id);
    toggleDrawer();
  }, [sessions, persist, toggleDrawer]);

  /* ── Delete session ── */
  const handleDeleteSession = useCallback((id) => {
    Alert.alert('Delete Session', 'This will permanently delete this chat.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          documentService.deleteSessionVectors(id);
          const rest = sessions.filter(s => s.id !== id);
          if (rest.length === 0) {
            const def = createDefaultSession();
            persist([def]);
            setActiveId(def.id);
          } else {
            persist(rest);
            if (activeSessionId === id) setActiveId(rest[0].id);
          }
        },
      },
    ]);
  }, [sessions, activeSessionId, persist]);

  /* ── Rename session ── */
  const handleRenameSession = useCallback((id) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;

    Alert.prompt(
      'Rename Session',
      'Enter a new name for this chat:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rename',
          onPress: (newTitle) => {
            const trimmed = newTitle?.trim();
            if (trimmed && trimmed !== session.title) {
              const updated = sessions.map(s => s.id === id ? { ...s, title: trimmed } : s);
              persist(updated);
            }
          },
        },
      ],
      'plain-text',
      session.title
    );
  }, [sessions, persist]);

  /* ── Select session ── */
  const handleSelectSession = useCallback((id) => {
    setActiveId(id);
    toggleDrawer();
  }, [toggleDrawer]);

  /* ── File upload ── */
  const handleUpload = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        Alert.alert('Unsupported Format', `File type .${ext} is not supported.`);
        return;
      }

      setUploading(true);
      const data = await documentService.uploadDocument(
        { uri: file.uri, name: file.name, mimeType: file.mimeType },
        activeSessionId
      );

      if (data) {
        const updated = sessions.map(s => {
          if (s.id !== activeSessionId) return s;
          const newFiles = [...new Set([...(s.files || []), file.name])];
          const newSummary = data.summary ? {
            filename: data.filename,
            summary: data.summary,
            pages: data.page_count,
            chunks: data.indexed_chunks,
            file_type: data.file_type,
          } : s.summary;
          return { ...s, files: newFiles, summary: newSummary };
        });
        await persist(updated);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      Alert.alert('Upload Failed', err.message || 'Could not upload the document.');
    } finally {
      setUploading(false);
    }
  }, [activeSessionId, sessions, persist]);

  /* ── Chat submit ── */
  const handleSend = useCallback(async () => {
    const text = question.trim();
    if (!text || streaming) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuestion('');
    setStreaming(true);

    const userMsg = { role: 'user', text };
    const aiPlaceholder = { role: 'assistant', text: '', citations: [], streaming: true };

    const historyForApi = activeSession.history.slice(-6).map(m => ({ role: m.role, text: m.text }));

    // Add user msg + AI placeholder
    const withUserMsg = sessions.map(s => {
      if (s.id !== activeSessionId) return s;
      const title = s.title === 'New Chat'
        ? (text.length > 26 ? text.slice(0, 26) + '…' : text)
        : s.title;
      return { ...s, title, history: [...s.history, userMsg, aiPlaceholder] };
    });
    await persist(withUserMsg);

    await chatService.streamMessage(text, activeSessionId, historyForApi, {
      onToken: (content) => {
        setSessions(prev => prev.map(s => {
          if (s.id !== activeSessionId) return s;
          const history = [...s.history];
          const last = history[history.length - 1];
          if (last?.streaming) {
            history[history.length - 1] = { ...last, text: last.text + content };
          }
          return { ...s, history };
        }));
      },
      onMeta: (event) => {
        const citations = event.citations || [];
        setSessions(prev => prev.map(s => {
          if (s.id !== activeSessionId) return s;
          const history = [...s.history];
          const last = history[history.length - 1];
          if (last?.streaming) {
            history[history.length - 1] = { ...last, citations };
          }
          return { ...s, history };
        }));
      },
      onDone: (event) => {
        setSessions(prev => prev.map(s => {
          if (s.id !== activeSessionId) return s;
          const history = [...s.history];
          const last = history[history.length - 1];
          if (last?.streaming) {
            const finalText = event.type === 'error'
              ? `⚠️ Stream error: ${event.message}`
              : last.text;
            history[history.length - 1] = { ...last, text: finalText, streaming: false };
          }
          return { ...s, history };
        }));
        setStreaming(false);
      },
      onError: () => {
        setSessions(prev => prev.map(s => {
          if (s.id !== activeSessionId) return s;
          const history = [...s.history];
          const last = history[history.length - 1];
          if (last?.streaming) {
            history[history.length - 1] = {
              ...last,
              text: '⚠️ Could not reach backend. Make sure the FastAPI server is running.',
              citations: [],
              streaming: false,
            };
          }
          return { ...s, history };
        }));
        setStreaming(false);
      },
    });
  }, [question, streaming, activeSessionId, activeSession, sessions, persist]);

  /* ── Scroll to bottom ── */
  useEffect(() => {
    if (chatEndRef.current && messagesRef.current) {
      messagesRef.current.scrollToEnd({ animated: true });
    }
  }, [activeSession.history?.length, streaming]);

  /* ── Session list (for drawer) ── */
  const renderSessionItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[styles.drawerItem, item.id === activeSessionId && styles.drawerItemActive]}
      onPress={() => handleSelectSession(item.id)}
      onLongPress={() => handleRenameSession(item.id)}
      activeOpacity={0.7}
    >
      <Ionicons
        name="chatbubble-ellipses-outline"
        size={14}
        color={item.id === activeSessionId ? colors.brandSecondary : colors.textMuted}
      />
      <Text
        numberOfLines={1}
        style={[styles.drawerItemText, item.id === activeSessionId && styles.drawerItemTextActive]}
      >
        {item.title}
      </Text>
      <View style={styles.drawerItemActions}>
        <TouchableOpacity
          onPress={() => handleRenameSession(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="pencil-outline" size={13} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteSession(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={13} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), [activeSessionId, handleSelectSession, handleDeleteSession]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgPrimary} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}>
            <Ionicons name="menu" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {activeSession.title || 'New Chat'}
          </Text>

          <View style={styles.headerRight}>
            {/* Backend status */}
            {backendOk !== null && (
              <View style={[styles.statusDot, { backgroundColor: backendOk ? colors.success : colors.error }]} />
            )}
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={20} color={colors.brandAccent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── MAIN CONTENT ── */}
        <View style={styles.mainContent}>
          {/* Messages */}
          {activeSession.history.length === 0 ? (
            <EmptyState
              icon="chatbubbles-outline"
              title="Welcome to DocuMind"
              subtitle="Upload a document to this chat, then ask questions about it. Supports PDF, DOCX, Excel, and more."
              style={styles.emptyState}
            >
              {activeSummary && <SummaryCard summary={activeSummary} />}
              <TouchableOpacity style={styles.uploadBtnEmpty} onPress={handleUpload}>
                <Ionicons name="cloud-upload-outline" size={20} color={colors.brandSecondary} />
                <Text style={styles.uploadBtnEmptyText}>Upload Your First Document</Text>
              </TouchableOpacity>
            </EmptyState>
          ) : (
            <FlatList
              ref={messagesRef}
              data={activeSession.history}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item, index }) => (
                <MessageBubble message={item} isLast={index === activeSession.history.length - 1} />
              )}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => chatEndRef.current?.scrollToEnd?.({ animated: true })}
              ListHeaderComponent={
                activeSummary ? <SummaryCard summary={activeSummary} compact /> : null
              }
            />
          )}
          <View ref={chatEndRef} />

          {/* ── INPUT AREA ── */}
          <View style={styles.inputArea}>
            {activeFiles.length === 0 && (
              <View style={styles.warningBanner}>
                <Ionicons name="warning" size={14} color={colors.warning} />
                <Text style={styles.warningText}>
                  No document uploaded to this chat yet
                </Text>
              </View>
            )}

            <View style={styles.inputRow}>
              <TouchableOpacity style={styles.attachBtn} onPress={handleUpload} disabled={uploading}>
                <Ionicons
                  name={uploading ? 'sync' : 'add-circle-outline'}
                  size={24}
                  color={colors.brandSecondary}
                />
              </TouchableOpacity>

              <TextInput
                style={styles.textInput}
                value={question}
                onChangeText={setQuestion}
                placeholder={
                  activeFiles.length > 0
                    ? `Ask about ${activeFiles.length === 1 ? activeFiles[0] : `${activeFiles.length} documents`}…`
                    : 'Upload a document first…'
                }
                placeholderTextColor={colors.inputPlaceholder}
                editable={!streaming}
                multiline
                maxLength={2000}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />

              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  question.trim() && !streaming ? styles.sendBtnActive : styles.sendBtnInactive,
                ]}
                onPress={handleSend}
                disabled={streaming || !question.trim()}
              >
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color={question.trim() && !streaming ? 'white' : colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {streaming && (
              <View style={styles.streamingBanner}>
                <View style={styles.streamingDot} />
                <Text style={styles.streamingText}>DocuMind is generating a response…</Text>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ── DRAWER OVERLAY ── */}
      {drawerOpen && (
        <TouchableOpacity
          style={styles.drawerOverlay}
          activeOpacity={1}
          onPress={toggleDrawer}
        />
      )}

      {/* ── DRAWER ── */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>
        <View style={styles.drawerHeader}>
          <View style={styles.drawerLogoWrap}>
            <LinearGradient
              colors={colors.brandGradientBlue}
              style={styles.drawerLogo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="shield-checkmark" size={18} color="white" />
            </LinearGradient>
            <Text style={styles.drawerLogoText}>
              Docu<Text style={{ color: colors.brandSecondary }}>Mind</Text>
            </Text>
          </View>
          <TouchableOpacity onPress={toggleDrawer}>
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.newChatBtn} onPress={handleNewChat}>
          <Ionicons name="add" size={18} color={colors.brandSecondary} />
          <Text style={styles.newChatBtnText}>New Chat</Text>
        </TouchableOpacity>

        <Text style={styles.drawerSectionLabel}>Chat History</Text>

        <FlatList
          data={sessions}
          keyExtractor={item => item.id}
          renderItem={renderSessionItem}
          style={styles.drawerList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.drawerFooter}>
          <Text style={styles.drawerUser}>@{username}</Text>
          <TouchableOpacity onPress={logout} style={styles.drawerLogout}>
            <Ionicons name="log-out-outline" size={14} color={colors.brandAccent} />
            <Text style={styles.drawerLogoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <LoadingOverlay visible={uploading} message="Indexing document…" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  menuBtn: { padding: 6 },
  headerTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  logoutBtn: { padding: 4 },

  // Main
  mainContent: { flex: 1 },

  // Messages
  messagesContent: { paddingTop: 12, paddingBottom: 8 },

  // Empty state
  emptyState: { flex: 1 },
  uploadBtnEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
    marginTop: 16,
  },
  uploadBtnEmptyText: { color: colors.brandSecondary, fontSize: 14, fontWeight: '700' },

  // Input area
  inputArea: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 8,
  },
  warningText: { color: colors.warning, fontSize: 12, fontWeight: '500' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachBtn: { padding: 6, marginBottom: 4 },
  textInput: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 15,
    maxHeight: 100,
    lineHeight: 20,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendBtnActive: { backgroundColor: colors.brandPrimary },
  sendBtnInactive: { backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.borderDefault },
  streamingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    marginTop: 8,
  },
  streamingDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brandAccent,
  },
  streamingText: { color: colors.textMuted, fontSize: 12 },

  // Drawer overlay
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 90,
  },

  // Drawer
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: colors.bgSecondary,
    borderRightWidth: 1,
    borderRightColor: colors.borderDefault,
    zIndex: 100,
    paddingTop: 50,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  drawerLogoWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  drawerLogo: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  drawerLogoText: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(124,58,237,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
  },
  newChatBtnText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  drawerSectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.07,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  drawerList: { flex: 1, paddingHorizontal: 12 },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 2,
  },
  drawerItemActive: { backgroundColor: 'rgba(124,58,237,0.12)' },
  drawerItemText: { flex: 1, color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  drawerItemTextActive: { color: colors.textPrimary, fontWeight: '600' },
  drawerItemActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerUser: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  drawerLogout: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  drawerLogoutText: { color: colors.brandAccent, fontSize: 12, fontWeight: '700' },
});
