import { AnalysisRecord, ChartItem } from '../api/client';
import { CHART_ORDER, CHART_TITLES, PROFILE_CHART_ORDER } from '../constants/adminCharts';
import { colors, layout, spacing, typography } from '../theme';
import { AnalyticsChartCard } from './AnalyticsChartCard';
import { AdminDataTable } from './AdminDataTable';
import { SkillsVisualization } from './SkillsVisualization';
import { Button } from './Button';
import { FeatureMatrix, MatrixRow } from './FeatureMatrix';
import { FeedCard } from './FeedCard';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  isAdmin: boolean;
  email: string | null;
  analyses: AnalysisRecord[];
  charts: Record<string, ChartItem[]>;
  total: number;
  onSignOut: () => void;
  formatName: (row: AnalysisRecord) => string;
  formatLocation: (row: AnalysisRecord) => string;
  formatDate: (ts?: string) => string;
};

function chartsToMatrix(charts: Record<string, ChartItem[]>, keys: readonly string[]) {
  const rows: MatrixRow[] = [];
  for (const key of keys) {
    const items = charts[key];
    if (!items?.length) continue;
    const top = [...items].sort((a, b) => b.value - a.value)[0];
    rows.push({
      feature: CHART_TITLES[key] ?? key,
      analyzer: `${top.label} (${top.value})`,
      manual: `${items.length} groups`,
    });
  }
  return rows;
}

export function ProfileDashboard({
  isAdmin,
  email,
  analyses,
  charts,
  total,
  onSignOut,
  formatName,
  formatLocation,
  formatDate,
}: Props) {
  const chartKeys = isAdmin ? CHART_ORDER : PROFILE_CHART_ORDER;
  const matrixRows = isAdmin ? chartsToMatrix(charts, CHART_ORDER) : [];
  const uniqueCountries = new Set(
    analyses.map((a) => a.country).filter((c) => c && c !== 'Unknown'),
  ).size;

  return (
    <>
      <FeedCard title={isAdmin ? 'Admin overview' : 'Your profile'} accent="profile">
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.hint}>
          {isAdmin
            ? 'Platform-wide analytics for every upload.'
            : 'Your resume uploads and how they score over time.'}
        </Text>
      </FeedCard>

      <View style={styles.kpiRow}>
        <FeedCard
          title={isAdmin ? 'Total analyses' : 'Your analyses'}
          accent="admin"
          style={styles.kpiCard}
        >
          <Text style={styles.kpi}>{total}</Text>
        </FeedCard>
        {isAdmin ? (
          <FeedCard title="Countries" accent="skills" style={styles.kpiCard}>
            <Text style={styles.kpi}>{uniqueCountries}</Text>
          </FeedCard>
        ) : null}
      </View>

      <SkillsVisualization mode="aggregate" records={analyses} />

      {chartKeys.map((key) => {
        const items = charts[key];
        if (!items?.length) return null;
        return (
          <AnalyticsChartCard
            key={key}
            chartKey={key}
            title={CHART_TITLES[key] ?? key}
            items={items}
          />
        );
      })}

      {isAdmin && matrixRows.length > 0 && (
        <FeedCard
          title="Analytics matrix"
          subtitle="Top bucket per category"
          accent="default"
          noPadding
        >
          <FeatureMatrix rows={matrixRows} colApp="Top" colSecondary="Buckets" />
        </FeedCard>
      )}

      <AdminDataTable
        rows={analyses}
        formatName={formatName}
        formatLocation={formatLocation}
        formatDate={formatDate}
        title={isAdmin ? 'All analyses' : 'Your uploads'}
      />

      <Button title="Sign out" variant="secondary" onPress={onSignOut} />
    </>
  );
}

const styles = StyleSheet.create({
  email: { ...typography.bodyStrong, marginBottom: spacing.sm },
  hint: { ...typography.body },
  kpiRow: { flexDirection: 'row', gap: spacing.md, marginBottom: layout.sectionGap },
  kpiCard: { flex: 1, marginBottom: 0 },
  kpi: { ...typography.metric, color: colors.accent },
});
