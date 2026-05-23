import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, layout, radius, spacing, typography } from '../theme';
import { Logo } from './Logo';

const LINKS = [
  { label: 'Privacy', url: 'https://example.com/privacy' },
  { label: 'Terms', url: 'https://example.com/terms' },
  { label: 'Security', url: 'https://example.com/security' },
];

export function EnterpriseFooter() {
  return (
    <View style={styles.wrap}>
      <View style={styles.brandRow}>
        <View style={styles.logoWrap}>
          <Logo size={32} />
        </View>
        <View style={styles.brandText}>
          <Text style={styles.brand}>Tech Resume Analyzer</Text>
          <Text style={styles.tagline}>Your personal tech resume coach</Text>
        </View>
      </View>

      <View style={styles.links}>
        {LINKS.map((link) => (
          <Pressable key={link.label} onPress={() => Linking.openURL(link.url)}>
            <Text style={styles.link}>{link.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.divider} />

      <Text style={styles.meta}>
        © {new Date().getFullYear()} Tech Resume Analyzer
      </Text>
      <Text style={styles.metaSub}>Secure handling · Your data stays private</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  logoWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { flex: 1 },
  brand: { ...typography.heading },
  tagline: { ...typography.caption, marginTop: spacing.xs },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  link: {
    ...typography.bodyStrong,
    color: colors.accent,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  meta: { ...typography.bodyStrong, fontSize: 13 },
  metaSub: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
});
