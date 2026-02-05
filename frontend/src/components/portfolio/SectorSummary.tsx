'use client';

import { memo, useMemo } from 'react';
import { SectorSummary as SectorSummaryType } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatPercent, getGainLossClass, getGainLossBgClass } from '@/lib/formatters';

interface SectorSummaryProps {
  sectors: SectorSummaryType[];
}

interface SectorRowProps {
  sector: SectorSummaryType;
}

const SectorRow = memo(function SectorRow({ sector }: SectorRowProps) {
  const gainLossClass = getGainLossClass(sector.gainLoss);
  const bgClass = getGainLossBgClass(sector.gainLoss);
  
  return (
    <div className={`p-4 rounded-lg ${bgClass} border border-slate-100`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900">{sector.sector}</h4>
          <p className="text-sm text-slate-500">
            {sector.stockCount} stock{sector.stockCount > 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 sm:gap-8 text-right">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Investment</p>
            <p className="font-medium text-slate-900">{formatCurrency(sector.totalInvestment)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Present</p>
            <p className="font-medium text-slate-900">
              {formatCurrency(sector.totalPresentValue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Gain/Loss</p>
            <p className={`font-semibold ${gainLossClass}`}>
              {formatCurrency(sector.gainLoss)}
              {sector.gainLossPercent !== null && (
                <span className="text-xs ml-1">
                  ({formatPercent(sector.gainLossPercent)})
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export const SectorSummaryComponent = memo(function SectorSummaryComponent({
  sectors,
}: SectorSummaryProps) {
  const sortedSectors = useMemo(() => {
    return [...sectors].sort((a, b) => b.totalInvestment - a.totalInvestment);
  }, [sectors]);
  
  return (
    <Card title="Sector Allocation" subtitle="Investment breakdown by sector">
      <CardContent>
        <div className="space-y-3">
          {sortedSectors.map((sector) => (
            <SectorRow key={sector.sector} sector={sector} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
