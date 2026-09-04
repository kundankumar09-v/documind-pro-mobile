export function getFileExtension(filename) {
  if (!filename) return '';
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export function truncate(str, len = 30) {
  if (!str || str.length <= len) return str;
  return str.slice(0, len) + '…';
}

export function getFileColor(ext) {
  const map = {
    pdf: '#f43f5e',
    docx: '#3b82f6',
    xlsx: '#10b981',
    xls: '#10b981',
    csv: '#06b6d4',
    txt: '#a855f7',
    md: '#a855f7',
    pptx: '#f59e0b',
    ipynb: '#f59e0b',
  };
  return map[ext] || '#a855f7';
}

export function getFileBgColor(ext) {
  const map = {
    pdf: 'rgba(244,63,94,0.12)',
    docx: 'rgba(37,99,235,0.12)',
    xlsx: 'rgba(16,185,129,0.12)',
    xls: 'rgba(16,185,129,0.12)',
    csv: 'rgba(6,182,212,0.12)',
    txt: 'rgba(168,85,247,0.12)',
    md: 'rgba(168,85,247,0.12)',
    pptx: 'rgba(245,158,11,0.12)',
    ipynb: 'rgba(245,158,11,0.14)',
  };
  return map[ext] || 'rgba(168,85,247,0.10)';
}

export const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'xlsx', 'xls', 'csv', 'txt', 'md', 'pptx', 'ipynb'];
export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'text/plain',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/json',
];
