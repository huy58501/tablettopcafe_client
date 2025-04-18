import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaUtensils, FaUser, FaStickyNote, FaMoneyBillWave, FaMoneyBill } from 'react-icons/fa';
import { OrderItem } from '@/types/table';
import { ExtendedOrder } from '../Tables';

interface OrderDetailsProps {
  order: ExtendedOrder;
  onClose: () => void;
  onSplitBill: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onClose, onSplitBill }) => {
  // Handle click outside modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the overlay, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Format currency to VND with thousands separators
  const formatCurrency = (amount: number) => {
    return `VND: ${amount.toLocaleString('vi-VN')}`;
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="fixed inset-0 bg-gray-800/80 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-[600px] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <FaTimes className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <FaUser className="text-gray-500 mr-2" />
                <span className="font-medium">Customer:</span>
                <span className="ml-2">{order.customerName || 'Not specified'}</span>
              </div>
              <div className="flex items-center">
                <FaStickyNote className="text-gray-500 mr-2" />
                <span className="font-medium">Note:</span>
                <span className="ml-2">{order.customerNote || 'None'}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <FaUtensils className="text-gray-500 mr-2" />
                <span className="font-medium">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    order.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center">
                <FaMoneyBillWave className="text-gray-500 mr-2" />
                <span className="font-medium">Total:</span>
                <span className="ml-2 font-bold">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4 mb-6">
            {order.orderItems.map((item: OrderItem) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <span className="text-gray-700">{item.quantity}x </span>
                  <span className="text-gray-600">{item.notes || 'No notes'}</span>
                </div>
                <span className="text-gray-700">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between items-center font-medium">
              <span className="text-gray-700">Total Amount:</span>
              <span className="text-gray-900">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onSplitBill}
              className="flex-1 py-3.5 px-4 bg-blue-600 text-white font-medium 
                       rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FaMoneyBill />
              Split Bill
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3.5 px-4 border-2 border-gray-200 text-gray-700 font-medium 
                       rounded-xl hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderDetails;
