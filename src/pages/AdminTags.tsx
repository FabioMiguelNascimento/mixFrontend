import React, { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';

import { useTags } from '../hooks/useTags';
import DataTable from '../components/DataTable/DataTable';
import type { Tag } from '../schema/tag.schema';

const AdminTags: React.FC = () => {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [sorting, setSorting] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { tags, totalTags, loading, error, refetch } = useTags({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: sorting.length > 0 ? sorting[0].id : 'createdAt',
    sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc',
    globalFilter,
  });

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

  const renderTagActions = (tag: Tag) => {
    return (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => console.log('Edit', tag.id)} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>Editar</button>
        <button onClick={() => console.log('Delete', tag.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>Excluir</button>
      </div>
    );
  };

  return (
    <div className="admin-tags-page">
      <DataTable
        title="Tags"
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
        renderRowActions={renderTagActions}
      />
    </div>
  );
};

export default AdminTags;