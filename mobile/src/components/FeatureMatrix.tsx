import { StyleSheet, Text, View } from 'react-native';
import { colors, layout, spacing, typography } from '../theme';

export type MatrixRow = {
  feature: string;
  analyzer: string | boolean;
  manual: string | boolean;
};

type Props = {
  rows: MatrixRow[];
  colApp?: string;
  colSecondary?: string;
};

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return (
      <Text style={[styles.cell, value ? styles.yes : styles.no]}>
        {value ? '✓' : '—'}
      </Text>
    );
  }
  return <Text style={styles.cell}>{value}</Text>;
}

export function FeatureMatrix({ rows, colApp = 'App', colSecondary = 'DIY' }: Props) {
  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.headCell, styles.featureCol]}>Capability</Text>
        <Text style={styles.headCell}>{colApp}</Text>
        <Text style={styles.headCell}>{colSecondary}</Text>
      </View>
      {rows.map((row, i) => (
        <View
          key={row.feature}
          style={[styles.row, i < rows.length - 1 && styles.rowBorder]}
        >
          <Text style={[styles.featureCell, styles.featureCol]} numberOfLines={2}>
            {row.feature}
          </Text>
          <Cell value={row.analyzer} />
          <Cell value={row.manual} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.rowHeight,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    backgroundColor: colors.accentDark,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headCell: {
    flex: 1,
    ...typography.overline,
    fontSize: 10,
    color: colors.textOnImage,
    textAlign: 'center',
  },
  featureCol: { flex: 1.5, textAlign: 'left' },
  featureCell: {
    ...typography.bodyStrong,
    fontSize: 13,
    flex: 1.5,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: colors.textSecondary,
  },
  yes: { ...typography.bodyStrong, color: colors.popGreen, fontSize: 13, textAlign: 'center' as const, flex: 1 },
  no: { color: colors.textMuted },
});
