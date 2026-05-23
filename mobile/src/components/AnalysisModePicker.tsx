import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export type AnalysisMode = 'nlp' | 'ollama';

type Props = {
  value: AnalysisMode;
  onChange: (mode: AnalysisMode) => void;
  detailedAvailable?: boolean | null;
};

const OPTIONS: { id: AnalysisMode; title: string; subtitle: string }[] = [
  {
    id: 'nlp',
    title: 'Quick scan',
    subtitle: 'Fast stack extraction, tech track, checklist & courses',
  },
  {
    id: 'ollama',
    title: 'Detailed review',
    subtitle: 'In-depth dev resume feedback and upskilling video',
  },
];

export function AnalysisModePicker({ value, onChange, detailedAvailable }: Props) {
  return (
    <View style={styles.wrap}>
      {OPTIONS.map((opt) => {
        const selected = value === opt.id;
        const unavailable = opt.id === 'ollama' && detailedAvailable === false;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            style={[styles.option, selected && styles.optionSelected, unavailable && styles.optionWarn]}
          >
            <Text style={[styles.title, selected && styles.titleSelected]}>{opt.title}</Text>
            <Text style={styles.sub}>{opt.subtitle}</Text>
            {opt.id === 'ollama' && detailedAvailable === true && (
              <Text style={styles.badge}>Available</Text>
            )}
            {unavailable && (
              <Text style={styles.warn}>Unavailable right now — try quick scan</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  option: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  optionWarn: { borderColor: colors.warning },
  title: { ...typography.bodyStrong },
  titleSelected: { color: colors.accent },
  sub: { ...typography.caption, marginTop: spacing.sm },
  badge: {
    ...typography.captionBold,
    color: colors.popGreen,
    marginTop: spacing.md,
  },
  warn: {
    ...typography.caption,
    color: colors.warning,
    marginTop: spacing.md,
  },
});
