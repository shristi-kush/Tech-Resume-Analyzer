import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { fonts } from '../fonts';
import { colors, layout, radius, spacing, typography } from '../theme';

type Props = TextInputProps & { label: string };

export function Input({ label, style, ...props }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.xl },
  label: { ...typography.captionMedium, marginBottom: spacing.sm, color: colors.textMuted },
  input: {
    minHeight: layout.inputHeight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.backgroundAlt,
  },
});
