import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Tag } from '../schema/tag.schema';

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag: Tag | null;
  onSave: (tag: Tag) => void;
  onDelete: (tagId: string) => void;
}

const TagModal: React.FC<TagModalProps> = ({ isOpen, onClose, tag, onSave, onDelete }) => {
  const [tagName, setTagName] = useState('');

  useEffect(() => {
    if (tag) {
      setTagName(tag.name);
    } else {
      setTagName('');
    }
  }, [tag]);

  const handleSave = () => {
    if (tag) {
      onSave({ ...tag, name: tagName });
    } else {
      onSave({ id: '', name: tagName, createdAt: new Date(), updatedAt: new Date() });
    }
    onClose();
  };

  const handleDelete = () => {
    if (tag) {
      onDelete(tag.id);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tag ? `Editar Tag: ${tag.name}` : 'Criar Nova Tag'}
    >
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="tagName" className="text-right">Nome da Tag</Label>
          <Input
            id="tagName"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="secondary">Cancelar</Button>
          {tag && <Button onClick={handleDelete} variant="destructive">Excluir</Button>}
          <Button onClick={handleSave} variant="default">Salvar</Button>
        </div>
      </div>
    </Modal>
  );
};

export default TagModal;
