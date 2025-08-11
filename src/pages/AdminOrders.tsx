import React, { useEffect, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import Button from '../components/Button';
import Chip from '../components/Chip';

import { useOrders } from '../hooks/useOrders';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import OrderDetailsModal from '../components/OrderDetailsModal';
import type { Order } from '../schema/order.schema';
import { OrderStatus } from '../schema/order.schema';

import { getStatusChipProps } from '../utils/orderStatusUtils.tsx';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';

const AdminOrders: React.FC = () => {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sorting, setSorting] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { orders, totalOrders, loading, error, refetch } = useOrders({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: sorting.length > 0 ? sorting[0].id : 'createdAt',
    sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc',
    globalFilter,
  });

  useEffect(() => {
    if (isModalOpen && selectedOrder) {
      const updatedOrder = orders.find(order => order.id === selectedOrder.id);
      if (updatedOrder && updatedOrder.status !== selectedOrder.status) {
        setSelectedOrder(updatedOrder);
      }
    }
  }, [orders, isModalOpen, selectedOrder]);

  const handleRefetch = () => {
    refetch();
  };

  const columnHelper = createColumnHelper<Order>();

  const columns = [
    columnHelper.accessor('id', {
      cell: info => info.getValue(),
      header: 'ID do Pedido',
      enableSorting: false,
    }),
    columnHelper.accessor('customerName', {
      cell: info => info.getValue(),
      header: 'Nome do Cliente',
      enableSorting: false,
    }),
    columnHelper.accessor('totalAmount', {
      cell: info => `R$ ${info.getValue().toFixed(2)}`,
      header: 'Total',
    }),
    columnHelper.accessor('status', {
      cell: info => {
        const status = info.getValue() as OrderStatus;
        const { text, variant, icon } = getStatusChipProps(status);

        return (
              <Chip
                text={text}
                variant={variant}
                icon={icon}
                style={{ cursor: 'pointer' }}
              />
        );
      },
      header: 'Status',
    }),
    columnHelper.accessor('createdAt', {
      cell: info => format(new Date(info.getValue()), 'dd/MM/yyyy HH:mm:ss'),
      header: 'Data de Criação',
    }),
  ];

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
      sorting,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    // @ts-ignore
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    pageCount: Math.ceil(totalOrders / pagination.pageSize),
  });

  if (loading) {
    return <div className="admin-orders-page"><Spinner /></div>;
  }

  if (error) {
    return <div className="admin-orders-page">Erro ao carregar pedidos: {error.message}</div>;
  }

  return (
    <div className="admin-orders-page">
      <h1>Pedidos</h1>
      <input
        type="text"
        value={globalFilter ?? ''}
        onChange={e => setGlobalFilter(e.target.value)}
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
              onClick={() => {
                setSelectedOrder(row.original);
                setIsModalOpen(true);
              }}
              style={{ cursor: 'pointer' }}
            >
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedOrder ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span>Pedido #{selectedOrder.id.substring(0, 8)} - {selectedOrder.customerName} (R$ {selectedOrder.totalAmount.toFixed(2)})</span>
          </div>
        ) : 'Detalhes do Pedido'}
        zIndex={1000}
      >
        <OrderDetailsModal order={selectedOrder} onOrderUpdated={handleRefetch} />
      </Modal>
    </div>
  );
};

export default AdminOrders;