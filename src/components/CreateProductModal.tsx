import React, { useEffect, useState } from 'react';
import { useProductMutations } from '../hooks/useProductMutations';
import { Category } from '../schema/category.schema';
import { CreateProductInput, ProductImage, ProductType, productStatusEnum } from '../schema/product.schema';
import { Tag } from '../schema/tag.schema';
import ImageManager, { ImageManagerInput } from './ImageManager';
import Input from './Input';
import Modal from './Modal';
import { MultiSelect } from './MultiSelect';
import NumberInput from './NumberInput';
import Textarea from './Textarea';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductType: ProductType;
  allCategories: Category[];
  allTags: Tag[];
  onProductCreated: () => void;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  initialProductType,
  allCategories,
  allTags,
  onProductCreated,
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

  const { createProduct, loading: createLoading } = useProductMutations();

  const finalPrice = Math.max(0, price - discount);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setSku('');
      setPrice(0);
      setDiscount(0);
      setStock(0);
      setSelectedCategoryIds([]);
      setSelectedTagIds([]);
      setProductImages([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImagesSave = (newImages: ProductImage[]) => {
    setProductImages(newImages);
  };

  const handleSave = async () => {
    if (!name || price === undefined || stock === undefined || selectedCategoryIds.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const productToCreate: CreateProductInput = {
        name: name,
        description: description || '',
        sku: sku || '',
        price: price,
        discount: discount || 0,
        finalPrice: finalPrice,
        stock: stock,
        type: initialProductType,
        status: productStatusEnum.enum.DRAFT,
        categoryIds: selectedCategoryIds,
        tagIds: selectedTagIds,
        images: productImages.map(img => ({ key: img.key })),
        basketItems: [],
      };

      const createdProduct = await createProduct(productToCreate);
      
      if (createdProduct) {
        onProductCreated();
        onClose();
      }
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      alert("Erro ao criar produto. Verifique o console para mais detalhes.");
    }
  };

  const categoryOptions = allCategories.map(cat => ({ value: cat.id, label: cat.name }));
  const tagOptions = allTags.map(tag => ({ value: tag.id, label: tag.name }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Novo Produto">
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

        <ImageManager
          isOpen={isImageManagerOpen}
          onClose={() => setIsImageManagerOpen(false)}
          initialImages={productImages}
          onSave={handleImagesSave}
        />

        <div className="product-modal-actions">
          <button onClick={handleSave} className="save-button" disabled={createLoading}>
            {createLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateProductModal;
