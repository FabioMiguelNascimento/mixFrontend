import { type ColumnDef, type PaginationState, type SortingState, useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, flexRender } from "@tanstack/react-table";
import React from "react";
import { MdArrowUpward, MdArrowDownward } from "react-icons/md";
import Button from "./Button";
import Spinner from "./Spinner";


interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  loading: boolean;
  error: Error | null;
  totalItems: number;
  pageIndex: number;
  pageSize: number;
  onPaginationChange: (updater: (prevState: PaginationState) => PaginationState) => void;
  onSortingChange: (updater: (prevState: SortingState) => SortingState) => void;
  onGlobalFilterChange: (updater: string | ((oldFilter: string) => string)) => void;
  globalFilter: string;
  renderRowActions?: (row: TData) => React.ReactNode;
  title?: string;
  onRowClick?: (row: TData) => void;
}

const DataTable = <TData extends object>({
  data,
  columns,
  loading,
  error,
  totalItems,
  pageIndex,
  pageSize,
  onPaginationChange,
  onSortingChange,
  onGlobalFilterChange,
  globalFilter,
  renderRowActions,
  title,
  onRowClick,
}: DataTableProps<TData>) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
      sorting,
      pagination: { pageIndex, pageSize },
    },
    onGlobalFilterChange,
    onSortingChange: setSorting,
    onPaginationChange,
    pageCount: Math.ceil(totalItems / pageSize),
  });

  React.useEffect(() => {
    onSortingChange(sorting);
  }, [sorting, onSortingChange]);

  if (loading) {
    return <div className="data-table-container"><Spinner /></div>;
  }

  if (error) {
    return <div className="data-table-container">Erro ao carregar dados: {error.message}</div>;
  }

  return (
    <div className="data-table-container">
      <h1>{title}</h1>
      <input
        type="text"
        value={globalFilter ?? ''}
        onChange={e => onGlobalFilterChange(e.target.value)}
        placeholder="Pesquisar em todas as colunas..."
      />
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : (
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? 'cursor-pointer select-none'
                          : '',
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: <MdArrowUpward />,
                        desc: <MdArrowDownward />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
              {renderRowActions && (
                <td>{renderRowActions(row.original)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination-controls">
        <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} variant="secondary" size="sm">
          Anterior
        </Button>
        <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} variant="secondary" size="sm">
          Próximo
        </Button>
        <span>
          Página
          <strong>
            {table.getState().pagination.pageIndex + 1} de {' '} {table.getPageCount()}
          </strong>
        </span>
      </div>
    </div>
  );
};

export default DataTable;
