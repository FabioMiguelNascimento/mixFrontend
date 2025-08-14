
import React, { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';

import { useProducts } from '../hooks/useProducts';
import { useProductMutations } from '../hooks/useProductMutations';
import type { Product, ProductType } from '../schema/product.schema';
import DataTable from '../components/DataTable';
import Chip from '../components/Chip';
import { getProductStatusChipProps } from '../utils/productStatusUtils';
import { MutateProductModal } from '../components/product/MutateProductModal';
import { ViewProductModal } from '../components/product/ViewProductModal';
import Button from '../components/Button';

const AdminProducts: React.FC = () => {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [sorting, setSorting] = React.useState<any[]>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [activeTab, setActiveTab] = useState<ProductType>('SINGLE');
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isMutateModalOpen, setIsMutateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { products, totalProducts, loading, error, refetch } = useProducts({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: sorting.length > 0 ? sorting[0].id : 'createdAt',
    sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc',
    globalFilter,
    type: activeTab,
  });

  const { createProduct, updateProduct, deleteProduct, isLoading } = useProductMutations();

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

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsMutateModalOpen(true);
  };
  
  const handleEditProduct = () => {
    setIsViewModalOpen(false); // Close view modal
    setIsMutateModalOpen(true); // Open mutate modal
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsMutateModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSave = async (data: any) => {
    try {
      if (selectedProduct) {
        await updateProduct({ ...data, id: selectedProduct.id });
      } else {
        await createProduct(data);
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
        <Button onClick={handleCreateProduct} >
          Adicionar Produto
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
        onRowClick={handleViewProduct}
      />

      {isViewModalOpen && (
        <ViewProductModal
          isOpen={isViewModalOpen}
          onClose={handleCloseModals}
          product={selectedProduct}
          onEdit={handleEditProduct}
        />
      )}

      {isMutateModalOpen && (
        <MutateProductModal
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
