import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
  updateSaleStatus,
  addSaleItem,
  getSaleItems,
  updateSaleItem,
  deleteSaleItem,
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getSalesStats,
  getCustomerStats,
  getTopProducts,
  getRecentSales
} from '@/lib/services/sales/sale.action';
import { Sale, SaleItem, Customer } from '@/lib/services/sales/sale.schema';

// Hooks pour les ventes
export const useSales = () => {
  return useQuery({
    queryKey: ['sales'],
    queryFn: () => getAllSales(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSale = (id: string) => {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => getSaleById(id),
    enabled: !!id,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['salesStats'] });
      toast.success('Vente créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création de la vente');
    },
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateSale(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', id] });
      queryClient.invalidateQueries({ queryKey: ['salesStats'] });
      toast.success('Vente mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour de la vente');
    },
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['salesStats'] });
      toast.success('Vente supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression de la vente');
    },
  });
};

export const useUpdateSaleStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateSaleStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', id] });
      queryClient.invalidateQueries({ queryKey: ['salesStats'] });
      toast.success('Statut de la vente mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du statut');
    },
  });
};

// Hooks pour les détails de vente
export const useSaleItems = (saleId: string) => {
  return useQuery({
    queryKey: ['saleItems', saleId],
    queryFn: () => getSaleItems(saleId),
    enabled: !!saleId,
  });
};

export const useAddSaleItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ saleId, data }: { saleId: string; data: any }) => addSaleItem(saleId, data),
    onSuccess: (_, { saleId }) => {
      queryClient.invalidateQueries({ queryKey: ['saleItems', saleId] });
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Article ajouté à la vente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'ajout de l\'article');
    },
  });
};

export const useUpdateSaleItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ saleId, itemId, data }: { saleId: string; itemId: string; data: any }) => 
      updateSaleItem(saleId, itemId, data),
    onSuccess: (_, { saleId }) => {
      queryClient.invalidateQueries({ queryKey: ['saleItems', saleId] });
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Article mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'article');
    },
  });
};

export const useDeleteSaleItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ saleId, itemId }: { saleId: string; itemId: string }) => 
      deleteSaleItem(saleId, itemId),
    onSuccess: (_, { saleId }) => {
      queryClient.invalidateQueries({ queryKey: ['saleItems', saleId] });
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Article supprimé de la vente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression de l\'article');
    },
  });
};

// Hooks pour les clients
export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => getAllCustomers(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Client créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création du client');
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCustomer(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      toast.success('Client mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du client');
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Client supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression du client');
    },
  });
};

// Hooks pour les statistiques
export const useSalesStats = () => {
  return useQuery({
    queryKey: ['salesStats'],
    queryFn: () => getSalesStats(),
    staleTime: 30 * 1000, // 30 secondes
    refetchInterval: 60 * 1000, // Rafraîchir chaque minute
  });
};

export const useCustomerStats = () => {
  return useQuery({
    queryKey: ['customerStats'],
    queryFn: () => getCustomerStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTopProducts = () => {
  return useQuery({
    queryKey: ['topProducts'],
    queryFn: () => getTopProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRecentSales = () => {
  return useQuery({
    queryKey: ['recentSales'],
    queryFn: () => getRecentSales(),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Rafraîchir toutes les 30 secondes
  });
};
