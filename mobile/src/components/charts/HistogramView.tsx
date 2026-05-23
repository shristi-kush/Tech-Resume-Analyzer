import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { ChartDatum } from '../../utils/skillsCharts';
import { colors, layout, spacing, typography } from '../../theme';

const CHART_H = 150;
const PAD_L = 4;

type Props = { data: ChartDatum[]; height?: number };

/** Vertical histogram — category counts on X, frequency on Y */
export function HistogramView({ data, height = CHART_H }: Props) {
  if (!data.length) {
    return <Text style={styles.empty}>No data</Text>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const barW = Math.min(56, Math.max(32, (300 - PAD_L) / data.length - 8));
  const chartW = Math.max(280, data.length * (barW + 8) + PAD_L);
  const plotH = height - 24;

  return (
    <View>
      <Svg width={chartW} height={height}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = 4 + plotH * (1 - t);
          return (
            <Rect
              key={`grid-${t}`}
              x={0}
              y={y}
              width={chartW}
              height={1}
              fill={colors.border}
              opacity={0.6}
            />
          );
        })}
        {data.map((d, i) => {
          const barH = Math.max(6, (d.value / max) * plotH);
          const x = PAD_L + i * (barW + 8);
          const y = 4 + plotH - barH;
          return (
            <Rect
              key={`hist-${d.label}-${i}`}
              x={x}
              y={y}
              width={barW}
              height={barH}
              fill={d.color ?? colors.popBlue}
              opacity={0.9}
            />
          );
        })}
        {data.map((d, i) => {
          const x = PAD_L + i * (barW + 8) + barW / 2;
          return (
            <SvgText
              key={`h-lbl-${d.label}`}
              x={x}
              y={height - 6}
              fontSize={9}
              fill={colors.textMuted}
              textAnchor="middle"
            >
              {d.label.length > 10 ? `${d.label.slice(0, 9)}…` : d.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { ...typography.caption, padding: layout.cardPadding },
});
