import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AnalysisRecord } from '../api/client';
import { colors, layout, radius, spacing, typography } from '../theme';
import { FeedCard } from './FeedCard';

const PAGE_SIZE = 8;

const COLUMNS: { key: string; label: string; width: number }[] = [
  { key: 'id', label: 'ID', width: 44 },
  { key: 'name', label: 'Name', width: 120 },
  { key: 'score', label: 'Score', width: 56 },
  { key: 'track', label: 'Track', width: 100 },
  { key: 'level', label: 'Level', width: 88 },
  { key: 'location', label: 'Location', width: 140 },
  { key: 'ip', label: 'IP', width: 110 },
  { key: 'source', label: 'Source', width: 72 },
  { key: 'date', label: 'Date', width: 130 },
];

type Props = {
  rows: AnalysisRecord[];
  formatName: (row: AnalysisRecord) => string;
  formatLocation: (row: AnalysisRecord) => string;
  formatDate: (ts?: string) => string;
  title?: string;
};

function cellValue(
  row: AnalysisRecord,
  key: string,
  formatName: Props['formatName'],
  formatLocation: Props['formatLocation'],
  formatDate: Props['formatDate'],
) {
  switch (key) {
    case 'id':
      return String(row.id);
    case 'name':
      return formatName(row);
    case 'score':
      return row.resume_score != null ? String(row.resume_score) : '—';
    case 'track':
      return row.predicted_field || '—';
    case 'level':
      return row.user_level || '—';
    case 'location':
      return formatLocation(row);
    case 'ip':
      return row.ip_address || '—';
    case 'source':
      return row.upload_source || '—';
    case 'date':
      return formatDate(row.timestamp);
    default:
      return '—';
  }
}

export function AdminDataTable({
  rows,
  formatName,
  formatLocation,
  formatDate,
  title = 'Analyses table',
}: Props) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [rows.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safePage]);

  const tableMinWidth = COLUMNS.reduce((sum, c) => sum + c.width, 0);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  if (!rows.length) {
    return (
      <FeedCard title={title} accent="checklist">
        <Text style={styles.empty}>No analyses yet.</Text>
      </FeedCard>
    );
  }

  return (
    <FeedCard
      title={title}
      subtitle={`${rows.length} records · page ${safePage} of ${totalPages}`}
      accent="checklist"
      noPadding
    >
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={{ minWidth: tableMinWidth }}>
          <View style={[styles.row, styles.headerRow]}>
            {COLUMNS.map((col) => (
              <Text key={col.key} style={[styles.headCell, { width: col.width }]}>
                {col.label}
              </Text>
            ))}
          </View>

          {pageRows.map((row, i) => (
            <View
              key={row.id}
              style={[styles.row, i < pageRows.length - 1 && styles.rowBorder]}
            >
              {COLUMNS.map((col) => (
                <Text
                  key={`${row.id}-${col.key}`}
                  style={[styles.cell, { width: col.width }]}
                  numberOfLines={2}
                >
                  {cellValue(row, col.key, formatName, formatLocation, formatDate)}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.pagination}>
        <Pressable
          onPress={goPrev}
          disabled={safePage <= 1}
          style={[styles.pageBtn, safePage <= 1 && styles.pageBtnDisabled]}
        >
          <Text style={[styles.pageBtnText, safePage <= 1 && styles.pageBtnTextDisabled]}>
            Previous
          </Text>
        </Pressable>

        <Text style={styles.pageInfo}>
          {safePage} / {totalPages}
        </Text>

        <Pressable
          onPress={goNext}
          disabled={safePage >= totalPages}
          style={[styles.pageBtn, safePage >= totalPages && styles.pageBtnDisabled]}
        >
          <Text
            style={[
              styles.pageBtnText,
              safePage >= totalPages && styles.pageBtnTextDisabled,
            ]}
          >
            Next
          </Text>
        </Pressable>
      </View>
    </FeedCard>
  );
}

const styles = StyleSheet.create({
  empty: { ...typography.body, padding: layout.cardPadding },
  row: { flexDirection: 'row', alignItems: 'center' },
  headerRow: {
    backgroundColor: colors.accentDark,
    minHeight: 40,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  headCell: {
    ...typography.captionBold,
    fontSize: 10,
    color: colors.textOnImage,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  cell: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: layout.cardPadding,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  pageBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    minWidth: 88,
    alignItems: 'center',
  },
  pageBtnDisabled: {
    opacity: 0.45,
    backgroundColor: colors.backgroundAlt,
  },
  pageBtnText: { ...typography.captionBold, color: colors.accent },
  pageBtnTextDisabled: { color: colors.textMuted },
  pageInfo: { ...typography.bodyStrong, flex: 1, textAlign: 'center' },
});
