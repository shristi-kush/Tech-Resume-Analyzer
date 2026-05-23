import { Image } from 'expo-image';

import { LinearGradient } from 'expo-linear-gradient';

import { ReactNode } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { colors, layout, radius, shadow, spacing, typography } from '../theme';



type Props = {

  title: string;

  subtitle?: string;

  imageUri: string;

  right?: ReactNode;

  height?: number;

};



export function PageHeader({

  title,

  subtitle,

  imageUri,

  right,

  height = 200,

}: Props) {

  return (

    <View style={[styles.wrap, { minHeight: height }]}>

      <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />

      <LinearGradient

        colors={['rgba(15,23,42,0.12)', 'rgba(15,23,42,0.78)']}

        style={styles.gradient}

      />

      <View style={styles.row}>

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

    borderRadius: radius.xl,

    overflow: 'hidden',

    marginBottom: layout.sectionGap,

    borderWidth: 1,

    borderColor: colors.border,

    ...shadow.card,

  },

  image: { ...StyleSheet.absoluteFillObject },

  gradient: { ...StyleSheet.absoluteFillObject },

  row: {

    flex: 1,

    flexDirection: 'row',

    alignItems: 'flex-end',

    justifyContent: 'space-between',

    padding: spacing.xl,

    gap: spacing.lg,

  },

  textCol: { flex: 1 },

  title: {
    ...typography.title,
    fontSize: 24,
    color: colors.textOnImage,
    lineHeight: 30,
    letterSpacing: -0.3,
  },

  sub: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textOnImageMuted,
    marginTop: spacing.sm,
  },

});

