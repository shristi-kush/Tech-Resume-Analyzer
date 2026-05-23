import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../theme';

type Props = {
  title: string;
  body: string;
  imageUri: string;
};

export function BenefitCard({ title, body, imageUri }: Props) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: colors.backgroundAlt,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: { ...typography.heading },
  text: { ...typography.body },
});
