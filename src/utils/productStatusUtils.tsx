import { MdCheckCircle, MdHourglassEmpty, MdArchive } from "react-icons/md";
import type { ProductStatus } from '../schema/product.schema';
import { productStatusEnum } from '../schema/product.schema';

interface ChipProps {
  text: string;
  variant: string;
  icon?: React.ReactNode;
}

export const getProductStatusChipProps = (status: ProductStatus): ChipProps => {
  switch (status) {
    case productStatusEnum.enum.ACTIVE:
      return { text: 'Ativo', variant: 'success', icon: <MdCheckCircle /> };
    case productStatusEnum.enum.DRAFT:
      return { text: 'Rascunho', variant: 'warning', icon: <MdHourglassEmpty /> };
    case productStatusEnum.enum.ARCHIVED:
      return { text: 'Arquivado', variant: 'default', icon: <MdArchive /> };
    default:
      return { text: 'Desconhecido', variant: 'default' };
  }
};
