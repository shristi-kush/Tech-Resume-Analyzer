import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

type Tone = 'neutral' | 'success' | 'warning' | 'accent';

const toneText: Record<Tone, string> = {
  neutral: colors.textSecondary,
  success: colors.success,
  warning: colors.warning,
  accent: colors.accent,
};

type Props = { label: string; tone?: Tone };

export function StatusPill({ label, tone = 'neutral' }: Props) {
  return (
    <View style={styles.pill}>
      <Text style={[styles.text, { color: toneText[tone] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: { ...typography.captionBold },
});
