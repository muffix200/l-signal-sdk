import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import type { InAppMessage, InAppButton } from './types';
import { trackInAppEvent } from './tracker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RendererProps {
  message: InAppMessage;
  onDismiss: () => void;
  onButtonPress: (button: InAppButton) => void;
}

// ── Modal ──────────────────────────────────────────────────────────────────

function ModalRenderer({ message, onDismiss, onButtonPress }: RendererProps) {
  const { content } = message;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            content.background_color
              ? { backgroundColor: content.background_color }
              : undefined,
          ]}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {content.image_url ? (
            <Image
              source={{ uri: content.image_url }}
              style={styles.modalImage}
              resizeMode="cover"
            />
          ) : null}

          <View style={styles.modalBody}>
            {content.title ? (
              <Text style={styles.title}>{content.title}</Text>
            ) : null}
            {content.body ? (
              <Text style={styles.body}>{content.body}</Text>
            ) : null}

            {(content.buttons ?? []).length > 0 ? (
              <View style={styles.buttonRow}>
                {content.buttons!.map(btn => (
                  <TouchableOpacity
                    key={btn.id}
                    style={[
                      styles.button,
                      btn.style === 'secondary' && styles.buttonSecondary,
                      btn.style === 'destructive' && styles.buttonDestructive,
                    ]}
                    onPress={() => onButtonPress(btn)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        btn.style === 'secondary' && styles.buttonTextSecondary,
                        btn.style === 'destructive' && styles.buttonTextDestructive,
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Banner ─────────────────────────────────────────────────────────────────

function BannerRenderer({ message, onDismiss, onButtonPress }: RendererProps) {
  const translateY = React.useRef(new Animated.Value(-120)).current;
  const { content } = message;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  }, [translateY]);

  const dismiss = () => {
    Animated.timing(translateY, {
      toValue: -120,
      duration: 250,
      useNativeDriver: true,
    }).start(onDismiss);
  };

  return (
    <Animated.View
      style={[
        styles.banner,
        { transform: [{ translateY }] },
        content.background_color
          ? { backgroundColor: content.background_color }
          : undefined,
      ]}
    >
      <View style={styles.bannerContent}>
        {content.image_url ? (
          <Image
            source={{ uri: content.image_url }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        ) : null}
        <View style={styles.bannerText}>
          {content.title ? (
            <Text style={styles.titleSm}>{content.title}</Text>
          ) : null}
          {content.body ? (
            <Text style={styles.bodySm} numberOfLines={2}>
              {content.body}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity onPress={dismiss}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {(content.buttons ?? []).length > 0 ? (
        <View style={styles.bannerButtons}>
          {content.buttons!.map(btn => (
            <TouchableOpacity
              key={btn.id}
              style={styles.bannerButton}
              onPress={() => onButtonPress(btn)}
            >
              <Text style={styles.bannerButtonText}>{btn.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </Animated.View>
  );
}

// ── Fullscreen ─────────────────────────────────────────────────────────────

function FullscreenRenderer({ message, onDismiss, onButtonPress }: RendererProps) {
  const { content } = message;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onDismiss}>
      <SafeAreaView
        style={[
          styles.fullscreen,
          content.background_color
            ? { backgroundColor: content.background_color }
            : undefined,
        ]}
      >
        <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.fullscreenBody}>
          {content.image_url ? (
            <Image
              source={{ uri: content.image_url }}
              style={styles.fullscreenImage}
              resizeMode="cover"
            />
          ) : null}

          {content.title ? (
            <Text style={[styles.title, styles.fullscreenTitle]}>
              {content.title}
            </Text>
          ) : null}
          {content.body ? (
            <Text style={styles.body}>{content.body}</Text>
          ) : null}
        </ScrollView>

        {(content.buttons ?? []).length > 0 ? (
          <View style={styles.fullscreenButtons}>
            {content.buttons!.map(btn => (
              <TouchableOpacity
                key={btn.id}
                style={[
                  styles.button,
                  styles.buttonFull,
                  btn.style === 'secondary' && styles.buttonSecondary,
                  btn.style === 'destructive' && styles.buttonDestructive,
                ]}
                onPress={() => onButtonPress(btn)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    btn.style === 'secondary' && styles.buttonTextSecondary,
                  ]}
                >
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

// ── Root renderer ──────────────────────────────────────────────────────────

interface Props {
  message: InAppMessage;
  onClose: () => void;
  onButtonPress: (button: InAppButton) => void;
}

export function InAppRenderer({ message, onClose, onButtonPress }: Props) {
  useEffect(() => {
    trackInAppEvent(message.id, 'impression');
  }, [message.id]);

  const props: RendererProps = {
    message,
    onDismiss: () => {
      trackInAppEvent(message.id, 'dismiss');
      onClose();
    },
    onButtonPress: btn => {
      trackInAppEvent(message.id, 'click', btn.id);
      onButtonPress(btn);
    },
  };

  switch (message.type) {
    case 'banner':
      return <BannerRenderer {...props} />;
    case 'fullscreen':
      return <FullscreenRenderer {...props} />;
    default:
      return <ModalRenderer {...props} />;
  }
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 200,
  },
  modalBody: {
    padding: 20,
  },

  // Banner
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  bannerText: {
    flex: 1,
  },
  bannerButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingLeft: 56,
  },
  bannerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e54b4d',
  },
  bannerButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Fullscreen
  fullscreen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fullscreenBody: {
    padding: 24,
    paddingTop: 60,
  },
  fullscreenImage: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.4,
    borderRadius: 12,
    marginBottom: 24,
  },
  fullscreenTitle: {
    marginBottom: 12,
  },
  fullscreenButtons: {
    padding: 20,
    gap: 10,
  },

  // Shared
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  titleSm: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  body: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  bodySm: {
    fontSize: 13,
    color: '#475569',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 28,
    backgroundColor: '#e54b4d',
    alignItems: 'center',
  },
  buttonFull: {
    flex: 0,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#e54b4d',
  },
  buttonDestructive: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#e54b4d',
  },
  buttonTextDestructive: {
    color: '#fff',
  },
});

// Silence unused var warning — SCREEN_WIDTH is kept for future use
void SCREEN_WIDTH;
