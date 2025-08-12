import React, { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';

import { useTags } from '../hooks/useTags';
import DataTable from '../components/DataTable/DataTable';
import TagModal from '../components/TagModal';
import { useTagMutations } from '../hooks/useTagMutations';
import type { Tag } from '../schema/tag.schema';

const AdminTags: React.FC = () => {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [sorting, setSorting] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  const { tags, totalTags, loading, error, refetch } = useTags({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: sorting.length > 0 ? sorting[0].id : 'createdAt',
    sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc',
    globalFilter,
  });

  const { createTag, updateTag, deleteTag } = useTagMutations();

  const columnHelper = createColumnHelper<Tag>();

  const columns = [
    columnHelper.accessor('id', {
      cell: info => info.getValue(),
      header: 'ID da Tag',
      enableSorting: false,
    }),
    columnHelper.accessor('name', {
      cell: info => info.getValue(),
      header: 'Nome da Tag',
    }),
    columnHelper.accessor('createdAt', {
      cell: info => format(new Date(info.getValue()), 'dd/MM/yyyy HH:mm:ss'),
      header: 'Data de Criação',
    }),
    columnHelper.accessor('updatedAt', {
      cell: info => format(new Date(info.getValue()), 'dd/MM/yyyy HH:mm:ss'),
      header: 'Última Atualização',
    }),
  ];

  const handleRowClick = (tag: Tag) => {
    setSelectedTag(tag);
    setIsTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setIsTagModalOpen(false);
    setSelectedTag(null);
    refetch();
  };

  const handleSaveTag = async (tagToSave: Tag) => {
    if (tagToSave.id) {
      await updateTag(tagToSave.id, tagToSave.name);
    } else {
      await createTag(tagToSave.name);
    }
    handleCloseTagModal();
  };

  const handleDeleteTag = async (tagId: string) => {
    await deleteTag(tagId);
    handleCloseTagModal();
  };

  return (
    <div className="admin-tags-page">
      <div className="admin-tags-header">
        <h2>Tags</h2>
        <button className="add-tag-button" onClick={() => {
          setSelectedTag(null);
          setIsTagModalOpen(true);
        }}>
          Adicionar Tag
        </button>
      </div>
      <DataTable
        data={tags}
        columns={columns}
        loading={loading}
        error={error}
        totalItems={totalTags}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onGlobalFilterChange={setGlobalFilter}
        globalFilter={globalFilter}
        onRowClick={handleRowClick}
      />

      <TagModal
        isOpen={isTagModalOpen}
        onClose={handleCloseTagModal}
        tag={selectedTag}
        onSave={handleSaveTag}
        onDelete={handleDeleteTag}
      />
    </div>
  );
};

export default AdminTags;
