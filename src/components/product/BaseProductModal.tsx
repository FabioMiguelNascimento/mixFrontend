import { useCallback, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { useCategories } from "../../hooks/useCategories";
import { useTags } from "../../hooks/useTags";
import { CreateProductPayload, UpdateProductPayload, productStatusEnum } from "../../schema/product.schema";
import { Product, ProductImage, SelectOption } from "../../types/product.types";
import { getProductStatusChipProps } from "../../utils/productStatusUtils";
import Chip from "../Chip";
import DropdownWrapper from "../DropdownWrapper";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "../MultiSelect";
import NumberInput from "../NumberInput";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";


interface BaseProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateProductPayload | UpdateProductPayload, newImages: File[]) => void;
  product: Product | null;
  isLoading: boolean;
}

const useProductModal = () => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);

  const { categories: allCategories } = useCategories({ 
    page: 1, 
    limit: 100, 
    sortBy: 'name', 
    sortOrder: 'asc' 
  });
  
  const { tags: allTags } = useTags({ 
    page: 1, 
    limit: 100, 
    sortBy: 'name', 
    sortOrder: 'asc' 
  });

  const categoryOptions: SelectOption[] = useMemo(() => 
    allCategories.map((cat) => ({ 
      value: cat.id, 
      label: cat.name 
    }))
  , [allCategories]);
  
  const tagOptions: SelectOption[] = useMemo(() => 
    allTags.map((tag) => ({ 
      value: tag.id, 
      label: tag.name 
    }))
  , [allTags]);

  const statusOptions: SelectOption[] = useMemo(() => 
    Object.values(productStatusEnum.enum).map(status => ({
      value: status,
      label: getProductStatusChipProps(status).text,
      icon: getProductStatusChipProps(status).icon,
    }))
  , []);

  const setImagesMemoized = useCallback((images: ProductImage[] | ((prev: ProductImage[]) => ProductImage[])) => {
    setImages(images);
  }, []);

  const setIsImageManagerOpenMemoized = useCallback((isOpen: boolean) => {
    setIsImageManagerOpen(isOpen);
  }, []);

  return {
    images,
    setImages: setImagesMemoized,
    isImageManagerOpen,
    setIsImageManagerOpen: setIsImageManagerOpenMemoized,
    categoryOptions,
    tagOptions,
    statusOptions,
  };
};

interface CommonProductFieldsProps {
  control: any;
  errors: any;
  watch: any;
  categoryOptions: SelectOption[];
  tagOptions: SelectOption[];
  statusOptions: SelectOption[];
  showStatus?: boolean;
}

const CommonProductFields: React.FC<CommonProductFieldsProps> = ({
  control,
  errors,
  watch,
  categoryOptions,
  tagOptions,
  statusOptions,
  showStatus = true,
}) => {
  const price = watch("price") || 0;
  const discount = watch("discount") || 0;
  const finalPrice = Math.max(0, price - discount);

  return (
    <>
      <div className="product-modal-section">
        <h3>Detalhes do Produto</h3>
        <div className="product-modal-details">
          <div className="form-group-full-width">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    {...field}
                    id="name"
                    error={errors.name?.message}
                  />
                </div>
              )}
            />
          </div>

              <div className="form-group-full-width">
                <Controller
                  name="sku"
                  control={control}
                  render={({ field }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input 
                        {...field} 
                        id="sku"
                        value={field.value || ""}
                        error={errors.sku?.message} 
                      />
                    </div>
                  )}
                />
              </div>

              <div className="form-group-full-width">
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        {...field}
                        id="description"
                        value={field.value || ""}
                        error={errors.description?.message}
                      />
                    </div>
                  )}
                />
              </div>          <div className="form-group-row">
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
                  onChange={(value) => field.onChange(value || undefined)}
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
            
            {showStatus && (
              <div className="status-field grid gap-2">
                <Label htmlFor="status">Status</Label>
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
            )}
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
    </>
  );
};

export {
  CommonProductFields, useProductModal, type BaseProductModalProps
};

