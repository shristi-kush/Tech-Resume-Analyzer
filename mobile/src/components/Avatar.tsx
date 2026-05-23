import { Image } from 'expo-image';
import { ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { Images } from '../assets';
import { colors, layout, radius, typography } from '../theme';

type Props = {
  size?: 'md' | 'lg';
  source?: ImageSourcePropType;
  label?: string;
  online?: boolean;
};

export function Avatar({ size = 'md', source, label, online }: Props) {
  const dim = size === 'lg' ? layout.avatarLg : layout.avatarMd;
  return (
    <View style={styles.wrap}>
      <Image
        source={source ?? Images.profile}
        style={[styles.img, { width: dim, height: dim, borderRadius: dim / 2 }]}
        contentFit="cover"
      />
      {online !== undefined && (
        <View
          style={[
            styles.dot,
            { backgroundColor: online ? colors.success : colors.borderStrong },
          ]}
        />
      )}
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  img: {
    borderWidth: 2,
    borderColor: colors.surface,
    backgroundColor: colors.backgroundAlt,
  },
  dot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  label: {
    ...typography.captionMedium,
    fontSize: 10,
    marginTop: 4,
  },
});
