import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';
import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  /** Optional helper text shown below the field when there is no error. */
  helper?: string;
  /** Optional character counter target; renders `current/limit` in the label row. */
  counterMax?: number;
}

export function Input({
  label,
  error,
  helper,
  counterMax,
  multiline,
  numberOfLines,
  value,
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const count = typeof value === 'string' ? value.length : 0;

  return (
    <View style={styles.wrap}>
      {label || counterMax ? (
        <View style={styles.labelRow}>
          {label ? (
            <Text variant="label" tone="muted" style={styles.label}>
              {label}
            </Text>
          ) : (
            <View />
          )}
          {counterMax ? (
            <Text
              variant="caption"
              tone={count > counterMax ? 'danger' : 'muted'}
            >
              {count}/{counterMax}
            </Text>
          ) : null}
        </View>
      ) : null}
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        value={value}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[
          styles.input,
          multiline && styles.multiline,
          focused && styles.inputFocused,
          !!error && styles.inputError,
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text variant="caption" tone="danger" style={styles.helper}>
          {error}
        </Text>
      ) : helper ? (
        <Text variant="caption" tone="muted" style={styles.helper}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

// Back-compat alias: early screens import `Field`.
export const Field = Input;

/** Multiline variant of Input with a comfortable default height. */
export function Textarea({ numberOfLines = 4, ...props }: InputProps) {
  return <Input multiline numberOfLines={numberOfLines} {...props} />;
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {},
  input: {
    backgroundColor: colors.card,
    borderColor: colors.input,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.foreground,
    fontSize: typography.fontSize.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    minHeight: 52,
  },
  multiline: {
    minHeight: 112,
    paddingTop: spacing.sm + 4,
  },
  inputFocused: {
    borderColor: colors.ring,
  },
  inputError: {
    borderColor: colors.destructive,
  },
  helper: {
    marginTop: spacing.xs,
  },
});
