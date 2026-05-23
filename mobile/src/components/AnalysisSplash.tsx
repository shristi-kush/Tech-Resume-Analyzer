import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnalysisMode } from './AnalysisModePicker';
import { Logo } from './Logo';
import { colors, layout, radius, spacing, typography } from '../theme';

export type AnalysisStep = { id: string; label: string };

export function getAnalysisSteps(mode: AnalysisMode): AnalysisStep[] {
  const steps: AnalysisStep[] = [
    { id: 'upload', label: 'Uploading tech resume' },
    { id: 'extract', label: 'Extracting stacks & skills' },
    { id: 'parse', label: 'Parsing projects & experience' },
    { id: 'track', label: 'Mapping engineering track' },
    { id: 'checklist', label: 'Scoring tech resume structure' },
  ];

  if (mode === 'ollama') {
    steps.push({ id: 'ai', label: 'Creating detailed tech review' });
  }

  steps.push(
    { id: 'courses', label: 'Finding upskilling courses' },
    { id: 'report', label: 'Preparing your report' }
  );

  return steps;
}

type Props = {
  visible: boolean;
  steps: AnalysisStep[];
  currentIndex: number;
  mode: AnalysisMode;
};

function StepIcon({ status }: { status: 'done' | 'active' | 'pending' }) {
  if (status === 'done') {
    return (
      <View style={[styles.iconWrap, styles.iconDone]}>
        <Ionicons name="checkmark" size={14} color={colors.surface} />
      </View>
    );
  }
  if (status === 'active') {
    return (
      <View style={[styles.iconWrap, styles.iconActive]}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  }
  return <View style={[styles.iconWrap, styles.iconPending]} />;
}

export function AnalysisSplash({ visible, steps, currentIndex, mode }: Props) {
  const insets = useSafeAreaInsets();
  const progress = steps.length > 0 ? (currentIndex + 1) / steps.length : 0;
  const activeLabel = steps[currentIndex]?.label ?? 'Analyzing…';

  return (
    <Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent>
      <View style={[styles.screen, { paddingTop: insets.top + spacing.xl }]}>
        <View style={styles.header}>
          <Logo size={72} />
          <Text style={styles.title}>Analyzing tech resume</Text>
          <Text style={styles.sub}>
            {mode === 'ollama'
              ? 'Detailed engineering review in progress'
              : 'Quick tech scan in progress'}
          </Text>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.min(100, progress * 100)}%` }]} />
          </View>
          <Text style={styles.activeStep}>{activeLabel}</Text>
        </View>

        <View style={styles.steps}>
          {steps.map((step, i) => {
            const status =
              i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'pending';
            return (
              <View key={step.id} style={styles.stepRow}>
                <StepIcon status={status} />
                <Text
                  style={[
                    styles.stepLabel,
                    status === 'active' && styles.stepLabelActive,
                    status === 'done' && styles.stepLabelDone,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.footer}>This usually takes under a minute</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.title,
    fontSize: 24,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  sub: {
    ...typography.body,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  progressBlock: {
    marginBottom: spacing.xl,
  },
  track: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.full,
  },
  activeStep: {
    ...typography.bodyStrong,
    color: colors.accent,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  steps: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 36,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDone: {
    backgroundColor: colors.accent,
  },
  iconActive: {
    backgroundColor: colors.accentMuted,
  },
  iconPending: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepLabel: {
    ...typography.body,
    flex: 1,
    color: colors.textMuted,
  },
  stepLabelActive: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  stepLabelDone: {
    color: colors.textSecondary,
  },
  footer: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
});
