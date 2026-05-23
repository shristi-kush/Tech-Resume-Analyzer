import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { Images } from '../assets';
import { colors, radius, spacing, typography } from '../theme';

type Props = { message: string; hint?: string };

export function EmptyState({ message, hint }: Props) {
  return (
    <View style={styles.wrap}>
      <Image source={Images.emptyState} style={styles.img} contentFit="contain" />
      <Text style={styles.msg}>{message}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  img: { width: 80, height: 80, opacity: 0.85 },
  msg: { ...typography.bodyStrong, marginTop: spacing.md, textAlign: 'center' },
  hint: { ...typography.caption, marginTop: spacing.sm, textAlign: 'center' },
});
