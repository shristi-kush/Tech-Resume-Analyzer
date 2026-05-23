import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { submitFeedback } from '../api/client';
import { Button } from '../components/Button';
import { FeedCard } from '../components/FeedCard';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { ScreenLayout } from '../components/ScreenLayout';
import { PageImages } from '../constants/pexels';
import { colors, radius, spacing, typography } from '../theme';

export function FeedbackScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [score, setScore] = useState(5);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await submitFeedback({ name, email, score, comments });
      Alert.alert('Recorded', 'Thank you for your feedback.');
      setComments('');
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <PageHeader
        title="Feedback"
        subtitle="Help us improve the tech resume analyzer"
        imageUri={PageImages.feedback}
        height={220}
      />

      <FeedCard title="Your review" accent="default">
        <Text style={styles.intro}>
          Ratings and comments help us improve tech scoring, tracks, and features.
        </Text>
        <Input label="Name" value={name} onChangeText={setName} />
        <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />

        <Text style={styles.blockLabel}>Rating · {score}/5</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              onPress={() => setScore(n)}
              style={[styles.ratingBtn, n === score && styles.ratingActive]}
            >
              <Text style={[styles.ratingText, n === score && styles.ratingTextActive]}>
                {n}
              </Text>
            </Pressable>
          ))}
        </View>

        <Input
          label="Comments"
          value={comments}
          onChangeText={setComments}
          multiline
          numberOfLines={3}
          style={styles.comments}
        />
        <Button title="Submit" onPress={submit} loading={loading} />
      </FeedCard>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  intro: { ...typography.body, marginBottom: spacing.xl },
  blockLabel: { ...typography.captionBold, marginBottom: spacing.md },
  ratingRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  ratingBtn: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAlt,
  },
  ratingActive: { borderColor: colors.accent, backgroundColor: colors.accentMuted },
  ratingText: { ...typography.bodyStrong, color: colors.textMuted },
  ratingTextActive: { color: colors.accent },
  comments: { minHeight: 100, textAlignVertical: 'top' },
});
