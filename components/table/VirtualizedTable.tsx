'use client';

import { useMemo } from 'react';
import { TableVirtuoso } from 'react-virtuoso';
import type { ColumnMeta } from '@/lib/format';

interface VirtualizedTableProps {
  data: any[];
  columns: ColumnMeta[];
  maxHeight?: number;
}

export default function VirtualizedTable({
  data,
  columns,
  maxHeight = 520,
}: VirtualizedTableProps) {
  const columnNames = useMemo(() => columns.map((c) => c.name), [columns]);

  if (data.length === 0 || columns.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">داده‌ای برای نمایش وجود ندارد</p>
      </div>
    );
  }

  return (
    <div
      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
      style={{ height: maxHeight }}
    >
      <TableVirtuoso
        data={data}
        fixedHeaderContent={() => (
          <tr className="bg-gray-100 dark:bg-gray-700">
            {columnNames.map((name, idx) => (
              <th
                key={idx}
                className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 sticky top-0 bg-gray-100 dark:bg-gray-700"
              >
                {name}
              </th>
            ))}
          </tr>
        )}
        itemContent={(index, row) => (
          <>
            {columnNames.map((name, idx) => {
              const value = row[name];
              const displayValue =
                value === null || value === undefined ? '-' : String(value);

              return (
                <td
                  key={idx}
                  className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap"
                >
                  {displayValue.length > 50
                    ? displayValue.substring(0, 50) + '...'
                    : displayValue}
                </td>
              );
            })}
          </>
        )}
        components={{
          Table: ({ style, ...props }) => (
            <table
              {...props}
              style={{
                ...style,
                width: '100%',
                borderCollapse: 'collapse',
              }}
            />
          ),
          TableRow: (props) => <tr {...props} className="hover:bg-gray-50 dark:hover:bg-gray-700/50" />,
        }}
      />
    </div>
  );
}