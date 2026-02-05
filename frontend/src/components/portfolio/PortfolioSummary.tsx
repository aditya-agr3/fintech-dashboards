'use client';

import { memo, useMemo } from 'react';
import { PortfolioData } from '@/types';
import { formatCurrency, formatPercent, getGainLossClass } from '@/lib/formatters';

interface PortfolioSummaryProps {
  data: PortfolioData;
}

interface SummaryCardProps {
  label: string;
  value: string;
  subValue?: string;
  className?: string;
  valueClassName?: string;
}

const SummaryCard = memo(function SummaryCard({
  label,
  value,
  subValue,
  className = '',
  valueClassName = 'text-slate-900',
}: SummaryCardProps) {
  return (
    <div className={`bg-white rounded-xl p-4 sm:p-6 border border-slate-200 ${className}`}>
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <p className={`text-xl sm:text-2xl font-bold ${valueClassName}`}>{value}</p>
      {subValue && <p className="text-sm text-slate-500 mt-1">{subValue}</p>}
    </div>
  );
});

export const PortfolioSummary = memo(function PortfolioSummary({
  data,
}: PortfolioSummaryProps) {
  const summaryCards = useMemo(() => {
    const gainLossClass = getGainLossClass(data.totalGainLoss);
    
    return [
      {
        label: 'Total Investment',
        value: formatCurrency(data.totalInvestment),
        subValue: `${data.stocks.length} stocks across ${data.sectors.length} sectors`,
      },
      {
        label: 'Present Value',
        value: formatCurrency(data.totalPresentValue),
        subValue: data.totalPresentValue !== null ? 'Live market value' : 'Awaiting data',
      },
      {
        label: 'Total Gain/Loss',
        value: formatCurrency(data.totalGainLoss),
        subValue: data.totalGainLossPercent !== null 
          ? formatPercent(data.totalGainLossPercent)
          : undefined,
        valueClassName: gainLossClass,
      },
    ];
  }, [data]);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {summaryCards.map((card) => (
        <SummaryCard
          key={card.label}
          label={card.label}
          value={card.value}
          subValue={card.subValue}
          valueClassName={card.valueClassName}
        />
      ))}
    </div>
  );
});
