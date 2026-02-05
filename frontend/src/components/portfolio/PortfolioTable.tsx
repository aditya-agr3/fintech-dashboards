'use client';

import { memo, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ExpandedState,
  GroupingState,
} from '@tanstack/react-table';
import { StockWithMarketData } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  getGainLossClass,
} from '@/lib/formatters';

interface PortfolioTableProps {
  stocks: StockWithMarketData[];
}

const columnHelper = createColumnHelper<StockWithMarketData>();

// Chevron icons for sorting and expanding
const ChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUp = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const ChevronRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export const PortfolioTable = memo(function PortfolioTable({
  stocks,
}: PortfolioTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [grouping, setGrouping] = useState<GroupingState>(['sector']);
  const [expanded, setExpanded] = useState<ExpandedState>(true); // Expand all by default
  
  const columns = useMemo(
    () => [
      columnHelper.accessor('sector', {
        header: 'Sector',
        cell: (info) => (
          <Badge variant="info">{info.getValue()}</Badge>
        ),
        enableGrouping: true,
      }),
      columnHelper.accessor('name', {
        header: 'Stock Name',
        cell: (info) => (
          <div>
            <p className="font-medium text-slate-900">{info.getValue()}</p>
            <p className="text-xs text-slate-500">{info.row.original.symbol}</p>
          </div>
        ),
      }),
      columnHelper.accessor('nseCode', {
        header: 'NSE/BSE',
        cell: (info) => (
          <div className="text-sm">
            <span className="text-slate-900">{info.getValue()}</span>
            <span className="text-slate-400 mx-1">/</span>
            <span className="text-slate-500">{info.row.original.bseCode}</span>
          </div>
        ),
      }),
      columnHelper.accessor('purchasePrice', {
        header: 'Purchase Price',
        cell: (info) => (
          <span className="font-mono text-sm">{formatCurrency(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor('quantity', {
        header: 'Qty',
        cell: (info) => (
          <span className="font-mono text-sm">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('investment', {
        header: 'Investment',
        cell: (info) => (
          <span className="font-mono text-sm font-medium">
            {formatCurrency(info.getValue())}
          </span>
        ),
        aggregationFn: 'sum',
        aggregatedCell: ({ getValue }) => (
          <span className="font-mono text-sm font-semibold text-slate-900">
            {formatCurrency(getValue() as number)}
          </span>
        ),
      }),
      columnHelper.accessor('portfolioWeight', {
        header: 'Weight',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${Math.min(info.getValue(), 100)}%` }}
              />
            </div>
            <span className="text-xs text-slate-600">
              {formatNumber(info.getValue(), 1)}%
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('cmp', {
        header: 'CMP',
        cell: (info) => {
          const value = info.getValue();
          const hasError = info.row.original.errors.some((e) => e.source === 'yahoo');
          
          if (value === null) {
            return (
              <span className="text-slate-400 text-sm">
                {hasError ? 'Error' : 'Loading...'}
              </span>
            );
          }
          
          return (
            <span className="font-mono text-sm font-medium text-primary-600">
              {formatCurrency(value)}
            </span>
          );
        },
      }),
      columnHelper.accessor('presentValue', {
        header: 'Present Value',
        cell: (info) => {
          const value = info.getValue();
          
          if (value === null) {
            return <span className="text-slate-400 text-sm">—</span>;
          }
          
          return (
            <span className="font-mono text-sm font-medium">
              {formatCurrency(value)}
            </span>
          );
        },
        aggregationFn: 'sum',
        aggregatedCell: ({ getValue }) => {
          const value = getValue() as number | null;
          return (
            <span className="font-mono text-sm font-semibold text-slate-900">
              {value ? formatCurrency(value) : '—'}
            </span>
          );
        },
      }),
      columnHelper.accessor('gainLoss', {
        header: 'Gain/Loss',
        cell: (info) => {
          const value = info.getValue();
          const percent = info.row.original.gainLossPercent;
          
          if (value === null) {
            return <span className="text-slate-400 text-sm">—</span>;
          }
          
          const colorClass = getGainLossClass(value);
          
          return (
            <div className={colorClass}>
              <span className="font-mono text-sm font-semibold">
                {formatCurrency(value)}
              </span>
              {percent !== null && (
                <span className="text-xs ml-1">({formatPercent(percent)})</span>
              )}
            </div>
          );
        },
        aggregationFn: 'sum',
        aggregatedCell: ({ getValue }) => {
          const value = getValue() as number | null;
          if (value === null) return <span className="text-slate-400">—</span>;
          
          const colorClass = getGainLossClass(value);
          return (
            <span className={`font-mono text-sm font-semibold ${colorClass}`}>
              {formatCurrency(value)}
            </span>
          );
        },
      }),
      columnHelper.accessor('peRatio', {
        header: 'P/E',
        cell: (info) => {
          const value = info.getValue();
          const hasError = info.row.original.errors.some((e) => e.source === 'google');
          
          if (value === null) {
            return (
              <span className="text-slate-400 text-sm">
                {hasError ? 'N/A' : '—'}
              </span>
            );
          }
          
          return <span className="font-mono text-sm">{formatNumber(value, 1)}</span>;
        },
      }),
      columnHelper.accessor('latestEarnings', {
        header: 'Earnings',
        cell: (info) => {
          const value = info.getValue();
          
          if (!value) {
            return <span className="text-slate-400 text-sm">—</span>;
          }
          
          return (
            <span className="text-xs text-slate-600 truncate max-w-[100px]" title={value}>
              {value}
            </span>
          );
        },
      }),
    ],
    []
  );
  
  const table = useReactTable({
    data: stocks,
    columns,
    state: {
      sorting,
      grouping,
      expanded,
    },
    onSortingChange: setSorting,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: () => undefined,
  });
  
  return (
    <Card
      title="Portfolio Holdings"
      subtitle={`${stocks.length} stocks in portfolio`}
      action={
        <button
          onClick={() => setGrouping(grouping.length ? [] : ['sector'])}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          {grouping.length ? 'Ungroup' : 'Group by Sector'}
        </button>
      }
    >
      <CardContent noPadding>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-slate-200 bg-slate-50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-1 ${
                            header.column.getCanSort() ? 'cursor-pointer select-none hover:text-slate-900' : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === 'asc' && <ChevronUp />}
                          {header.column.getIsSorted() === 'desc' && <ChevronDown />}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.map((row) => {
                const isGrouped = row.getIsGrouped();
                
                return (
                  <tr
                    key={row.id}
                    className={`
                      ${isGrouped ? 'bg-slate-50 font-medium' : 'hover:bg-slate-50'}
                      transition-colors
                    `}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isGroupedCell = cell.getIsGrouped();
                      const isAggregated = cell.getIsAggregated();
                      const isPlaceholder = cell.getIsPlaceholder();
                      
                      return (
                        <td key={cell.id} className="px-4 py-3 text-sm">
                          {isGroupedCell ? (
                            <button
                              onClick={row.getToggleExpandedHandler()}
                              className="flex items-center gap-2 text-slate-900 font-semibold"
                            >
                              {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              <span className="text-slate-500 font-normal">
                                ({row.subRows.length})
                              </span>
                            </button>
                          ) : isAggregated ? (
                            flexRender(
                              cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          ) : isPlaceholder ? null : (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});
