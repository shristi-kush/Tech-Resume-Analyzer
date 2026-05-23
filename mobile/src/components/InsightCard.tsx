import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { colors, layout, radius, spacing, typography } from '../theme';

type Props = {
  title: string;
  body: string;
  imageUri: string;
};

/** Compact visual callout with Pexels thumbnail */
export function InsightCard({ title, body, imageUri }: Props) {
  return (
    <View style={styles.wrap}>
      <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.accentMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: layout.sectionGap,
    minHeight: 88,
  },
  image: { width: 96, backgroundColor: colors.backgroundAlt },
  body: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  title: { ...typography.bodyStrong, marginBottom: spacing.xs },
  text: { ...typography.body },
});
