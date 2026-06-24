import React from 'react';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  headerClassName?: string;
  cellClassName?: string;
  headerTitle?: string;
  cell?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}

export const Table = <T extends { id: React.Key }>({ columns, data, onRowClick }: TableProps<T>) => {
  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto w-full relative">
      <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
        <thead className="bg-[#FFF9F2]/90 text-stone-500 sticky top-0 border-b border-orange-100 font-extrabold z-10 shadow-[0_1px_0_0_#ffedd5] backdrop-blur-[2px]">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-4 py-3.5 tracking-tight ${col.headerClassName || ''}`} title={col.headerTitle}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-stone-700 font-bold">
          {data.map((row) => (
            <tr 
              key={row.id} 
              onClick={() => onRowClick && onRowClick(row)}
              className="border-b border-stone-100 hover:bg-orange-50/50 transition-colors group cursor-pointer"
            >
              {columns.map((col, idx) => (
                <td key={idx} className={`px-4 py-[13px] text-[12px] ${col.cellClassName || ''}`}>
                  {col.cell ? col.cell(row) : (row[col.accessor as keyof T] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
