import { StyleSheet, Text, View } from 'react-native';
import { colors, layout, spacing, typography } from '../theme';
import { FeedCard } from './FeedCard';

export type ChartItem = { label: string; value: number };

type Props = {
  title: string;
  items: ChartItem[];
};

export function AdminBarChart({ title, items }: Props) {
  if (!items.length) {
    return (
      <FeedCard title={title} accent="admin">
        <Text style={styles.empty}>No data yet</Text>
      </FeedCard>
    );
  }

  const sorted = [...items].sort((a, b) => b.value - a.value);
  const max = Math.max(...sorted.map((i) => i.value), 1);

  return (
    <FeedCard title={title} accent="admin" noPadding>
      <View style={styles.pad}>
        {sorted.map((item) => (
          <View key={`${title}-${item.label}`} style={styles.row}>
            <Text style={styles.label} numberOfLines={2}>
              {item.label}
            </Text>
            <View style={styles.barCol}>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${(item.value / max) * 100}%` }]} />
              </View>
            </View>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
      </View>
    </FeedCard>
  );
}

const styles = StyleSheet.create({
  pad: { padding: layout.cardPadding, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { ...typography.captionMedium, width: 88, color: colors.textSecondary },
  barCol: { flex: 1 },
  track: {
    height: 10,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 999,
  },
  value: { ...typography.captionBold, width: 28, textAlign: 'right' },
  empty: { ...typography.body },
});
