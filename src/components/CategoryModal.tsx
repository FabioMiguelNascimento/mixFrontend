import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="categoryName" className="text-right">Nome da Categoria</Label>
          <Input
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="secondary">Cancelar</Button>
          {category && <Button onClick={handleDelete} variant="destructive">Excluir</Button>}
          <Button onClick={handleSave} variant="default">Salvar</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryModal;
