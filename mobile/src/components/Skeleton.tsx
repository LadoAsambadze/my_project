import { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius } from '@/theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  circle?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Animated pulse placeholder shown while content loads. */
export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius,
  circle = false,
  style,
}: SkeletonProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.85],
  });

  const resolvedRadius = circle
    ? typeof height === 'number'
      ? height / 2
      : radius.full
    : borderRadius ?? radius.sm;

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius: resolvedRadius, opacity },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.muted,
  },
});
