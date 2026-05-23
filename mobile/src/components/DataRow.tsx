import { StyleSheet, Text, View } from 'react-native';
import { colors, layout, spacing, typography } from '../theme';

type Props = { label: string; value: string; last?: boolean };

export function DataRow({ label, value, last }: Props) {
  return (
    <View style={[styles.row, !last && styles.border]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.rowHeight,
    paddingVertical: spacing.md,
  },
  border: { borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { ...typography.captionMedium, width: 108 },
  value: { ...typography.bodyStrong, flex: 1, textAlign: 'right' },
});
