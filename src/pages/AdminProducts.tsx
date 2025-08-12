
import React, { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';

import { useProducts } from '../hooks/useProducts';
import ProductModal from '../components/ProductModal';
import type { Product, ProductType } from '../schema/product.schema';
import { useCategories } from '../hooks/useCategories';
import { useTags } from '../hooks/useTags';
import DataTable from '../components/DataTable';
import Chip from '../components/Chip';
import { getProductStatusChipProps } from '../utils/productStatusUtils';

const AdminProducts: React.FC = () => {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [sorting, setSorting] = React.useState<any[]>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [activeTab, setActiveTab] = useState<ProductType>('SINGLE');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { products, totalProducts, loading, error, refetch } = useProducts({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: sorting.length > 0 ? sorting[0].id : 'createdAt',
    sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc',
    globalFilter,
    type: activeTab,
  });

  const { categories } = useCategories({
    page: 1,
    limit: 100,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const { tags } = useTags({
    page: 1,
    limit: 100,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const columnHelper = createColumnHelper<Product>();

  const columns = [
    columnHelper.accessor('name', {
      cell: info => info.getValue(),
      header: 'Nome',
    }),
    columnHelper.accessor('finalPrice', {
      cell: info => `R$ ${info.getValue().toFixed(2)}`,
      header: 'Preço Final',
    }),
    columnHelper.accessor('stock', {
      cell: info => info.getValue(),
      header: 'Estoque',
    }),
    columnHelper.accessor('status', {
      cell: info => {
        const statusProps = getProductStatusChipProps(info.getValue());
        return <Chip text={statusProps.text} variant={statusProps.variant} icon={statusProps.icon} />;
      },
      header: 'Status',
    }),
    columnHelper.accessor('createdAt', {
      cell: info => format(new Date(info.getValue()), 'dd/MM/yyyy HH:mm'),
      header: 'Data de Criação',
    }),
  ];

  const handleRowClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleOpenModalForNew = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    refetch();
  };

  const handleSave = (product: Product) => {
    console.log('Saving product:', product);
    handleCloseModal();
  };

  const handleDelete = (productId: string) => {
    console.log('Deleting product:', productId);
    handleCloseModal();
  };


  return (
    <div className="admin-products-page">
      <div className="admin-products-header">
        <h2>Produtos</h2>
        <button className="add-product-button" onClick={handleOpenModalForNew}>
          Adicionar Produto
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'SINGLE' ? 'active' : ''}`}
          onClick={() => setActiveTab('SINGLE')}
        >
          Produtos
        </button>
        <button 
          className={`tab-button ${activeTab === 'BASKET' ? 'active' : ''}`}
          onClick={() => setActiveTab('BASKET')}
        >
          Cestas
        </button>
      </div>

      <DataTable
        data={products}
        columns={columns}
        loading={loading}
        error={error}
        totalItems={totalProducts}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onGlobalFilterChange={setGlobalFilter}
        globalFilter={globalFilter}
        onRowClick={handleRowClick}
      />

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        onSave={handleSave}
        onDelete={handleDelete}
        allCategories={categories}
        allTags={tags}
      />
    </div>
  );
};

export default AdminProducts;
