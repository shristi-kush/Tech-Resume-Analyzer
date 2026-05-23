import { Image } from 'expo-image';
import { ImageStyle, StyleProp, StyleSheet, View } from 'react-native';
import { Images } from '../assets';

type Props = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

/** Brand mark — assets/images/logo.png */
export function Logo({ size = 48, style }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <Image source={Images.logo} style={styles.image} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
