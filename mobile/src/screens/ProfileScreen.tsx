import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AnalysisRecord, ChartItem, fetchProfileAnalytics } from '../api/client';
import { ProfileDashboard } from '../components/ProfileDashboard';
import { PageHeader } from '../components/PageHeader';
import { ScreenLayout } from '../components/ScreenLayout';
import { StatusPill } from '../components/StatusPill';
import { useAuth } from '../context/AuthContext';
import { PageImages } from '../constants/pexels';
import { spacing, typography } from '../theme';

function formatTimestamp(ts?: string) {
  if (!ts) return '—';
  return ts.replace('_', ' ').replace(/-/g, '/');
}

function displayName(row: AnalysisRecord) {
  return row.name?.trim() || row.act_name?.trim() || 'Unknown';
}

function formatLocation(row: AnalysisRecord) {
  const parts = [row.city, row.region, row.country].filter(
    (p) => p && p !== 'Unknown',
  );
  return parts.length ? parts.join(', ') : '—';
}

export function ProfileScreen() {
  const { token, isAdmin, email, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [charts, setCharts] = useState<Record<string, ChartItem[]>>({});
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchProfileAnalytics(token);
      setAnalyses(data.analyses ?? []);
      setCharts(data.charts ?? {});
      setTotal(data.total_users ?? 0);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <ScreenLayout>
      <PageHeader
        title={isAdmin ? 'Admin' : 'Profile'}
        subtitle={isAdmin ? 'All uploads & analytics' : 'Your resume history'}
        imageUri={PageImages.admin}
        height={220}
        right={
          <StatusPill
            label={isAdmin ? 'Admin' : 'Signed in'}
            tone={isAdmin ? 'accent' : 'success'}
          />
        }
      />

      {loading ? (
        <Text style={styles.loading}>Loading your data…</Text>
      ) : (
        <ProfileDashboard
          isAdmin={isAdmin}
          email={email}
          analyses={analyses}
          charts={charts}
          total={total}
          onSignOut={logout}
          formatName={displayName}
          formatLocation={formatLocation}
          formatDate={formatTimestamp}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  loading: { ...typography.body, textAlign: 'center', marginTop: spacing.xxl },
});
