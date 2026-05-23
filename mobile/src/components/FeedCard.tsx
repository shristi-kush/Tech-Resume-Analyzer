import { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, feedAccents, layout, radius, shadow, spacing, typography } from '../theme';

type Accent = keyof typeof feedAccents;

type Props = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  accent?: Accent;
  style?: ViewStyle;
  noPadding?: boolean;
};

export function FeedCard({
  title,
  subtitle,
  children,
  accent = 'default',
  style,
  noPadding,
}: Props) {
  return (
    <View style={[styles.wrap, style]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title ? (
            <View style={styles.titleRow}>
              <View style={[styles.dot, { backgroundColor: feedAccents[accent] }]} />
              <Text style={styles.title}>{title}</Text>
            </View>
          ) : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      )}
      <View style={noPadding ? styles.contentFlush : styles.contentPadded}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: layout.sectionGap,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.card,
  },
  header: {
    paddingHorizontal: layout.cardPadding,
    paddingTop: layout.cardPadding,
    paddingBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  title: { ...typography.heading, fontSize: 16 },
  subtitle: { ...typography.caption, marginTop: spacing.xs, marginLeft: spacing.lg + spacing.sm },
  contentPadded: {
    paddingHorizontal: layout.cardPadding,
    paddingBottom: layout.cardPadding,
  },
  contentFlush: {
    paddingBottom: layout.cardPadding,
  },
});
