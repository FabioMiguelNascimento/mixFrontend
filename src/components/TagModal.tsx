import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
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
      <div className="tag-modal-content">
        <div className="form-group">
          <label htmlFor="tagName">Nome da Tag</label>
          <input
            type="text"
            id="tagName"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
          />
        </div>
        <div className="tag-modal-actions">
          <Button onClick={handleSave} variant="primary">Salvar</Button>
          {tag && <Button onClick={handleDelete} variant="danger">Excluir</Button>}
          <Button onClick={onClose} variant="secondary">Cancelar</Button>
        </div>
      </div>
    </Modal>
  );
};

export default TagModal;
