import React, { useEffect, useState } from 'react';
import { useProductMutations } from '../hooks/useProductMutations';
import { Category } from '../schema/category.schema';
import { Product, ProductImage, UpdateProductInput } from '../schema/product.schema';
import { Tag } from '../schema/tag.schema';
import ConfirmationModal from './ConfirmationModal';
import ImageManager, { ImageManagerInput } from './ImageManager';
import Input from './Input';
import Modal from './Modal';
import { MultiSelect } from './MultiSelect';
import NumberInput from './NumberInput';
import Textarea from './Textarea';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  allCategories: Category[];
  allTags: Tag[];
  onProductUpdated: () => void;
  onProductDeleted: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  allCategories,
  allTags,
  onProductUpdated,
  onProductDeleted,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { updateProduct, deleteProduct, loading: updateLoading } = useProductMutations();

  const finalPrice = Math.max(0, price - discount);

  useEffect(() => {
    if (isOpen && product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setSku(product.sku || '');
      setPrice(product.price || 0);
      setDiscount(product.discount || 0);
      setStock(product.stock || 0);
      setSelectedCategoryIds(product.categories?.map(c => c.id) || []);
      setSelectedTagIds(product.tags?.map(t => t.id) || []);
      setProductImages(product.images || []);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleImagesSave = (newImages: ProductImage[]) => {
    setProductImages(newImages);
  };

  const handleSave = async () => {
    if (!name || price === undefined || stock === undefined || selectedCategoryIds.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const productToUpdate: UpdateProductInput = {
        name: name,
        description: description || '',
        sku: sku || '',
        price: price,
        discount: discount || 0,
        finalPrice: finalPrice,
        stock: stock,
        categoryIds: selectedCategoryIds,
        tagIds: selectedTagIds,
        images: productImages.map(img => ({ key: img.key })),
      };

      const updatedProduct = await updateProduct(product.id, productToUpdate);
      
      if (updatedProduct) {
        onProductUpdated();
        onClose();
      }
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      alert("Erro ao atualizar produto. Verifique o console para mais detalhes.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(product.id);
      onProductDeleted();
      onClose();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert("Erro ao excluir produto. Verifique o console para mais detalhes.");
    }
    setShowDeleteConfirm(false);
  };

  const categoryOptions = allCategories.map(cat => ({ value: cat.id, label: cat.name }));
  const tagOptions = allTags.map(tag => ({ value: tag.id, label: tag.name }));

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Editar Produto: ${product.name}`}>
        <div className="product-modal">
          <div className="product-modal-section">
            <h3>Detalhes do Produto</h3>
            <div className="product-modal-details">
              <div className="form-group-full-width">
                <label>Imagens:</label>
                <ImageManagerInput
                  images={productImages}
                  onOpenManager={() => setIsImageManagerOpen(true)}
                />
              </div>
              <div className="form-group-row">
                <Input
                  label="Nome:"
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="SKU:"
                  type="text"
                  name="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>
              <div className="form-group-full-width">
                <Textarea
                  label="Descrição:"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="form-group-row">
                <NumberInput
                  label="Preço:"
                  name="price"
                  value={price}
                  onChange={(value) => setPrice(value || 0)}
                  required
                  decimalSeparator=","
                />
                <NumberInput
                  label="Desconto:"
                  name="discount"
                  value={discount}
                  onChange={(value) => setDiscount(value || 0)}
                  decimalSeparator=","
                />
              </div>
              <div className="form-group-row">
                <NumberInput
                  label="Estoque:"
                  name="stock"
                  value={stock}
                  onChange={(value) => setStock(value || 0)}
                  required
                />
                <div className="form-group">
                  <NumberInput
                    label="Valor Final:"
                    value={finalPrice}
                    disabled={true}
                    decimalSeparator=","
                  />
                </div>
              </div>
              <div className="multi-select-group">
                <MultiSelect
                  label="Categorias:"
                  options={categoryOptions}
                  selected={selectedCategoryIds}
                  onSelectionChange={setSelectedCategoryIds}
                  placeholder="Selecionar categorias..."
                  variant="pills"
                  maxDisplayed={5}
                />
                <MultiSelect
                  label="Tags:"
                  options={tagOptions}
                  selected={selectedTagIds}
                  onSelectionChange={setSelectedTagIds}
                  placeholder="Selecionar tags..."
                  variant="compact"
                  maxDisplayed={5}
                />
              </div>
            </div>
          </div>

          <div className="product-modal-actions">
            <button onClick={handleSave} className="save-button" disabled={updateLoading}>
              {updateLoading ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="delete-button">
              Excluir
            </button>
          </div>
        </div>
      </Modal>

      <ImageManager
        isOpen={isImageManagerOpen}
        onClose={() => setIsImageManagerOpen(false)}
        initialImages={productImages}
        onSave={handleImagesSave}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o produto "${product.name}"?`}
      />
    </>
  );
};

export default EditProductModal;
