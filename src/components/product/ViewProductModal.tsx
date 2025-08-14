
import { Product, ProductStatus } from "../../schema/product.schema";
import { getProductStatusChipProps } from "../../utils/productStatusUtils";
import Button from "../Button";
import Chip from "../Chip";
import { ImageManagerInput } from "../ImageManager";
import Modal from "../Modal";

interface ViewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  product: Product | null;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="detail-item">
    <span className="detail-item-label">{label}</span>
    <span className="detail-item-value">{value}</span>
  </div>
);

export const ViewProductModal: React.FC<ViewProductModalProps> = ({ isOpen, onClose, onEdit, product }) => {
  if (!isOpen || !product) return null;

  const statusProps = getProductStatusChipProps(product.status as ProductStatus);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalhes de: ${product.name}`}>
      <div className="space-y-6">
        <div className="product-modal-section">
          <h3>Imagens</h3>
          <ImageManagerInput images={product.images || []} onOpenManager={() => {}} readOnly />
        </div>

        <div className="product-modal-section">
          <h3>Detalhes do Produto</h3>
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Nome" value={product.name} />
            <DetailItem label="SKU" value={product.sku || "N/A"} />
            <DetailItem label="Descrição" value={product.description || "N/A"} />
            <DetailItem label="Status" value={<Chip {...statusProps} />} />
            <DetailItem label="Preço" value={`R$ ${product.price.toFixed(2)}`} />
            <DetailItem label="Desconto" value={`R$ ${product.discount.toFixed(2)}`} />
            <DetailItem label="Preço Final" value={`R$ ${product.finalPrice.toFixed(2)}`} />
            <DetailItem label="Estoque" value={product.stock} />
          </div>
        </div>

        <div className="product-modal-section">
          <h3>Categorias e Tags</h3>
          <div className="flex gap-4">
            <DetailItem
              label="Categorias"
              value={
                <div className="flex flex-wrap gap-2">
                  {product.categories?.map((cat) => <Chip key={cat.id} text={cat.name} variant="secondary" />) || "Nenhuma"}
                </div>
              }
            />
            <DetailItem
              label="Tags"
              value={
                <div className="flex flex-wrap gap-2">
                  {product.tags?.map((tag) => <Chip key={tag.id} text={tag.name} variant="secondary" />) || "Nenhuma"}
                </div>
              }
            />
          </div>
        </div>

        {product.type === "BASKET" && (
           <div className="product-modal-section">
            <h3>Itens da Cesta</h3>
            {product.basketItems && product.basketItems.length > 0 ? (
              <table className="basket-items-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Qtd</th>
                  </tr>
                </thead>
                <tbody>
                  {product.basketItems.map((item) => (
                    <tr key={item.productId}>
                      <td>{item.product?.name}</td>
                      <td>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Nenhum item na cesta.</p>
            )}
          </div>
        )}
      </div>
      <div className="product-modal-actions mt-6">
        <Button onClick={onClose} variant="secondary">Fechar</Button>
        <Button onClick={onEdit}>Editar</Button>
      </div>
    </Modal>
  );
};
