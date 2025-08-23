
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import Chip from '../components/Chip';
import DataTable from '../components/DataTable';
import { useProductMutations } from '../hooks/useProductMutations';
import { useProducts } from '../hooks/useProducts';
import type { CreateProductPayload, UpdateProductPayload } from '../schema/product.schema';
import type { Product, ProductType } from '../types/product.types';
import { getProductStatusChipProps } from '../utils/productStatusUtils';
import { MutateBasketProductModal } from '../components/product/MutateBasketProductModal';
import { MutateSingleProductModal } from '../components/product/MutateSingleProductModal';
import { useProductImages } from '../hooks/useProductImages';
import { useProductImageUrls } from '../hooks/useProductImageUrls';

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
  const [productsWithUrls, setProductsWithUrls] = useState<Product[]>([]);

  const { products, totalProducts, loading, error, refetch } = useProducts({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: sorting.length > 0 ? sorting[0].id : 'createdAt',
    sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc',
    globalFilter,
    type: activeTab,
  });

  const { createProduct, updateProduct, isLoading } = useProductMutations();
  const { uploadImages } = useProductImages();
  const { fetchImageUrls } = useProductImageUrls();

  useEffect(() => {
    if (products.length > 0) {
      const keys = products.flatMap(p => p.images.map(i => i.key));
      if (keys.length > 0) {
        fetchImageUrls(keys).then(urlMap => {
          if (urlMap) {
            const updatedProducts = products.map(p => ({
              ...p,
              images: p.images.map(i => ({ ...i, url: urlMap[i.key] || undefined })),
            }));
            setProductsWithUrls(updatedProducts);
          }
        });
      } else {
        setProductsWithUrls(products);
      }
    } else {
        setProductsWithUrls([]);
    }
  }, [products, fetchImageUrls]);

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

  const handleSave = async (data: CreateProductPayload | UpdateProductPayload, newImages: File[]) => {
    try {
      let productId: string | undefined;

      if ('id' in data && data.id) {
        await updateProduct(data);
        productId = data.id;
      } else {
        const newProductResponse = await createProduct(data as CreateProductPayload);
        if (newProductResponse && newProductResponse.data) {
          productId = newProductResponse.data.id;
        }
      }

      if (productId && newImages.length > 0) {
        uploadImages(productId, newImages).then(() => {
          refetch();
        });
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

      <div className="tabs flex gap-2">
        <Button 
          variant={activeTab === 'SINGLE' ? 'default' : 'secondary'}
          onClick={() => setActiveTab('SINGLE')}
        >
          Produtos
        </Button>
        <Button 
          variant={activeTab === 'BASKET' ? 'default' : 'secondary'}
          onClick={() => setActiveTab('BASKET')}
        >
          Cestas
        </Button>
      </div>

      <DataTable
        data={productsWithUrls}
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
