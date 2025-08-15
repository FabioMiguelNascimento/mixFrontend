
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import React, { useState } from 'react';

import Button from '../components/Button';
import Chip from '../components/Chip';
import DataTable from '../components/DataTable';
import { useProductMutations } from '../hooks/useProductMutations';
import { useProducts } from '../hooks/useProducts';
import type { CreateProductPayload, UpdateProductPayload } from '../schema/product.schema';
import type { Product, ProductType } from '../types/product.types';
import { getProductStatusChipProps } from '../utils/productStatusUtils';
import { MutateBasketProductModal } from '../components/product/MutateBasketProductModal';
import { MutateSingleProductModal } from '../components/product/MutateSingleProductModal';

const AdminProducts: React.FC = () => {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [sorting, setSorting] = React.useState<any[]>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [activeTab, setActiveTab] = useState<ProductType>('SINGLE');
  
  const [isMutateModalOpen, setIsMutateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [createProductType, setCreateProductType] = useState<ProductType | null>(null);

  const { products, totalProducts, loading, error, refetch } = useProducts({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: sorting.length > 0 ? sorting[0].id : 'createdAt',
    sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc',
    globalFilter,
    type: activeTab,
  });

  const { createProduct, updateProduct, isLoading } = useProductMutations();

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

  const handleOpenEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsMutateModalOpen(true);
    setCreateProductType(null);
  };

  const handleCreateProduct = (type: ProductType) => {
    setSelectedProduct(null);
    setCreateProductType(type);
    setIsMutateModalOpen(true);
  };
  
  const handleCloseModals = () => {
    setIsMutateModalOpen(false);
    setSelectedProduct(null);
    setCreateProductType(null);
  };

  const handleSave = async (data: CreateProductPayload | UpdateProductPayload) => {
    try {
      if ('id' in data && data.id) {
        await updateProduct(data);
      } else {
        await createProduct(data as CreateProductPayload);
      }
      refetch();
      handleCloseModals();
    } catch (e) {
      console.error("Failed to save product", e);
    }
  };

  return (
    <div className="admin-products-page">
      <div className="admin-products-header">
        <h2>Produtos</h2>
        <Button onClick={() => handleCreateProduct(activeTab)} >
          {activeTab === 'SINGLE' ? 'Adicionar Produto' : 'Adicionar Cesta'}
        </Button>
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
        onRowClick={handleOpenEditModal}
      />

      {isMutateModalOpen && (selectedProduct?.type === 'SINGLE' || createProductType === 'SINGLE') && (
        <MutateSingleProductModal
          isOpen={isMutateModalOpen}
          onClose={handleCloseModals}
          product={selectedProduct}
          onSave={handleSave}
          isLoading={isLoading}
        />
      )}

      {isMutateModalOpen && (selectedProduct?.type === 'BASKET' || createProductType === 'BASKET') && (
        <MutateBasketProductModal
          isOpen={isMutateModalOpen}
          onClose={handleCloseModals}
          product={selectedProduct}
          onSave={handleSave}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default AdminProducts;
