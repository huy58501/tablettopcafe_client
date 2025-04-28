'use client';

import React, { useEffect, useState } from 'react';
import { Order, OrderItem } from '@/types/table';
import { gql, useQuery, useMutation } from '@apollo/client';
import { format as formatDate } from 'date-fns';
import { FaUtensils, FaCheck, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import SpinningModal from '@/components/UI/SpinningModal';
import { GET_ORDERS, UPDATE_ORDER_STATUS } from '@/services/orderServices';
import { useUpdateOrderStatus } from '@/hooks/useOrder';

const OrderCard = ({
  order,
  onConfirm,
  onReady,
}: {
  order: Order;
  onConfirm: (id: number) => void;
  onReady: (id: number) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<'confirm' | 'ready' | null>(null);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100/60';
      case 'confirmed':
        return 'bg-green-100';
      case 'ready':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'text-yellow-800';
      case 'confirmed':
        return 'text-green-800';
      case 'ready':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const handleConfirm = () => {
    setIsLoading(true);
    setActionType('confirm');
    onConfirm(Number(order.id));
    setTimeout(() => {
      setIsLoading(false);
      setActionType(null);
    }, 1000);
  };

  const handleReady = () => {
    setIsLoading(true);
    setActionType('ready');
    onReady(Number(order.id));
    setTimeout(() => {
      setIsLoading(false);
      setActionType(null);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-xl shadow-md overflow-hidden ${getStatusColor(order.status)} flex flex-col h-full`}
    >
      <SpinningModal
        isOpen={isLoading}
        message={actionType === 'confirm' ? 'Confirming order...' : 'Marking as ready...'}
        size="medium"
        color="blue"
      />

      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-gray-800">Table {order.id}</h3>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusTextColor(order.status)} cursor-pointer`}
          >
            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1).toLowerCase()}
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {order.createdAt && formatDate(new Date(Number(order.createdAt)), 'MMM d, HH:mm')}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="space-y-3">
            {order.orderItems.map((item: OrderItem) => (
              <div
                key={item.id}
                className="flex justify-between items-start border-b border-gray-100 last:border-0 pb-2 last:pb-0"
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full mr-2">
                      {item.quantity}x
                    </span>
                    <span className="font-medium text-gray-900">{item.dish.name}</span>
                  </div>
                  {item.notes && (
                    <p className="text-sm text-gray-500 mt-1 ml-8 italic">"{item.notes}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleConfirm}
            disabled={isLoading || order.status?.toLowerCase() !== 'pending'}
            className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
          >
            <FaCheck className="mr-2" />
            <span>Confirm</span>
          </button>
          <button
            onClick={handleReady}
            disabled={isLoading || order.status?.toLowerCase() !== 'confirmed'}
            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
          >
            <FaClock className="mr-2" />
            <span>Ready</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const {
    updateOrderStatus,
    handleUpdateOrderStatus,
    orders: ordersData,
    loading,
    error,
    ordersLoading,
    ordersError,
  } = useUpdateOrderStatus();

  useEffect(() => {
    if (ordersData) {
      setOrders(Array.isArray(ordersData.allOrders) ? ordersData.allOrders : []);
    }
  }, [ordersData]);

  const handleConfirm = async (id: number) => {
    await handleUpdateOrderStatus(id, 'confirmed');
  };

  const handleReady = async (id: number) => {
    await handleUpdateOrderStatus(id, 'ready');
  };

  const filteredOrders = Array.isArray(orders)
    ? filter === 'all'
      ? orders
          .filter(order => ['pending', 'confirmed'].includes(order.status?.toLowerCase()))
          .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
      : orders
          .filter(order => order.status?.toLowerCase() === filter)
          .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    : [];

  if (ordersLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <SpinningModal
          isOpen={true}
          message="Loading kitchen orders..."
          size="large"
          color="blue"
        />
      </div>
    );

  if (ordersError)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md">
          <p className="font-bold">Error loading orders</p>
          <p className="text-sm">{ordersError.message}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Kitchen Orders</h1>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  filter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                All Active
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  filter === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('confirmed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  filter === 'confirmed'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setFilter('ready')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  filter === 'ready'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Ready
              </button>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <FaUtensils className="text-gray-400 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No orders found</h3>
            <p className="text-gray-500">
              There are no {filter !== 'all' ? filter : 'active'} orders at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onConfirm={handleConfirm}
                  onReady={handleReady}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
