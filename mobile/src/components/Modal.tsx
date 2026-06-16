import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Stop taps inside the sheet from closing it. */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          {title ? (
            <Text variant="heading" style={styles.title}>
              {title}
            </Text>
          ) : null}
          <View>{children}</View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.md,
  },
});
