import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Button } from '@/components/ui/button';
import type { Category } from '../schema/category.schema';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSave: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, category, onSave, onDelete }) => {
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    if (category) {
      setCategoryName(category.name);
    } else {
      setCategoryName('');
    }
  }, [category]);

  const handleSave = () => {
    if (category) {
      onSave({ ...category, name: categoryName });
    } else {
      onSave({ id: '', name: categoryName, createdAt: new Date(), updatedAt: new Date() });
    }
    onClose();
  };

  const handleDelete = () => {
    if (category) {
      onDelete(category.id);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? `Editar Categoria: ${category.name}` : 'Criar Nova Categoria'}
    >
      <div className="category-modal-content">
        <div className="form-group">
          <label htmlFor="categoryName">Nome da Categoria</label>
          <input
            type="text"
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </div>
        <div className="category-modal-actions">
          <Button onClick={handleSave} variant="default">Salvar</Button>
          {category && <Button onClick={handleDelete} variant="destructive">Excluir</Button>}
          <Button onClick={onClose} variant="secondary">Cancelar</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryModal;
