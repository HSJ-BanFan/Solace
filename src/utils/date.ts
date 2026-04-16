/** 日期格式化工具 */

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0] ?? '';
}

export function formatDateTime(dateStr?: string): string {
  return dateStr ? new Date(dateStr).toLocaleString() : '';
}

export function formatShortDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

export function formatTimelineDate(dateStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 2) {
    return `${parts[0]}.${parts[1].padStart(2, '0')}`;
  }
  if (parts.length === 3) {
    return `${parts[0]}.${parts[1].padStart(2, '0')}.${parts[2].padStart(2, '0')}`;
  }
  return dateStr;
}

export function formatTags(tags?: { id: number; name: string }[]): string {
  return tags?.length ? tags.map((t) => `#${t.name}`).join(' ') : '';
}