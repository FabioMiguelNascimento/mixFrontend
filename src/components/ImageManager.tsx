import React, { useEffect, useRef, useState } from 'react';
import { FaCamera, FaFolderOpen, FaGoogleDrive, FaPlus, FaStar, FaTrash } from 'react-icons/fa';
import DropdownWrapper from './DropdownWrapper';
import Modal from './Modal';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MdBrowseGallery } from 'react-icons/md';
import { ProductImage } from '../types/product.types';
import CameraModal from './CameraModal';

interface EditableProductImage extends ProductImage {
  file?: File;
}

interface SortableImageProps {
  image: EditableProductImage;
  onSelect: () => void;
  onDelete: () => void;
  onSetPrimary: () => void;
  isSelected: boolean;
  isPrimary: boolean;
}

const SortableImage: React.FC<SortableImageProps> = ({ image, onSelect, onDelete, onSetPrimary, isSelected, isPrimary }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`image-manager-thumbnail ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <img src={image.url} alt={`Thumbnail`} />
      <div className="thumbnail-overlay">
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="thumbnail-action-btn delete-btn"><FaTrash /></button>
        {!isPrimary && <button onClick={(e) => { e.stopPropagation(); onSetPrimary(); }} className="thumbnail-action-btn primary-btn"><FaStar /></button>}
      </div>
      {isPrimary && <div className="primary-indicator"><FaStar /></div>}
    </div>
  );
};

interface ImageManagerProps {
  isOpen: boolean;
  onClose: () => void;
  initialImages: ProductImage[];
  onSave: (images: EditableProductImage[]) => void;
}

const ImageManager: React.FC<ImageManagerProps> = ({ isOpen, onClose, initialImages, onSave }) => {
  const [managedImages, setManagedImages] = useState<EditableProductImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<EditableProductImage | null>(null);
  const [isCameraModalOpen, setCameraModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const imagesWithIds = initialImages.map((img, index) => ({ ...img, id: img.id || `temp-id-${index}-${Math.random()}` }));
    setManagedImages(imagesWithIds);
    if (imagesWithIds.length > 0) {
      setSelectedImage(imagesWithIds[0]);
    } else {
      setSelectedImage(null);
    }
  }, [initialImages, isOpen]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setManagedImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    onSave(managedImages);
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: EditableProductImage[] = Array.from(files).map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      key: `new-key-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      file: file,
    }));

    setManagedImages(prev => [...prev, ...newImages]);
  };

  const handleCameraCapture = (file: File) => {
    const newImage: EditableProductImage = {
      id: `camera-${Date.now()}`,
      key: `camera-key-${Date.now()}`,
      url: URL.createObjectURL(file),
      file: file,
    };

    setManagedImages(prev => [...prev, newImage]);
  };

  const handleDelete = (imageToDelete: EditableProductImage) => {
    const remainingImages = managedImages.filter(img => img.id !== imageToDelete.id);
    setManagedImages(remainingImages);

    if (selectedImage?.id === imageToDelete.id) {
      setSelectedImage(remainingImages.length > 0 ? remainingImages[0] : null);
    }
  };

  const handleSetPrimary = (imageToSet: EditableProductImage) => {
    const reorderedImages = [imageToSet, ...managedImages.filter(img => img.id !== imageToSet.id)];
    setManagedImages(reorderedImages);
  };

  const addImageOptions = [
    { value: 'device', label: 'Abrir do dispositivo', icon: <FaFolderOpen /> },
    { value: 'camera', label: 'Tirar foto', icon: <FaCamera /> },
    { value: 'drive', label: 'Pegar do Drive', icon: <FaGoogleDrive /> },
    { value: 'allPhotos', label: 'Todas as fotos', icon: <MdBrowseGallery /> }
  ];

  const handleAddImageSelect = (value: string) => {
    if (value === 'device') {
      fileInputRef.current?.click();
    }

    if (value === 'camera') {
      setCameraModalOpen(true);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Imagens do Produto">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="image-manager">
          <div className="image-manager-main">
            <div className="image-manager-preview">
              {selectedImage ? (
                <img src={selectedImage.url} alt='Preview' />
              ) : (
                <div className="no-preview">
                  <FaCamera />
                  <span>Nenhuma imagem selecionada</span>
                </div>
              )}
            </div>
            <div className="image-manager-gallery">
              <SortableContext items={managedImages.map(img => img.id)} strategy={rectSortingStrategy}>
                <div className="gallery-grid">
                  {managedImages.map((image) => (
                    <SortableImage
                      key={image.id}
                      image={image}
                      onSelect={() => setSelectedImage(image)}
                      onDelete={() => handleDelete(image)}
                      onSetPrimary={() => handleSetPrimary(image)}
                      isSelected={selectedImage?.id === image.id}
                      isPrimary={managedImages.length > 0 && managedImages[0].id === image.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          </div>
          <div className="image-manager-actions">
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/png, image/jpeg, image/webp"
            />
            <DropdownWrapper
              options={addImageOptions}
              onSelect={handleAddImageSelect}
              trigger={<button className="add-button"><FaPlus /> Adicionar Novas Imagens</button>}
            />
            <div>
              <button onClick={onClose} className="cancel-button">Cancelar</button>
              <button onClick={handleSave} className="save-button">Salvar</button>
            </div>
          </div>
        </div>
      </DndContext>

      { isCameraModalOpen && 
        <CameraModal 
          isOpen={isCameraModalOpen}
          onCapture={handleCameraCapture}
          onClose={() => setCameraModalOpen(false)}
        />
      }
    </Modal>
  );
};

interface ImageManagerInputProps {
    images: ProductImage[];
    onOpenManager: () => void;
}

export const ImageManagerInput: React.FC<ImageManagerInputProps> = ({ images, onOpenManager }) => {
    const primaryImage = images.length > 0 ? images[0] : null;

    return (
        <div className="image-manager-input" onClick={onOpenManager}>
            {primaryImage ? (
                <>
                    <img src={primaryImage.url} alt={'Imagem Principal'} />
                    {images.length > 1 && (
                        <div className="image-count-badge">+{images.length - 1}</div>
                    )}
                    <div className="input-overlay">
                        <span>Editar Imagens</span>
                    </div>
                </>
            ) : (
                <div className="input-placeholder">
                    <FaCamera />
                    <span>Selecionar Imagens</span>
                </div>
            )}
        </div>
    );
};

export default ImageManager;
