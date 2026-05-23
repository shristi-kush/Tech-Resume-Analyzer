import { useNavigation } from "@react-navigation/native";

import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import { Image } from "expo-image";

import { StyleSheet, Text, View } from "react-native";

import { BenefitCard } from "../components/BenefitCard";

import { Button } from "../components/Button";

import { ContactSection } from "../components/ContactSection";

import { EnterpriseFooter } from "../components/EnterpriseFooter";

import { FeatureMatrix, MatrixRow } from "../components/FeatureMatrix";

import { FeedCard } from "../components/FeedCard";

import { HeroSection } from "../components/HeroSection";

import { ScreenLayout } from "../components/ScreenLayout";

import { SectionHeader } from "../components/SectionHeader";

import { PexelsImages } from "../constants/pexels";

import { colors, layout, radius, spacing, typography } from "../theme";

import { TabParamList } from "../navigation/types";

const MATRIX_ROWS: MatrixRow[] = [
  { feature: "Tech stack & skill extraction", analyzer: true, manual: false },
  {
    feature: "Engineering track classification",
    analyzer: true,
    manual: false,
  },
  { feature: "Tech resume structure scoring", analyzer: true, manual: true },
  { feature: "Upskilling course picks", analyzer: true, manual: false },
  { feature: "Time per tech resume", analyzer: "< 1 min", manual: "15–30 min" },
];

const BENEFITS = [
  {
    title: "Find your engineering track",
    body: "See whether you read as Software, Data, Mobile, DevOps, or UI/UX — and how strong your profile looks.",
    image: PexelsImages.laptop,
  },
  {
    title: "Spot gaps before recruiters do",
    body: "Checklist scoring flags missing sections, weak structure, and skills you should highlight.",
    image: PexelsImages.writing,
  },
  {
    title: "Know what to learn next",
    body: "Get course picks based on skills you're missing for your target tech role.",
    image: PexelsImages.success,
  },
];

const STEPS = [
  "Upload your tech resume PDF on the Analyze tab.",
  "We extract stacks, tools, and map an engineering career track.",
  "Review your tech score, gaps, and upskilling course picks.",
];

export function LandingScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();

  return (
    <ScreenLayout>
      <HeroSection onGetStarted={() => navigation.navigate("Analyze")} />

      <SectionHeader
        title="Why developers use it"
        subtitle="Honest feedback on your tech resume in under a minute."
      />

      {BENEFITS.map((b) => (
        <BenefitCard
          key={b.title}
          title={b.title}
          body={b.body}
          imageUri={b.image}
        />
      ))}

      <FeedCard
        title="What you get"
        subtitle="Instant analysis vs reviewing your resume on your own"
        accent="skills"
        noPadding
      >
        <FeatureMatrix rows={MATRIX_ROWS} />
      </FeedCard>

      <View style={styles.howBlock}>
        <Image
          source={{ uri: PexelsImages.laptop }}
          style={styles.howImage}
          contentFit="cover"
        />

        <FeedCard
          title="How it works for tech resumes"
          accent="checklist"
          style={styles.howCard}
        >
          {STEPS.map((step, i) => (
            <View key={step} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>

              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          <View style={styles.cta}>
            <Button
              title="Analyze"
              onPress={() => navigation.navigate("Analyze")}
            />
          </View>
        </FeedCard>
      </View>

      <ContactSection />

      <EnterpriseFooter />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  howBlock: {
    marginBottom: layout.sectionGap,
  },

  howImage: {
    width: "100%",

    height: 160,

    borderTopLeftRadius: radius.lg,

    borderTopRightRadius: radius.lg,

    borderWidth: 1,

    borderBottomWidth: 0,

    borderColor: colors.border,

    backgroundColor: colors.backgroundAlt,
  },

  howCard: {
    marginBottom: 0,

    borderTopLeftRadius: 0,

    borderTopRightRadius: 0,

    marginTop: -1,
  },

  stepRow: {
    flexDirection: "row",

    alignItems: "flex-start",

    marginBottom: spacing.xl,

    gap: spacing.lg,
  },

  stepNum: {
    width: 32,

    height: 32,

    borderRadius: radius.full,

    backgroundColor: colors.accent,

    alignItems: "center",

    justifyContent: "center",
  },

  stepNumText: { ...typography.bodyStrong, fontSize: 14, color: colors.onAccent },

  stepText: { ...typography.body, flex: 1, paddingTop: 4 },

  cta: { marginTop: spacing.md },
});
