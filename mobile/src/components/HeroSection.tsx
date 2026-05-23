import { Image } from "expo-image";

import { LinearGradient } from "expo-linear-gradient";

import { StyleSheet, Text, View } from "react-native";

import { PexelsImages } from "../constants/pexels";

import { colors, layout, radius, shadow, spacing, typography } from "../theme";

import { Button } from "./Button";

import { Logo } from "./Logo";

type Props = {
  onGetStarted: () => void;
};

const TECH_TRACKS = ["Software", "Data", "Mobile", "DevOps", "UI/UX"];

const STATS = [
  { value: "5", label: "Tech tracks" },
  { value: "<1m", label: "Per resume" },
  { value: "100%", label: "Skill match" },
];

export function HeroSection({ onGetStarted }: Props) {
  return (
    <View style={styles.wrap}>
      <Image
        source={{ uri: PexelsImages.hero }}
        style={styles.image}
        contentFit="cover"
      />

      <LinearGradient
        colors={["rgba(15,23,42,0.15)", "rgba(15,23,42,0.82)"]}
        style={styles.gradient}
      />

      <View style={styles.content}>
        <View style={styles.logoMark}>
          <Logo size={40} />
        </View>

        <Text style={styles.kicker}>Tech Resume Analyzer</Text>

        <Text style={styles.title}>Built for{"\n"}software & tech roles.</Text>

        <Text style={styles.sub}>
          Upload your PDF, get your stack scored, see which engineering track you
          fit, and learn exactly what to improve before you apply.
        </Text>

        <View style={styles.trackRow}>
          {TECH_TRACKS.map((track) => (
            <View key={track} style={styles.trackPill}>
              <Text style={styles.trackPillText}>{track}</Text>
            </View>
          ))}
        </View>

        <View style={styles.ctaRow}>
          <Button title="Analyze my tech resume" onPress={onGetStarted} />
        </View>

        <View style={styles.stats}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statValue}>{s.value}</Text>

              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 380,

    borderRadius: radius.xl,

    overflow: "hidden",

    marginBottom: layout.sectionGap,

    borderWidth: 1,

    borderColor: colors.border,

    ...shadow.card,
  },

  image: { ...StyleSheet.absoluteFillObject },

  gradient: { ...StyleSheet.absoluteFillObject },

  content: {
    flex: 1,

    justifyContent: "flex-end",

    padding: spacing.xl,

    paddingTop: spacing.xxxl,
  },

  logoMark: {
    width: 56,

    height: 56,

    borderRadius: radius.md,

    marginBottom: spacing.lg,

    backgroundColor: colors.surface,

    alignItems: "center",

    justifyContent: "center",
  },

  kicker: {
    ...typography.overline,

    color: colors.accent,

    marginBottom: spacing.sm,
  },

  title: {
    ...typography.title,
    fontSize: 30,
    color: colors.textOnImage,
    lineHeight: 36,
    marginBottom: spacing.md,
  },

  sub: {
    ...typography.body,
    color: colors.textOnImageMuted,
    marginBottom: spacing.lg,
    maxWidth: 320,
  },
  trackRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xl,
    maxWidth: 320,
  },
  trackPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  trackPillText: {
    ...typography.captionMedium,
    color: colors.textOnImage,
  },
  ctaRow: { marginBottom: spacing.xl },

  stats: {
    flexDirection: "row",

    borderTopWidth: 1,

    borderTopColor: "rgba(255,255,255,0.2)",

    paddingTop: spacing.lg,

    gap: spacing.xl,
  },

  stat: { flex: 1 },

  statValue: { ...typography.heading, fontSize: 20, color: colors.textOnImage },

  statLabel: {
    ...typography.caption,
    color: "rgba(255,255,255,0.7)",
    marginTop: spacing.xs,
  },
});
