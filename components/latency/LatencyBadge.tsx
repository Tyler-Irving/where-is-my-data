'use client';

import { Zap } from 'lucide-react';
import { useDatacenterStore } from '@/store/datacenterStore';
import { useLatencyStore } from '@/store/latencyStore';
import { calculateLatencyBetween, formatLatency, getLatencyColor } from '@/lib/utils/latency';

interface LatencyBadgeProps {
  datacenterId: string;
  className?: string;
}

export function LatencyBadge({ datacenterId, className = '' }: LatencyBadgeProps) {
  const datacenters = useDatacenterStore((state) => state.datacenters);
  const selectedForLatency = useLatencyStore((state) => state.selectedForLatency);
  
  // Only show if other datacenters are selected for latency
  const otherSelected = selectedForLatency.filter(id => id !== datacenterId);
  if (otherSelected.length === 0) return null;
  
  const currentDc = datacenters.find(dc => dc.id === datacenterId);
  if (!currentDc) return null;
  
  // Calculate average latency to other selected datacenters
  const latencies = otherSelected.map(otherId => {
    const otherDc = datacenters.find(dc => dc.id === otherId);
    if (!otherDc) return null;
    return calculateLatencyBetween(currentDc, otherDc);
  }).filter(Boolean);
  
  if (latencies.length === 0) return null;
  
  const avgLatency = latencies.reduce((sum, l) => sum + l!.estimatedLatencyMs, 0) / latencies.length;
  const color = getLatencyColor(avgLatency);
  
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-md bg-zinc-800/50 px-2 py-1 text-xs ${className}`}>
      <Zap className="h-3 w-3" style={{ color }} />
      <span className="font-medium" style={{ color }}>
        {formatLatency(avgLatency)}
      </span>
      <span className="text-zinc-400">avg</span>
    </div>
  );
}
