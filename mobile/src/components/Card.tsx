import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, layout, radius, shadow } from '../theme';

type Props = { children: ReactNode; style?: ViewStyle; noPadding?: boolean };

export function Card({ children, style, noPadding }: Props) {
  return (
    <View style={[styles.card, noPadding && styles.noPad, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: layout.cardPadding,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  noPad: { padding: 0 },
});
