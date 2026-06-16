import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing } from '@/theme';
import { Text } from './Text';

type ToastTone = 'success' | 'error' | 'info';

interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | undefined>(undefined);

const TONE_STYLES: Record<ToastTone, { bg: string; fg: string }> = {
  success: { bg: colors.success, fg: colors.successForeground },
  error: { bg: colors.destructive, fg: colors.destructiveForeground },
  info: { bg: colors.card, fg: colors.foreground },
};

const VISIBLE_MS = 3200;

function ToastView({
  toast,
  onDismiss,
}: {
  toast: ToastState;
  onDismiss: () => void;
}) {
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;
  const tone = TONE_STYLES[toast.tone];

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 80,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onDismiss();
      });
    }, VISIBLE_MS);

    return () => clearTimeout(timer);
    // Re-run when the toast identity changes.
  }, [anim, onDismiss, toast.id]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-24, 0],
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        { top: insets.top + spacing.sm, opacity: anim, transform: [{ translateY }] },
      ]}
    >
      <Pressable
        onPress={onDismiss}
        style={[
          styles.toast,
          shadow.lg,
          {
            backgroundColor: tone.bg,
            borderColor: toast.tone === 'info' ? colors.border : 'transparent',
          },
        ]}
      >
        <Text
          variant="bodyStrong"
          style={[styles.message, { color: tone.fg }]}
          numberOfLines={3}
        >
          {toast.message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const idRef = useRef(0);

  const show = useCallback((message: string, tone: ToastTone) => {
    idRef.current += 1;
    setToast({ id: idRef.current, message, tone });
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => show(message, 'success'),
      error: (message) => show(message, 'error'),
      info: (message) => show(message, 'info'),
    }),
    [show],
  );

  const dismiss = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Rendered above the navigator; keyed so a new toast restarts animation. */}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        {toast ? (
          <ToastView key={toast.id} toast={toast} onDismiss={dismiss} />
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    alignItems: 'center',
  },
  toast: {
    alignSelf: 'stretch',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  message: {
    textAlign: 'center',
  },
});
