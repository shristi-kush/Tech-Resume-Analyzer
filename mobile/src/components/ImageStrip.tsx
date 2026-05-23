import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PEXELS_ATTRIBUTION } from '../constants/pexels';
import { colors, radius, spacing, typography } from '../theme';

type Item = { uri: string; label: string };

type Props = { items: Item[] };

export function ImageStrip({ items }: Props) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {items.map((item) => (
          <View key={item.label} style={styles.tile}>
            <Image source={{ uri: item.uri }} style={styles.image} contentFit="cover" />
            <View style={styles.labelBg}>
              <Text style={styles.label}>{item.label}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <Text style={styles.credit}>{PEXELS_ATTRIBUTION}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  scroll: { gap: spacing.md, paddingVertical: spacing.xs },
  tile: {
    width: 140,
    height: 100,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { width: '100%', height: '100%' },
  labelBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(11,18,32,0.65)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  label: { ...typography.captionMedium, color: '#fff', fontSize: 10 },
  credit: { ...typography.caption, marginTop: spacing.sm, textAlign: 'right' },
});
