import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  aggregateSkillsFromRecords,
  aggregateSkillsHistogram,
  skillsCategoryHistogram,
  skillsCoveragePie,
} from '../utils/skillsCharts';
import { layout, typography } from '../theme';
import { FeedCard } from './FeedCard';
import { HistogramView } from './charts/HistogramView';
import { PieChartView } from './charts/PieChartView';

type SingleAnalysisProps = {
  mode: 'single';
  skills: string[];
  recommendedSkills?: string[];
};

type AggregateProps = {
  mode: 'aggregate';
  records: { actual_skills?: string }[];
};

type Props = SingleAnalysisProps | AggregateProps;

function buildSingleCharts(skills: string[], recommended: string[]) {
  const pie = skillsCoveragePie(skills, recommended);
  const histogram = skillsCategoryHistogram(skills);
  return { pie, histogram };
}

function buildAggregateCharts(records: { actual_skills?: string }[]) {
  const pie = aggregateSkillsFromRecords(records, 5);
  const histogram = aggregateSkillsHistogram(records);
  return { pie, histogram };
}

export function SkillsVisualization(props: Props) {
  const charts =
    props.mode === 'single'
      ? buildSingleCharts(props.skills, props.recommendedSkills ?? [])
      : buildAggregateCharts(props.records);

  const hasAny = charts.pie.length > 0 || charts.histogram.length > 0;

  if (!hasAny) {
    return (
      <FeedCard title="Skills visualization" accent="skills">
        <Text style={styles.empty}>No skills data to chart yet.</Text>
      </FeedCard>
    );
  }

  return (
    <>
      {charts.pie.length > 0 && (
        <FeedCard
          title="Skills · pie chart"
          subtitle={
            props.mode === 'single' ? 'Detected vs suggested' : 'Top skills share'
          }
          accent="courses"
        >
          <PieChartView data={charts.pie} />
        </FeedCard>
      )}

      {charts.histogram.length > 0 && (
        <FeedCard
          title="Skills · histogram"
          subtitle="Count by category"
          accent="checklist"
          noPadding
        >
          <ScrollView horizontal showsHorizontalScrollIndicator style={styles.chartScroll}>
            <View style={styles.chartPad}>
              <HistogramView data={charts.histogram} />
            </View>
          </ScrollView>
        </FeedCard>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  empty: { ...typography.body },
  chartScroll: { maxHeight: 220 },
  chartPad: { padding: layout.cardPadding },
});
