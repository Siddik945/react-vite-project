import React, { useState, useMemo } from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSizeOptions?: number[]; // new
  defaultPageSize?: number; // new
}

export function Table<T extends object>({
  columns,
  data,
  pageSizeOptions = [5, 10, 20, 50],
  defaultPageSize = 5,
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);

  const totalPages = Math.ceil(data.length / pageSize);

  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, currentPage, pageSize]);

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrentPage(1); // reset page
  };

  return (
    <div className="w-full">
      {/* Page Size Selector */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm">Rows per page:</span>
        <select
          aria-label="State"
          value={pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          className="rounded border px-2 py-1 text-sm"
        >
          {pageSizeOptions.map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full overflow-hidden rounded-lg border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th key={String(col.accessor)} className="p-3 text-left text-sm font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {currentData.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t hover:bg-gray-50">
              {columns.map((col) => (
                <td key={String(col.accessor)} className="p-3 text-sm">
                  {col.render ? col.render(row) : String(row[col.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
        >
          Prev
        </button>

        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
