import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { ChartDatum } from '../../utils/skillsCharts';
import { colors, layout, spacing, typography } from '../../theme';

const CHART_H = 160;
const PAD = 8;

type Props = { data: ChartDatum[]; height?: number };

export function BarChartView({ data, height = CHART_H }: Props) {
  if (!data.length) {
    return <Text style={styles.empty}>No data</Text>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const barW = Math.min(48, Math.max(24, (280 - PAD * 2) / data.length - 6));
  const chartW = data.length * (barW + 6) + PAD * 2;
  const plotH = height - 28;

  return (
    <View>
      <Svg width={chartW} height={height}>
        {data.map((d, i) => {
          const barH = Math.max(4, (d.value / max) * plotH);
          const x = PAD + i * (barW + 6);
          const y = plotH - barH + 4;
          return (
            <Rect
              key={`${d.label}-${i}`}
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={4}
              fill={d.color ?? colors.accent}
            />
          );
        })}
        {data.map((d, i) => {
          const x = PAD + i * (barW + 6) + barW / 2;
          return (
            <SvgText
              key={`lbl-${d.label}-${i}`}
              x={x}
              y={height - 4}
              fontSize={9}
              fill={colors.textMuted}
              textAnchor="middle"
            >
              {d.label.length > 8 ? `${d.label.slice(0, 7)}…` : d.label}
            </SvgText>
          );
        })}
      </Svg>
      <View style={styles.legend}>
        {data.map((d) => (
          <Text key={d.label} style={styles.legendText}>
            {d.label}: {d.value}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { ...typography.caption, padding: layout.cardPadding },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  legendText: { ...typography.caption, color: colors.textMuted },
});
