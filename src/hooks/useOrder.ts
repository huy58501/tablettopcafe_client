import { useMutation, useQuery } from '@apollo/client';
import { GET_ORDERS, UPDATE_ORDER_STATUS, UPDATE_ORDER_PAYMENT } from '@/services/orderServices';

export const useUpdateOrderStatus = () => {
  const [updateOrderStatus, { loading, error }] = useMutation(UPDATE_ORDER_STATUS);
  const [updateOrderPayment, { loading: paymentLoading, error: paymentError }] =
    useMutation(UPDATE_ORDER_PAYMENT);
  const { data: orders, loading: ordersLoading, error: ordersError } = useQuery(GET_ORDERS);

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      await updateOrderStatus({ variables: { orderId: id, status } });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleUpdateOrderPayment = async (id: number, payment: string, reference: string) => {
    try {
      await updateOrderPayment({ variables: { orderId: id, payment, reference } });
    } catch (error) {
      console.error('Error updating order payment:', error);
    }
  };

  return {
    updateOrderStatus,
    handleUpdateOrderStatus,
    updateOrderPayment,
    handleUpdateOrderPayment,
    loading,
    error,
    orders,
    ordersLoading,
    ordersError,
    paymentLoading,
    paymentError,
  };
};
