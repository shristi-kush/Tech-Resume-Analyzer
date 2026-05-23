import { StyleSheet, Text, View } from 'react-native';
import { layout, spacing, typography } from '../theme';

type Props = { title: string; subtitle?: string };

export function SectionHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg, marginTop: spacing.sm },
  title: typography.title,
  sub: { ...typography.body, marginTop: spacing.sm },
});
