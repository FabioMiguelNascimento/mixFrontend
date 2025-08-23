import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { CreateProductPayload, SingleProductFormValues, UpdateProductPayload, singleProductFormSchema } from "../../schema/product.schema";
import { Button } from "@/components/ui/button";
import ImageManager, { ImageManagerInput } from "../ImageManager";
import Modal from "../Modal";
import { BaseProductModalProps, CommonProductFields, useProductModal } from "./BaseProductModal";
import { Loader2 } from "lucide-react";

export const MutateSingleProductModal: React.FC<BaseProductModalProps> = ({
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
    formState: { errors },
  } = useForm<SingleProductFormValues>({
    resolver: zodResolver(singleProductFormSchema),
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
      type: 'SINGLE',
    },
  });

  const price = watch("price") || 0;
  const discount = watch("discount") || 0;
  const finalPrice = Math.max(0, price - discount);

  useEffect(() => {
    if (isOpen) {
      if (product) {
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
          type: 'SINGLE',
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
          type: 'SINGLE',
        });
        modalState.setImages([]);
      }
    }
  }, [product, isOpen, reset, modalState.setImages]);

  const handleFormSubmit = (data: SingleProductFormValues) => {
    const newImages = modalState.images.filter(img => img.file);
    const existingImages = modalState.images.filter(img => !img.file);

    const payload: CreateProductPayload | UpdateProductPayload = {
      ...data,
      ...(product?.id && { id: product.id }),
      images: existingImages.map((img) => ({ key: img.key })),
      finalPrice: finalPrice,
    };
    onSave(payload, newImages.map(img => img.file as File));
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

          <div className="product-modal-actions">
            <Button type="button" onClick={onClose} variant="secondary">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />}
              {isEditMode ? "Salvar Alterações" : "Criar Produto"}
            </Button>
          </div>
        </form>

        <ImageManager
          isOpen={modalState.isImageManagerOpen}
          onClose={() => modalState.setIsImageManagerOpen(false)}
          initialImages={modalState.images}
          onSave={modalState.setImages}
        />
      </div>
    </Modal>
  );
};
