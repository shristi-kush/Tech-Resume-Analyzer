import { StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { ChartDatum } from '../../utils/skillsCharts';
import { colors, spacing, typography } from '../../theme';

const SIZE = 140;
const R = SIZE / 2 - 4;
const CX = SIZE / 2;
const CY = SIZE / 2;

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polar(cx, cy, r, end);
  const e = polar(cx, cy, r, start);
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y} Z`;
}

type Props = { data: ChartDatum[] };

export function PieChartView({ data }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) {
    return <Text style={styles.empty}>No data</Text>;
  }

  let angle = 0;
  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * 360;
    const start = angle;
    angle += sweep;
    return {
      ...d,
      path: slicePath(CX, CY, R, start, start + sweep),
      pct: Math.round((d.value / total) * 100),
      key: `${d.label}-${i}`,
    };
  });

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE}>
        <G>
          {slices.map((s) => (
            <Path key={s.key} d={s.path} fill={s.color ?? colors.accent} />
          ))}
        </G>
      </Svg>
      <View style={styles.legend}>
        {slices.map((s) => (
          <View key={s.key} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: s.color ?? colors.accent }]} />
            <Text style={styles.legendText}>
              {s.label} · {s.value} ({s.pct}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, flexWrap: 'wrap' },
  empty: { ...typography.caption },
  legend: { flex: 1, gap: spacing.sm, minWidth: 120 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { ...typography.caption, color: colors.textSecondary, flex: 1 },
});
