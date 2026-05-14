import { Colors, ThemeType } from '@/theme';
import { useEffect } from 'react';
import { DimensionValue } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

interface SkeletonProps {
  width: DimensionValue;
  height: DimensionValue;
  borderRadius?: number;
  theme: ThemeType;
}

export default function Skeleton({ width, height, borderRadius = 8, theme }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withSequence(withTiming(0.7, { duration: 800 }), withTiming(0.3, { duration: 800 })), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width,
          height,
          borderRadius,
          backgroundColor: Colors[theme].border,
        },
      ]}
    />
  );
}
