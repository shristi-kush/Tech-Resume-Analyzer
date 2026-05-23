import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { DataRow } from '../components/DataRow';
import { FeedCard } from '../components/FeedCard';
import { PageHeader } from '../components/PageHeader';
import { ScoreMetric } from '../components/ScoreMetric';
import { SkillsVisualization } from '../components/SkillsVisualization';
import { ScreenLayout } from '../components/ScreenLayout';
import { StatusPill } from '../components/StatusPill';
import { PageImages } from '../constants/pexels';
import { colors, layout, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

function BulletList({ items }: { items: string[] }) {
  if (!items.length) return <Text style={styles.body}>—</Text>;
  return (
    <>
      {items.map((item) => (
        <Text key={item} style={styles.bullet}>
          · {item}
        </Text>
      ))}
    </>
  );
}

export function ResultsScreen({ route, navigation }: Props) {
  const { result } = route.params;
  const { profile, ai_analysis, youtube_video } = result;
  const isAi = result.analysis_mode === 'ollama' && ai_analysis;

  return (
    <ScreenLayout>
      <PageHeader
        title="Tech resume report"
        subtitle={`${result.predicted_field} · ${result.candidate_level}`}
        imageUri={PageImages.results}
        height={220}
        right={
          <View style={styles.headerPills}>
            <StatusPill
              label={result.analysis_mode === 'ollama' ? 'Detailed' : 'Quick scan'}
              tone={result.analysis_mode === 'ollama' ? 'accent' : 'neutral'}
            />
          </View>
        }
      />

      <ScoreMetric score={result.resume_score} />

      <View style={styles.pills}>
        <StatusPill label={result.predicted_field} tone="accent" />
        <StatusPill label={result.candidate_level} tone="neutral" />
      </View>

      {isAi && (
        <FeedCard title="Detailed review" accent="admin">
          <Text style={styles.sectionLabel}>Summary</Text>
          <Text style={styles.body}>{ai_analysis.summary || '—'}</Text>

          <Text style={[styles.sectionLabel, styles.sectionGap]}>Strengths</Text>
          <BulletList items={ai_analysis.strengths} />

          <Text style={[styles.sectionLabel, styles.sectionGap]}>Areas to improve</Text>
          <BulletList items={ai_analysis.weaknesses} />

          <Text style={[styles.sectionLabel, styles.sectionGap]}>Action items</Text>
          <BulletList items={ai_analysis.improvement_tips} />
        </FeedCard>
      )}

      {youtube_video?.applicable && youtube_video.url && (
        <FeedCard title="Recommended video" accent="courses" noPadding>
          <View style={styles.pad}>
            <Text style={styles.ytTitle}>{youtube_video.title}</Text>
            {youtube_video.reason ? (
              <Text style={styles.ytReason}>{youtube_video.reason}</Text>
            ) : null}
            <Text style={styles.link} onPress={() => Linking.openURL(youtube_video.url)}>
              Watch on YouTube
            </Text>
          </View>
        </FeedCard>
      )}

      <SkillsVisualization
        mode="single"
        skills={result.skills}
        recommendedSkills={result.recommended_skills}
      />

      <FeedCard title="Tech stack & skills" accent="skills">
        <Text style={styles.body}>
          {result.skills.length ? result.skills.join(' · ') : 'None detected'}
        </Text>
        {result.recommended_skills.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, styles.sectionGap]}>Suggested to add</Text>
            <Text style={styles.body}>{result.recommended_skills.join(' · ')}</Text>
          </>
        )}
      </FeedCard>

      <FeedCard title="Profile" accent="profile" noPadding>
        <View style={styles.pad}>
          <DataRow label="Name" value={profile.name || '—'} />
          <DataRow label="Email" value={profile.email || '—'} />
          <DataRow label="Pages" value={String(profile.pages ?? '—')} />
          <DataRow label="Degree" value={String(profile.degree ?? '—')} last />
        </View>
      </FeedCard>

      <FeedCard title="Tech resume checklist" accent="checklist" noPadding>
        {result.resume_tips.map((tip, i) => (
          <View
            key={tip.label}
            style={[styles.tipRow, i < result.resume_tips.length - 1 && styles.tipBorder]}
          >
            <Text style={[styles.tipMark, tip.passed && styles.tipPass]}>
              {tip.passed ? '▲' : '▼'}
            </Text>
            <Text style={styles.tipLabel}>{tip.label}</Text>
            <Text style={styles.tipPts}>+{tip.points}</Text>
          </View>
        ))}
      </FeedCard>

      {result.courses.length > 0 && (
        <FeedCard title="Courses" accent="courses" noPadding>
          {result.courses.map((c, i) => (
            <Pressable
              key={c.url}
              style={[styles.courseRow, i < result.courses.length - 1 && styles.rowBorder]}
              onPress={() => Linking.openURL(c.url)}
            >
              <Text style={styles.courseTitle}>{c.name}</Text>
              <Ionicons name="open-outline" size={18} color={colors.accent} />
            </Pressable>
          ))}
        </FeedCard>
      )}

      <View style={styles.footerCta}>
        <Button title="Analyze another resume" onPress={() => navigation.popToTop()} variant="secondary" />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerPills: { gap: spacing.sm, alignItems: 'flex-end' },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: layout.sectionGap,
  },
  pad: { paddingHorizontal: layout.cardPadding, paddingVertical: spacing.sm },
  body: { ...typography.body },
  bullet: { ...typography.body, marginBottom: spacing.md },
  sectionLabel: {
    ...typography.captionBold,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  sectionGap: { marginTop: spacing.xl },
  ytTitle: { ...typography.bodyStrong },
  ytReason: { ...typography.caption, marginTop: spacing.sm, marginBottom: spacing.md },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: layout.cardPadding,
    minHeight: layout.rowHeight,
  },
  tipBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  tipMark: { ...typography.captionBold, width: 28, fontSize: 12, color: colors.danger },
  tipPass: { color: colors.popGreen },
  tipLabel: { ...typography.body, flex: 1 },
  tipPts: { ...typography.captionMedium },
  link: {
    ...typography.bodyStrong,
    color: colors.accent,
    paddingVertical: spacing.md,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: layout.cardPadding,
    minHeight: layout.rowHeight,
  },
  courseTitle: {
    ...typography.bodyStrong,
    color: colors.accent,
    flex: 1,
    lineHeight: 24,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  footerCta: { marginTop: spacing.lg },
});
