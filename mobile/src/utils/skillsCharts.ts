export type ChartDatum = { label: string; value: number; color?: string };

const CHART_COLORS = [
  '#16C964',
  '#4F6BF6',
  '#CA8A04',
  '#EA580C',
  '#8B5CF6',
  '#06B6D4',
  '#EC4899',
  '#64748B',
];

const CATEGORY_RULES: { label: string; keys: string[] }[] = [
  { label: 'Languages', keys: ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust', 'kotlin', 'swift', 'php', 'ruby', 'scala', 'r '] },
  { label: 'Web & mobile', keys: ['react', 'angular', 'vue', 'next', 'node', 'html', 'css', 'flutter', 'android', 'ios', 'django', 'flask', 'spring'] },
  { label: 'Data & ML', keys: ['sql', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'keras', 'spark', 'tableau', 'power bi', 'machine learning', 'deep learning', 'nlp', 'data'] },
  { label: 'Cloud & DevOps', keys: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'terraform', 'linux', 'git', 'devops'] },
];

export function parseSkillsList(raw?: string): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw.replace(/'/g, '"'));
    if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
  } catch {
    /* fall through */
  }
  return raw
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((s) => s.replace(/^['"\s]+|['"\s]+$/g, '').trim())
    .filter(Boolean);
}

export function skillsToBarData(skills: string[], limit = 8): ChartDatum[] {
  return skills.slice(0, limit).map((label, i) => ({
    label: label.length > 14 ? `${label.slice(0, 12)}…` : label,
    value: 1,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));
}

export function skillsCoveragePie(detected: string[], recommended: string[]): ChartDatum[] {
  const data: ChartDatum[] = [];
  if (detected.length) {
    data.push({ label: 'Detected', value: detected.length, color: CHART_COLORS[0] });
  }
  if (recommended.length) {
    data.push({ label: 'To add', value: recommended.length, color: CHART_COLORS[3] });
  }
  return data;
}

function categorizeSkill(skill: string): string | null {
  const s = skill.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keys.some((k) => s.includes(k))) return rule.label;
  }
  return null;
}

export function skillsCategoryHistogram(skills: string[]): ChartDatum[] {
  const counts: Record<string, number> = {};
  for (const skill of skills) {
    const cat = categorizeSkill(skill);
    if (!cat) continue;
    counts[cat] = (counts[cat] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([label, value], i) => ({
      label,
      value,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);
}

export function aggregateSkillsFromRecords(
  records: { actual_skills?: string }[],
  limit = 10,
): ChartDatum[] {
  const counts: Record<string, number> = {};
  for (const row of records) {
    for (const skill of parseSkillsList(row.actual_skills)) {
      const key = skill.trim();
      if (key) counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value], i) => ({
      label: label.length > 14 ? `${label.slice(0, 12)}…` : label,
      value,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
}

export function aggregateSkillsHistogram(records: { actual_skills?: string }[]): ChartDatum[] {
  const all: string[] = [];
  for (const row of records) {
    all.push(...parseSkillsList(row.actual_skills));
  }
  return skillsCategoryHistogram(all);
}

export function chartItemsToData(items: { label: string; value: number }[]): ChartDatum[] {
  return items.map((item, i) => ({
    ...item,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));
}
