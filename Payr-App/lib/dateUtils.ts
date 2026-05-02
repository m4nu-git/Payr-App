export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const timeStr = date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (startOfDate.getTime() === startOfToday.getTime()) {
    return `Today, ${timeStr}`;
  }
  if (startOfDate.getTime() === startOfYesterday.getTime()) {
    return `Yesterday, ${timeStr}`;
  }
  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return `${dateStr}, ${timeStr}`;
}

export function getDateLabel(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (startOfDate.getTime() === startOfToday.getTime()) return 'Today';
  if (startOfDate.getTime() === startOfYesterday.getTime()) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}
