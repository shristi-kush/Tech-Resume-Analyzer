import { ScrollView, StyleSheet, View } from 'react-native';
import { ChartItem } from '../api/client';
import { chartItemsToData } from '../utils/skillsCharts';
import { layout, typography } from '../theme';
import { FeedCard } from './FeedCard';
import { BarChartView } from './charts/BarChartView';
import { HistogramView } from './charts/HistogramView';
import { PieChartView } from './charts/PieChartView';

type ChartKind = 'bar' | 'pie' | 'histogram';

function kindForKey(key: string): ChartKind {
  if (key === 'resume_score') return 'histogram';
  if (
    key === 'predicted_field' ||
    key === 'user_level' ||
    key === 'upload_source' ||
    key === 'feedback_rating'
  ) {
    return 'pie';
  }
  return 'bar';
}

const SUBTITLES: Record<ChartKind, string> = {
  bar: 'Bar chart',
  pie: 'Pie chart',
  histogram: 'Histogram',
};

type Props = {
  chartKey: string;
  title: string;
  items: ChartItem[];
};

export function AnalyticsChartCard({ chartKey, title, items }: Props) {
  if (!items.length) return null;

  const kind = kindForKey(chartKey);
  const data = chartItemsToData(items);

  return (
    <FeedCard title={title} subtitle={SUBTITLES[kind]} accent="admin" noPadding>
      <ScrollView horizontal showsHorizontalScrollIndicator={kind !== 'pie'}>
        <View style={styles.pad}>
          {kind === 'pie' && <PieChartView data={data} />}
          {kind === 'bar' && <BarChartView data={data} />}
          {kind === 'histogram' && <HistogramView data={data} />}
        </View>
      </ScrollView>
    </FeedCard>
  );
}

const styles = StyleSheet.create({
  pad: { padding: layout.cardPadding, minWidth: 280 },
});
