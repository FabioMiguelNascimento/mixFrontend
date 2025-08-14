import { useEffect, useState } from "react";
import { useProductImages } from "../hooks/useProductImages";
import { useUpdateProductStatus } from "../hooks/useUpdateProductStatus";
import { Category } from "../schema/category.schema";
import { Product, ProductImage, ProductStatus, productStatusEnum } from "../schema/product.schema";
import { Tag } from "../schema/tag.schema";
import { getProductStatusChipProps } from "../utils/productStatusUtils";
import Chip from "./Chip";
import ConfirmationModal from "./ConfirmationModal";
import DropdownWrapper from "./DropdownWrapper";
import ImageManager, { ImageManagerInput } from "./ImageManager";
import Input from "./Input";
import Modal from "./Modal";
import { MultiSelect } from "./MultiSelect";
import NumberInput from "./NumberInput";
import Textarea from "./Textarea";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (product: Product) => Promise<Product>;
  onDelete: (productId: string) => void;
  allCategories: Category[];
  allTags: Tag[];
  onStatusChange: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product, onSave, onDelete, allCategories, allTags, onStatusChange }) => {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);

  const [currentStatus, setCurrentStatus] = useState<ProductStatus>(product?.status || productStatusEnum.enum.DRAFT);
  const [isConfirmStatusModalOpen, setIsConfirmStatusModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ProductStatus | null>(null);
  const { updateStatus, loading: updateStatusLoading, error: updateStatusError } = useUpdateProductStatus();
  const { uploadImage, deleteImage, loading: imageLoading, error: imageError } = useProductImages();

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        categories: product.categories || [],
        tags: product.tags || [],
        images: product.images || [],
      });
      setSelectedCategoryIds(product.categories?.map(c => c.id) || []);
      setSelectedTagIds(product.tags?.map(t => t.id) || []);
      setCurrentStatus(product.status);
    } else {
      setFormData({
        name: '',
        description: '',
        sku: '',
        price: 0,
        discount: 0,
        finalPrice: 0,
        stock: 0,
        type: 'SINGLE',
        status: productStatusEnum.enum.DRAFT,
        images: [],
        basketItems: [],
        categories: [],
        tags: [],
      });
      setSelectedCategoryIds([]);
      setSelectedTagIds([]);
      setCurrentStatus(productStatusEnum.enum.DRAFT);
    }
  }, [product]);

  useEffect(() => {
    const price = formData.price || 0;
    const discount = formData.discount || 0;
    const calculatedFinalPrice = Math.max(0, price - discount);

    if (formData.finalPrice !== calculatedFinalPrice) {
      setFormData(prev => ({ ...prev, finalPrice: calculatedFinalPrice }));
    }
  }, [formData.price, formData.discount, formData.finalPrice]);

  if (!isOpen) return null;

  const isNewProduct = !product?.id;
  const title = isNewProduct ? 'Adicionar Novo Produto' : `Editar Produto: ${product?.name}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleCategoryChange = (selectedIds: string[]) => {
    setSelectedCategoryIds(selectedIds);
    const selectedCategories = allCategories.filter(cat => selectedIds.includes(cat.id));
    setFormData(prev => ({
      ...prev,
      categories: selectedCategories,
    }));
  };

  const handleTagChange = (selectedIds: string[]) => {
    setSelectedTagIds(selectedIds);
    const selectedTags = allTags.filter(tag => selectedIds.includes(tag.id));
    setFormData(prev => ({
      ...prev,
      tags: selectedTags,
    }));
  };

  const handleImagesSave = (newImages: ProductImage[]) => {
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleSave = async () => {
    if (!formData.name || formData.price === undefined || formData.stock === undefined || !formData.type) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const savedProduct = await onSave(formData as Product);
      const currentProductId = savedProduct.id;

      const initialImages = product?.images || [];
      const currentImages = formData.images || [];

      const imagesToUpload = currentImages.filter(img => img.file);
      const imagesToDelete = initialImages.filter(img => !currentImages.some(cImg => cImg.id === img.id));

      await Promise.all(imagesToDelete.map(img => deleteImage(img.id)));

      const uploadedImages = await Promise.all(
        imagesToUpload.map(async (img) => {
          if (img.file) {
            return uploadImage(currentProductId, img.file);
          }
          return Promise.resolve(undefined);
        })
      ).then(results => results.filter(Boolean) as ProductImage[]);

      const finalImagesForProduct = currentImages.map(currentImg => {
        if (currentImg.file) {
          const uploaded = uploadedImages.find(uploadedImg => uploadedImg?.altText === currentImg.altText && uploadedImg?.url === currentImg.url);
          return uploaded || currentImg;
        } else {
          return initialImages.find(initialImg => initialImg.id === currentImg.id);
        }
      }).filter(Boolean) as ProductImage[];

      const finalImagePayload = finalImagesForProduct.map(img => ({
        id: img.id,
        key: img.key,
      }));

      await onSave({ ...savedProduct, images: finalImagePayload });

      onClose();
      onStatusChange();
    } catch (error) {
      console.error("Erro ao salvar produto e imagens:", error);
      alert("Erro ao salvar produto e imagens. Verifique o console para mais detalhes.");
    }
  };

  const handleDelete = () => {
    if (product?.id) {
      onDelete(product.id);
    }
  };

  const statusOptions = Object.values(productStatusEnum.enum).map(status => ({
    value: status,
    label: getProductStatusChipProps(status).text,
    icon: getProductStatusChipProps(status).icon,
  }));

  const confirmStatusChange = async () => {
    setIsConfirmStatusModalOpen(false);
    if (!product?.id || !pendingStatus) return;

    setCurrentStatus(pendingStatus);

    const result = await updateStatus(product.id, pendingStatus);
    if (result) {
      setFormData(prev => ({ ...prev, status: pendingStatus }));
      onStatusChange();
    } else {
      console.error('Failed to update status.', updateStatusError);
      setCurrentStatus(product.status);
    }
    setPendingStatus(null);
  };

  const cancelStatusChange = () => {
    setIsConfirmStatusModalOpen(false);
    setPendingStatus(null);
  };

  const handleStatusChange = (newStatusValue: string) => {
    const newStatus = newStatusValue as ProductStatus;
    setPendingStatus(newStatus);
    setIsConfirmStatusModalOpen(true);
  };

  const categoryOptions = allCategories.map(cat => ({ value: cat.id, label: cat.name }));
  const tagOptions = allTags.map(tag => ({ value: tag.id, label: tag.name }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="product-modal">
        {formData.type === 'BASKET' && (
          <div className="product-modal-section">
            <h3>Itens da Cesta</h3>
            {formData.basketItems && formData.basketItems.length > 0 ? (
              <table className="basket-items-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Preço Unit.</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.basketItems.map((item, index) => (
                    <tr key={item.productId || index}>
                      <td>{item.product?.name}</td>
                      <td>{item.quantity}</td>
                      <td>R$ {item.product?.finalPrice?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Nenhum item na cesta.</p>
            )}
          </div>
        )}

        <div className="product-modal-section">
          <h3>Detalhes do Produto</h3>
          <div className="product-modal-details">
            <div className="form-group-full-width">
              <label>Imagens:</label>
              <ImageManagerInput
                images={formData.images || []}
                onOpenManager={() => setIsImageManagerOpen(true)}
              />
            </div>
            <div className="form-group-row">
              <Input
                label="Nome:"
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
              />
              <Input
                label="SKU:"
                type="text"
                name="sku"
                value={formData.sku || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group-full-width">
              <Textarea
                label="Descrição:"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group-row">
              <NumberInput
                label="Preço:"
                name="price"
                value={formData.price}
                onChange={(value) => setFormData(prev => ({ ...prev, price: value }))}
                required
                decimalSeparator=","
              />
              <NumberInput
                label="Desconto:"
                name="discount"
                value={formData.discount}
                onChange={(value) => setFormData(prev => ({ ...prev, discount: value }))}
                decimalSeparator=","
              />
            </div>
            <div className="form-group-row">
              <NumberInput
                label="Estoque:"
                name="stock"
                value={formData.stock}
                onChange={(value) => setFormData(prev => ({ ...prev, stock: value }))}
                required
              />
              <div className="form-group">
                <label>Status:</label>
                <DropdownWrapper
                  trigger={
                    <Chip
                      text={updateStatusLoading ? 'Atualizando...' : getProductStatusChipProps(currentStatus).text}
                      variant={getProductStatusChipProps(currentStatus).variant}
                      icon={getProductStatusChipProps(currentStatus).icon}
                      style={{ cursor: updateStatusLoading ? 'wait' : 'pointer' }}
                    />
                  }
                  options={statusOptions}
                  onSelect={handleStatusChange}
                />
                {updateStatusError && <span style={{ color: 'red' }}>Erro: {updateStatusError.message}</span>}
              </div>
            </div>
            <div className="multi-select-group">
              <MultiSelect
                label="Categorias:"
                options={categoryOptions}
                selected={selectedCategoryIds}
                onSelectionChange={handleCategoryChange}
                placeholder="Selecionar categorias..."
                variant="pills"
                maxDisplayed={5}
              />
              <MultiSelect
                label="Tags:"
                options={tagOptions}
                selected={selectedTagIds}
                onSelectionChange={handleTagChange}
                placeholder="Selecionar tags..."
                variant="compact"
                maxDisplayed={5}
              />
            </div>
            <div className="form-group-full-width">
            <NumberInput
              label="Valor total"
              decimalSeparator=","
              placeholder="e.g., 123,45"
              value={formData.finalPrice}
              disabled={true}
            />
            </div>
          </div>
          </div>

        <ImageManager
          isOpen={isImageManagerOpen}
          onClose={() => setIsImageManagerOpen(false)}
          initialImages={formData.images || []}
          onSave={handleImagesSave}
        />

        <ConfirmationModal
          isOpen={isConfirmStatusModalOpen}
          onClose={cancelStatusChange}
          onConfirm={confirmStatusChange}
          title="Confirmar Alteração de Status"
          message={`Tem certeza que deseja alterar o status do produto para '${pendingStatus ? statusOptions.find(opt => opt.value === pendingStatus)?.label : ''}'?`}
        />

        <div className="product-modal-actions">
          <button onClick={handleSave} className="save-button">Salvar</button>
          {!isNewProduct && (
            <button onClick={handleDelete} className="delete-button">Excluir</button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProductModal;