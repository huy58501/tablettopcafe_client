import { useMutation, useQuery } from '@apollo/client';
import { GET_ORDERS, UPDATE_ORDER_STATUS } from '@/services/orderServices';

export const useUpdateOrderStatus = () => {
  const [updateOrderStatus, { loading, error }] = useMutation(UPDATE_ORDER_STATUS);
  const { data: orders, loading: ordersLoading, error: ordersError } = useQuery(GET_ORDERS);

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    console.log('handleUpdateOrderStatus id', id);
    console.log('handleUpdateOrderStatus status', status);
    try {
      await updateOrderStatus({ variables: { orderId: id, status } });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return {
    updateOrderStatus,
    handleUpdateOrderStatus,
    loading,
    error,
    orders,
    ordersLoading,
    ordersError,
  };
};
