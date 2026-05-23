import { Image } from 'expo-image';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Images } from '../assets';
import { colors, layout, radius, spacing, typography } from '../theme';
import { Logo } from './Logo';

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export function AppBanner({ title, subtitle, right }: Props) {
  return (
    <View style={styles.wrap}>
      <Image source={Images.banner} style={styles.banner} contentFit="cover" />
      <View style={styles.overlay} />
      <View style={styles.row}>
        <Logo size={40} />
        <View style={styles.textCol}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: layout.bannerHeight,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: layout.sectionGap,
    borderWidth: 1,
    borderColor: colors.border,
  },
  banner: { ...StyleSheet.absoluteFillObject },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  textCol: { flex: 1 },
  title: { ...typography.heading, color: '#fff', fontSize: 17 },
  sub: { ...typography.caption, color: 'rgba(255,255,255,0.88)', marginTop: spacing.xs },
});
