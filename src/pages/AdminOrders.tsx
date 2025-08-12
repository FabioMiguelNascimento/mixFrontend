import React, { useEffect, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';

import { useOrders } from '../hooks/useOrders';
import Modal from '../components/Modal';
import OrderDetailsModal from '../components/OrderDetailsModal';
import type { Order } from '../schema/order.schema';
import { OrderStatus } from '../schema/order.schema';
import { getStatusChipProps } from '../utils/orderStatusUtils.tsx';
import Chip from '../components/Chip';
import DataTable from '../components/DataTable.tsx';

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


  return (
    <div className="admin-orders-page">
      <DataTable
        title="Pedidos"
        data={orders}
        columns={columns}
        loading={loading}
        error={error}
        totalItems={totalOrders}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onGlobalFilterChange={setGlobalFilter}
        globalFilter={globalFilter}
        onRowClick={(order) => {
          setSelectedOrder(order);
          setIsModalOpen(true);
        }}
      />

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
