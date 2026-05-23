import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, layout, radius, shadow, spacing, typography } from '../theme';

const CONTACTS = [
  {
    icon: 'mail-outline' as const,
    label: 'Email',
    value: 'support@resume-analyzer.com',
    action: 'mailto:support@resume-analyzer.com',
  },
  {
    icon: 'chatbubble-outline' as const,
    label: 'Feedback',
    value: 'Share ideas in the Feedback tab',
    action: undefined,
  },
];

export function ContactSection() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Need help?</Text>
      <Text style={styles.sub}>
        Questions about your analysis or the app? We are here to help.
      </Text>
      {CONTACTS.map((item) => (
        <Pressable
          key={item.label}
          style={styles.row}
          onPress={() => item.action && Linking.openURL(item.action)}
        >
          <View style={styles.iconWrap}>
            <Ionicons name={item.icon} size={20} color={colors.accent} />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: layout.sectionGap,
    ...shadow.card,
  },
  title: { ...typography.heading, fontSize: 18, marginBottom: spacing.sm },
  sub: { ...typography.body, marginBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.lg,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1 },
  label: { ...typography.captionMedium },
  value: { ...typography.bodyStrong, marginTop: spacing.xs },
});
