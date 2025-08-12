import React, { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';

import { useCategories } from '../hooks/useCategories';
import { useCategoryMutations } from '../hooks/useCategoryMutations';
import DataTable from '../components/DataTable/DataTable';
import CategoryModal from '../components/CategoryModal';
import type { Category } from '../schema/category.schema';

const AdminCategories: React.FC = () => {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [sorting, setSorting] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { categories, totalCategories, loading, error, refetch } = useCategories({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: sorting.length > 0 ? sorting[0].id : 'createdAt',
    sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc',
    name: globalFilter,
  });

  const { createCategory, updateCategory, deleteCategory } = useCategoryMutations();

  const columnHelper = createColumnHelper<Category>();

  const columns = [
    columnHelper.accessor('id', {
      cell: info => info.getValue(),
      header: 'ID da Categoria',
      enableSorting: false,
    }),
    columnHelper.accessor('name', {
      cell: info => info.getValue(),
      header: 'Nome da Categoria',
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

  const handleRowClick = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategory(null);
    refetch();
  };

  const handleSaveCategory = async (categoryToSave: Category) => {
    if (categoryToSave.id) {
      await updateCategory(categoryToSave.id, categoryToSave.name);
    } else {
      await createCategory(categoryToSave.name);
    }
    handleCloseCategoryModal();
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await deleteCategory(categoryId);
    handleCloseCategoryModal();
  };

  return (
    <div className="admin-categories-page">
      <div className="admin-categories-header">
        <h2>Categorias</h2>
        <button className="add-category-button" onClick={() => {
          setSelectedCategory(null);
          setIsCategoryModalOpen(true);
        }}>
          Adicionar Categoria
        </button>
      </div>
      <DataTable
        data={categories}
        columns={columns}
        loading={loading}
        error={error}
        totalItems={totalCategories}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onGlobalFilterChange={setGlobalFilter}
        globalFilter={globalFilter}
        onRowClick={handleRowClick}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        category={selectedCategory}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
      />
    </div>
  );
};

export default AdminCategories;