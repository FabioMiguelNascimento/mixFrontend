import React, { useState } from 'react';
import { format } from 'date-fns';
import { OrderStatus, type Order } from '../schema/order.schema';
import Chip from './Chip';
import DropdownWrapper from './DropdownWrapper';
import ConfirmationModal from './ConfirmationModal';
import { useUpdateOrderStatus } from '../hooks/useUpdateOrderStatus';
import { getStatusChipProps, getOrderStatusLabel } from '../utils/orderStatusUtils.tsx';

interface OrderDetailsModalProps {
  order: Order | null;
  onOrderUpdated?: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onOrderUpdated }) => {
  if (!order) {
    return <p>Nenhum pedido selecionado.</p>;
  }

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const { updateStatus, loading, error } = useUpdateOrderStatus();

  const statusOptions = Object.values(OrderStatus).map(status => ({
    value: status,
    label: getStatusChipProps(status).text,
    icon: getStatusChipProps(status).icon,
  }));

  const confirmStatusChange = async () => {
    setIsConfirmModalOpen(false);
    if (!order || !pendingStatus) return;

    setCurrentStatus(pendingStatus);

    const result = await updateStatus(order.id, pendingStatus);
    if (result) {
      console.log('Status updated successfully:', result);
      onOrderUpdated?.();
    } else {
      console.error('Failed to update status.', error);
      setCurrentStatus(order.status);
    }
    setPendingStatus(null);
  };

  const cancelStatusChange = () => {
    setIsConfirmModalOpen(false);
    setPendingStatus(null);
  };

  const handleStatusChange = (newStatusValue: string) => {
    const newStatus = newStatusValue as OrderStatus;
    setPendingStatus(newStatus);
    setIsConfirmModalOpen(true);
  };

  return (
    <div className="order-details-modal">
      <div className="order-details-card">
        <div className="order-details-section">
          <h3>Informações Adicionais</h3>
          <p><strong>Contato:</strong> {order.customerContact}</p>
          {order.customerNotes && <p><strong>Observações:</strong> {order.customerNotes}</p>}
          <p><strong>Criado em:</strong> {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm:ss')}</p>
          <p><strong>Status:</strong>
            <DropdownWrapper
              trigger={
                <Chip
                  text={loading ? 'Atualizando...' : getStatusChipProps(currentStatus).text}
                  variant={getStatusChipProps(currentStatus).variant}
                  icon={getStatusChipProps(currentStatus).icon}
                  style={{ cursor: loading ? 'wait' : 'pointer' }}
                />
              }
              options={statusOptions}
              onSelect={handleStatusChange}
            />
            {error && <span style={{ color: 'red' }}>Erro: {error.message}</span>}
          </p>
        </div>
      </div>

      <div className="order-details-card">
        <div className="order-details-section">
          <h3>Itens do Pedido</h3>
          {order.orderItems && order.orderItems.length > 0 ? (
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Qtd</th>
                  <th>Preço Unit.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems.map((item) => (
                  <tr key={item.productId}>
                    <td>{item.product.name}</td>
                    <td>{item.quantity}</td>
                    <td>R$ {item.price.toFixed(2)}</td>
                    <td>R$ {(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Nenhum item no pedido.</p>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={cancelStatusChange}
        onConfirm={confirmStatusChange}
        title="Confirmar Alteração de Status"
        message={`Tem certeza que deseja alterar o status do pedido para '${pendingStatus ? statusOptions.find(opt => opt.value === pendingStatus)?.label : ''}'?`}
      />
    </div>
  );
};

export default OrderDetailsModal;
