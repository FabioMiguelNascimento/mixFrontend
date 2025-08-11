import { OrderStatus } from '../schema/order.schema';
import { MdCheckCircle, MdPending, MdHourglassEmpty, MdLocalShipping, MdCancel } from 'react-icons/md';
import React from 'react';

export const getStatusChipProps = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return { text: 'Pendente', variant: 'warning', icon: <MdPending /> };
    case OrderStatus.CONFIRMED:
      return { text: 'Confirmado', variant: 'info', icon: <MdHourglassEmpty /> };
    case OrderStatus.READY_FOR_PICKUP:
      return { text: 'Pronto para Retirada', variant: 'primary', icon: <MdLocalShipping /> };
    case OrderStatus.COMPLETED:
      return { text: 'Concluído', variant: 'success', icon: <MdCheckCircle /> };
    case OrderStatus.CANCELED:
      return { text: 'Cancelado', variant: 'danger', icon: <MdCancel /> };
    default:
      return { text: status, variant: 'default' };
  }
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
  const option = {
    value: status,
    label: status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()),
  };
  return option.label;
};