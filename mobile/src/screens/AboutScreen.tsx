import { StyleSheet, Text, View } from "react-native";

import { EnterpriseFooter } from "../components/EnterpriseFooter";

import { Logo } from "../components/Logo";

import { FeedCard } from "../components/FeedCard";

import { PageHeader } from "../components/PageHeader";

import { ScreenLayout } from "../components/ScreenLayout";

import { PageImages } from "../constants/pexels";

import { colors, layout, radius, spacing, typography } from "../theme";

const HIGHLIGHTS = [
  {
    title: "Tech resume parsing",
    body: "Extracts languages, frameworks, tools, education, and engineering experience from PDFs.",
  },
  {
    title: "Engineering track mapping",
    body: "Maps you to Software, Data Science, Mobile, DevOps, or UI/UX based on your stack.",
  },
  {
    title: "Detailed tech review",
    body: "Optional in-depth feedback for dev resumes plus a recommended upskilling video.",
  },
];

export function AboutScreen() {
  return (
    <ScreenLayout>
      <PageHeader
        title="About"
        subtitle="Purpose-built for software and tech resumes"
        imageUri={PageImages.about}
        height={220}
      />

      <View style={styles.brandRow}>
        <Logo size={52} />

        <View>
          <Text style={styles.brand}>Tech Resume Analyzer</Text>

          <Text style={styles.ver}>Version 1.0</Text>
        </View>
      </View>

      <FeedCard title="Capabilities" accent="skills">
        {HIGHLIGHTS.map((h, i) => (
          <View
            key={h.title}
            style={[
              styles.highlight,
              i < HIGHLIGHTS.length - 1 && styles.highlightBorder,
            ]}
          >
            <Text style={styles.highlightTitle}>{h.title}</Text>

            <Text style={styles.highlightBody}>{h.body}</Text>
          </View>
        ))}
      </FeedCard>

      <FeedCard title="Overview" accent="default">
        <Text style={styles.p}>
          Upload a tech resume PDF to get your stack, engineering track,
          structure score, and upskilling course suggestions — tuned for
          developer and IT roles.
        </Text>
        <Text style={styles.pLast}>
          Use quick scan for fast results, or detailed review when you want
          richer feedback on projects, skills gaps, and learning resources.
        </Text>
      </FeedCard>

      <EnterpriseFooter />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: "row",

    alignItems: "center",

    gap: spacing.lg,

    marginBottom: layout.sectionGap,

    padding: spacing.xl,

    backgroundColor: colors.surface,

    borderRadius: radius.lg,

    borderWidth: 1,

    borderColor: colors.border,
  },

  brand: { ...typography.heading, fontSize: 18 },

  ver: { ...typography.caption, marginTop: spacing.xs },

  highlight: {
    paddingBottom: spacing.xl,

    marginBottom: spacing.xl,
  },

  highlightBorder: {
    borderBottomWidth: 1,

    borderBottomColor: colors.border,
  },

  highlightTitle: { ...typography.bodyStrong, marginBottom: spacing.sm },

  highlightBody: { ...typography.body },

  p: { ...typography.body, marginBottom: spacing.lg },

  pLast: { ...typography.body },
});
