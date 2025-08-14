
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { useCategories } from "../../hooks/useCategories";
import { useTags } from "../../hooks/useTags";
import { Product, ProductImage, baseProductSchema } from "../../schema/product.schema";

import Button from "../Button";
import ImageManager, { ImageManagerInput } from "../ImageManager";
import Input from "../Input";
import Modal from "../Modal";
import { MultiSelect } from "../MultiSelect";
import NumberInput from "../NumberInput";
import Textarea from "../Textarea";

// Zod schema for form validation
const mutateProductSchema = baseProductSchema.pick({
  name: true,
  description: true,
  sku: true,
  price: true,
  discount: true,
  stock: true,
  type: true,
});

type MutateProductFormValues = z.infer<typeof mutateProductSchema>;

interface MutateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void; // Simplified for now
  product: Product | null;
  isLoading: boolean;
}

export const MutateProductModal: React.FC<MutateProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  isLoading,
}) => {
  const isEditMode = !!product;
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<MutateProductFormValues>({
    resolver: zodResolver(mutateProductSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      price: 0,
      discount: 0,
      stock: 0,
      type: "SINGLE",
    },
  });

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);

  // Fetching categories and tags
  const { categories: allCategories } = useCategories({ limit: 100 });
  const { tags: allTags } = useTags({ limit: 100 });

  const price = watch("price");
  const discount = watch("discount");
  const finalPrice = Math.max(0, (price || 0) - (discount || 0));

  useEffect(() => {
    if (isOpen) {
      if (product) {
        // Edit mode
        reset({
          name: product.name,
          description: product.description || "",
          sku: product.sku || "",
          price: product.price,
          discount: product.discount || 0,
          stock: product.stock,
          type: product.type,
        });
        setSelectedCategoryIds(product.categories?.map((c) => c.id) || []);
        setSelectedTagIds(product.tags?.map((t) => t.id) || []);
        setImages(product.images || []);
      } else {
        // Create mode
        reset();
        setSelectedCategoryIds([]);
        setSelectedTagIds([]);
        setImages([]);
      }
    }
  }, [product, isOpen, reset]);

  const handleFormSubmit = (data: MutateProductFormValues) => {
    const payload = {
      ...data,
      id: product?.id,
      categoryIds: selectedCategoryIds,
      tagIds: selectedTagIds,
      images,
      finalPrice: finalPrice
    };
    onSave(payload);
  };

  const categoryOptions = allCategories.map((cat) => ({ value: cat.id, label: cat.name }));
  const tagOptions = allTags.map((tag) => ({ value: tag.id, label: tag.name }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Editar Produto" : "Criar Novo Produto"}>
      <div className="product-modal">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="product-modal-section">
            <h3>Imagens</h3>
            <div className="form-group-full-width">
              <ImageManagerInput
                images={images}
                onOpenManager={() => setIsImageManagerOpen(true)}
              />
            </div>
          </div>

          <div className="product-modal-section">
            <h3>Detalhes do Produto</h3>
            <div className="product-modal-details">
              <div className="form-group-full-width">
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input {...field} label="Nome" error={fieldState.error?.message} required />
                  )}
                />
              </div>

              <div className="form-group-full-width">
                 <Controller
                  name="sku"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input {...field} label="SKU" error={fieldState.error?.message} />
                  )}
                />
              </div>

              <div className="form-group-full-width">
                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Textarea {...field} label="Descrição" error={fieldState.error?.message} />
                  )}
                />
              </div>

              <div className="form-group-row">
                <Controller
                  name="price"
                  control={control}
                  render={({ field, fieldState }) => (
                    <NumberInput
                      {...field}
                      label="Preço"
                      onValueChange={field.onChange}
                      error={fieldState.error?.message}
                      required
                    />
                  )}
                />
                <Controller
                  name="discount"
                  control={control}
                  render={({ field, fieldState }) => (
                    <NumberInput
                      {...field}
                      label="Desconto"
                      onValueChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>

              <div className="form-group-row">
                <Controller
                  name="stock"
                  control={control}
                  render={({ field, fieldState }) => (
                    <NumberInput
                      {...field}
                      label="Estoque"
                      onValueChange={field.onChange}
                      error={fieldState.error?.message}
                      required
                    />
                  )}
                />
                <NumberInput
                    label="Valor Final"
                    value={finalPrice}
                    disabled
                  />
              </div>

              <div className="multi-select-group">
                <MultiSelect
                  label="Categorias"
                  options={categoryOptions}
                  selected={selectedCategoryIds}
                  onSelectionChange={setSelectedCategoryIds}
                  placeholder="Selecionar categorias..."
                />
                <MultiSelect
                  label="Tags"
                  options={tagOptions}
                  selected={selectedTagIds}
                  onSelectionChange={setSelectedTagIds}
                  placeholder="Selecionar tags..."
                />
              </div>
            </div>
          </div>

          <div className="product-modal-actions">
            <Button type="button" onClick={onClose} variant="secondary">
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {isEditMode ? "Salvar Alterações" : "Criar Produto"}
            </Button>
          </div>
        </form>

        <ImageManager
          isOpen={isImageManagerOpen}
          onClose={() => setIsImageManagerOpen(false)}
          initialImages={images}
          onSave={setImages}
        />
      </div>
    </Modal>
  );
};
