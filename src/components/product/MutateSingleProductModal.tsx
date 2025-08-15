import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { useCategories } from "../../hooks/useCategories";
import { useTags } from "../../hooks/useTags";
import { Product, ProductImage, productStatusEnum } from "../../schema/product.schema";

import { getProductStatusChipProps } from "../../utils/productStatusUtils";
import Button from "../Button";
import Chip from "../Chip";
import DropdownWrapper from "../DropdownWrapper";
import ImageManager, { ImageManagerInput } from "../ImageManager";
import Input from "../Input";
import Modal from "../Modal";
import { MultiSelect } from "../MultiSelect";
import NumberInput from "../NumberInput";
import Textarea from "../Textarea";

const mutateProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  description: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  price: z
    .number({ error: "Preço é obrigatório." })
    .min(0.01, "Preço deve ser maior que zero."),
  discount: z
    .number({ error: "Desconto é obrigatório." })
    .min(0, "Desconto não pode ser negativo.")
    .optional(),
  stock: z
    .number({ error: "Estoque é obrigatório." })
    .int("Estoque deve ser um número inteiro.")
    .min(0, "Estoque não pode ser negativo."),
  categoryIds: z.array(z.string()).min(1, "Selecione ao menos uma categoria."),
  tagIds: z.array(z.string()).optional(),
  status: productStatusEnum.default('DRAFT').nonoptional(),
});

type MutateProductFormValues = z.infer<typeof mutateProductSchema>;

interface MutateSingleProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  product: Product | null;
  isLoading: boolean;
}

export const MutateSingleProductModal: React.FC<
  MutateSingleProductModalProps
> = ({ isOpen, onClose, onSave, product, isLoading }) => {
  const isEditMode = !!product;
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<MutateProductFormValues>({
    resolver: zodResolver(mutateProductSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      price: 0,
      discount: 0,
      stock: 0,
      categoryIds: [],
      tagIds: [],
      status: productStatusEnum.enum.DRAFT,
    },
  });

  const [images, setImages] = useState<ProductImage[]>([]);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);

  const { categories: allCategories } = useCategories({
    page: 1,
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
  });
  const { tags: allTags } = useTags({
    page: 1,
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
  });

  const categoryOptions = allCategories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));
  const tagOptions = allTags.map((tag) => ({ value: tag.id, label: tag.name }));

  const statusOptions = Object.values(productStatusEnum.enum).map(status => ({
    value: status,
    label: getProductStatusChipProps(status).text,
    icon: getProductStatusChipProps(status).icon,
  }));

  const price = watch("price");
  const discount = watch("discount");
  const finalPrice = Math.max(0, (price || 0) - (discount || 0));

  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          name: product.name,
          description: product.description || "",
          sku: product.sku || "",
          price: product.price,
          discount: product.discount || 0,
          stock: product.stock,
          categoryIds: product.categories?.map((c) => c.id) || [],
          tagIds: product.tags?.map((t) => t.id) || [],
          status: product.status,
        });
        setImages(product.images || []);
      } else {
        reset({
          name: "",
          description: "",
          sku: "",
          price: 0,
          discount: 0,
          stock: 0,
          categoryIds: [],
          tagIds: [],
          status: productStatusEnum.enum.DRAFT,
        });
        setImages([]);
      }
    }
  }, [product, isOpen, reset]);

  const handleFormSubmit = (data: MutateProductFormValues) => {
    const payload = {
      ...data,
      id: product?.id,
      images: images.map((img) => ({ key: img.key })),
      finalPrice: finalPrice,
      type: "SINGLE",
    };
    onSave(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Editar Produto" : "Criar Novo Produto"}
    >
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
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Nome"
                      error={errors.name?.message}
                    />
                  )}
                />
              </div>

              <div className="form-group-full-width">
                <Controller
                  name="sku"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="SKU" error={errors.sku?.message} />
                  )}
                />
              </div>

              <div className="form-group-full-width">
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Descrição"
                      error={errors.description?.message}
                    />
                  )}
                />
              </div>

              <div className="form-group-row">
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      label="Preço"
                      onChange={(value) => field.onChange(value)}
                      error={errors.price?.message}
                    />
                  )}
                />
                <Controller
                  name="discount"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      label="Desconto"
                      onChange={(value) => field.onChange(value)}
                      error={errors.discount?.message}
                    />
                  )}
                />
              </div>

              <div className="form-group-row">
                <Controller
                  name="stock"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      label="Estoque"
                      onChange={(value) => field.onChange(value)}
                      error={errors.stock?.message}
                    />
                  )}
                />
                <div className="status-field">
                  <label htmlFor="">Status</label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => {
                      const currentStatusProps = getProductStatusChipProps(field.value);
                      return (
                        <DropdownWrapper
                          trigger={
                            <Chip
                              text={currentStatusProps.text}
                              variant={currentStatusProps.variant}
                              icon={currentStatusProps.icon}
                            />
                          }
                          options={statusOptions}
                          onSelect={field.onChange}
                        />
                      );
                    }}
                  />
                </div>
              </div>

              <div className="multi-select-group">
                <Controller
                  name="categoryIds"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      label="Categorias"
                      options={categoryOptions}
                      selected={field.value || []}
                      onSelectionChange={field.onChange}
                      placeholder="Selecionar categorias..."
                      error={errors.categoryIds?.message}
                    />
                  )}
                />
                <Controller
                  name="tagIds"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      label="Tags"
                      options={tagOptions}
                      selected={field.value || []}
                      onSelectionChange={field.onChange}
                      placeholder="Selecionar tags..."
                      error={errors.tagIds?.message}
                    />
                  )}
                />
              </div>
              <div className="form-group-full-width">
                <NumberInput label="Valor Final" value={finalPrice} disabled />
              </div>
            </div>
          </div>

          <div className="product-modal-actions">
            <Button type="button" onClick={onClose} variant="secondary">
              Cancelar
            </Button>
            <Button type="submit" loading={isLoading}>
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
