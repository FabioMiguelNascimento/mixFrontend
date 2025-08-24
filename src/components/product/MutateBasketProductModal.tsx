import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useProducts } from "../../hooks/useProducts";
import { basketProductFormSchema, BasketProductFormValues, CreateProductPayload, UpdateProductPayload } from "../../schema/product.schema";
import { SelectOption } from "../../types/product.types";
import { Button } from "@/components/ui/button";
import ImageManager, { ImageManagerInput } from "../ImageManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MultiSelect } from "../MultiSelect";
import NumberInput from "../NumberInput";
import { BaseProductModalProps, CommonProductFields, useProductModal } from "./BaseProductModal";
import { Loader2 } from "lucide-react";


interface BasketItemsManagerProps {
  basketItems: Array<{ productId: string; quantity: number }>;
  onChange: (items: Array<{ productId: string; quantity: number }>) => void;
  error?: string;
}

const BasketItemsManager: React.FC<BasketItemsManagerProps> = ({ 
  basketItems, 
  onChange, 
  error 
}) => {
  const { products: allProducts } = useProducts({ 
    page: 1, 
    limit: 100, 
    sortBy: 'name', 
    sortOrder: 'asc', 
    type: 'SINGLE' 
  });

  const productOptions: SelectOption[] = useMemo(() => 
    allProducts.map((prod) => ({ 
      value: prod.id, 
      label: prod.name 
    }))
  , [allProducts]);

  const selectedProductIds = useMemo(() => 
    basketItems.map(item => item.productId)
  , [basketItems]);

  const handleProductSelection = (selectedIds: string[]) => {
    const newItems = selectedIds.map(productId => {
      const existing = basketItems.find(item => item.productId === productId);
      return existing || { productId, quantity: 1 };
    });
    onChange(newItems);
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    const updatedItems = basketItems.map(item =>
      item.productId === productId 
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    );
    onChange(updatedItems);
  };

  return (
    <>
      <MultiSelect
        label="Produtos na Cesta"
        options={productOptions}
        selected={selectedProductIds}
        onSelectionChange={handleProductSelection}
        placeholder="Selecionar produtos para a cesta..."
        error={error}
      />

      {basketItems.length > 0 && (
        <div className="basket-items-quantities">
          <h4>Quantidades dos Produtos</h4>
          {basketItems.map((item) => {
            const product = allProducts.find(p => p.id === item.productId);
            return (
              <div key={item.productId} className="quantity-row">
                <span className="product-name">
                  {product?.name || 'Produto não encontrado'}
                </span>
                <NumberInput
                  value={item.quantity}
                  onChange={(value) => handleQuantityChange(item.productId, value || 1)}
                  label="Quantidade"
                  min={1}
                />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export const MutateBasketProductModal: React.FC<BaseProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  isLoading,
}) => {
  const isEditMode = !!product;
  const modalState = useProductModal();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BasketProductFormValues>({
    resolver: zodResolver(basketProductFormSchema),
    defaultValues: {
      name: "",
      description: undefined,
      sku: undefined,
      price: 0,
      discount: undefined,
      stock: 0,
      categoryIds: [],
      tagIds: [],
      status: 'DRAFT',
      type: 'BASKET',
      basketItems: [],
    },
  });

  const basketItems = watch("basketItems");
  const price = watch("price") || 0;
  const discount = watch("discount") || 0;
  const finalPrice = Math.max(0, price - discount);

  useEffect(() => {
    if (isOpen) {
      if (product && product.type === 'BASKET') {
        reset({
          name: product.name,
          description: product.description || undefined,
          sku: product.sku || undefined,
          price: product.price,
          discount: product.discount || undefined,
          stock: product.stock,
          categoryIds: product.categories?.map((c) => c.id) || [],
          tagIds: product.tags?.map((t) => t.id) || [],
          status: product.status,
          type: 'BASKET',
          basketItems: product.basketItems?.map(item => ({ 
            productId: item.productId, 
            quantity: item.quantity 
          })) || [],
        });
        modalState.setImages(product.images || []);
      } else {
        reset({
          name: "",
          description: undefined,
          sku: undefined,
          price: 0,
          discount: undefined,
          stock: 0,
          categoryIds: [],
          tagIds: [],
          status: 'DRAFT',
          type: 'BASKET',
          basketItems: [],
        });
        modalState.setImages([]);
      }
    }
  }, [product, isOpen, reset, modalState.setImages]);

  const handleFormSubmit = (data: BasketProductFormValues) => {
    const payload: CreateProductPayload | UpdateProductPayload = {
      ...data,
      ...(product?.id && { id: product.id }),
      images: modalState.images.map((img) => ({ key: img.key })),
      finalPrice: finalPrice,
    };
    onSave(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Cesta" : "Criar Nova Cesta"}</DialogTitle>
        </DialogHeader>
        <div className="product-modal">
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="product-modal-section">
              <h3>Imagens</h3>
              <div className="form-group-full-width">
                <ImageManagerInput
                  images={modalState.images}
                  onOpenManager={() => modalState.setIsImageManagerOpen(true)}
                />
              </div>
            </div>

            <CommonProductFields
              control={control}
              errors={errors}
              watch={watch}
              categoryOptions={modalState.categoryOptions}
              tagOptions={modalState.tagOptions}
              statusOptions={modalState.statusOptions}
              showStatus={true}
            />

            <div className="product-modal-section">
              <h3>Itens da Cesta</h3>
              <div className="form-group-full-width">
                <BasketItemsManager
                  basketItems={basketItems}
                  onChange={(items) => setValue("basketItems", items)}
                  error={errors.basketItems?.message}
                />
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <Button type="button" onClick={onClose} variant="secondary">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin" />}
                {isEditMode ? "Salvar Alterações" : "Criar Cesta"}
              </Button>
            </DialogFooter>
          </form>

          <ImageManager
            isOpen={modalState.isImageManagerOpen}
            onClose={() => modalState.setIsImageManagerOpen(false)}
            initialImages={modalState.images}
            onSave={modalState.setImages}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
