import { StyleSheet, Text, View } from 'react-native';
import { colors, layout, radius, spacing, typography } from '../theme';

type Props = { score: number; max?: number };

export function ScoreMetric({ score, max = 100 }: Props) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>Tech resume score</Text>
        <Text style={styles.value}>
          {score}
          <Text style={styles.max}> / {max}</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: layout.cardPadding,
    marginBottom: layout.sectionGap,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  label: { ...typography.captionMedium, textTransform: 'none', letterSpacing: 0 },
  value: typography.metric,
  max: { ...typography.caption },
  track: {
    height: 10,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.full,
  },
});
