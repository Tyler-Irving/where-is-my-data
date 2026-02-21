// Status color mapping
import { IssueStatus } from '@/types/datacenter';

export const STATUS_COLORS: Record<IssueStatus, string> = {
  'none': '#10b981',      // Green 500 - Emerald
  'low': '#fbbf24',       // Yellow 400 - Amber
  'medium': '#fb923c',    // Orange 400
  'high': '#f87171',      // Red 400
  'critical': '#dc2626',  // Red 600 - Deep Red
};

export const STATUS_COLORS_HOVER: Record<IssueStatus, string> = {
  'none': '#059669',      // Green 600
  'low': '#f59e0b',       // Yellow 500
  'medium': '#f97316',    // Orange 500
  'high': '#ef4444',      // Red 500
  'critical': '#b91c1c',  // Red 700
};

/**
 * Get color for a given status
 */
export function getStatusColor(status: IssueStatus): string {
  return STATUS_COLORS[status];
}

/**
 * Get opacity based on datacenter count
 */
export function getHexagonOpacity(datacenterCount: number): number {
  if (datacenterCount === 0) return 0.3;
  if (datacenterCount === 1) return 0.5;
  if (datacenterCount <= 3) return 0.65;
  return 0.8;
}

/**
 * Get status label for display
 */
export function getStatusLabel(status: IssueStatus): string {
  const labels: Record<IssueStatus, string> = {
    'none': 'No Issues',
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'critical': 'Critical',
  };
  return labels[status];
}
