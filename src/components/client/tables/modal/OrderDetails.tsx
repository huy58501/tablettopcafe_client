import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaTimes,
  FaUtensils,
  FaUser,
  FaStickyNote,
  FaMoneyBillWave,
  FaMoneyBill,
  FaCreditCard,
  FaClipboard,
  FaClock,
  FaExchangeAlt,
} from 'react-icons/fa';
import { OrderItem } from '@/types/table';
import { ExtendedOrder } from '../Tables';
import QRPayment from './QRPayment';

interface OrderDetailsProps {
  order: ExtendedOrder;
  onClose: () => void;
  onSplitBill: () => void;
  onConfirm: (paymentData: { paymentMethod: string; amount: number; reference: string }) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onClose, onSplitBill, onConfirm }) => {
  const [isQRPaymentOpen, setIsQRPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentReference, setPaymentReference] = useState('');

  // Handle click outside modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Format currency to VND with thousands separators
  const formatCurrency = (amount: number) => {
    return `VND: ${amount.toLocaleString('vi-VN')}`;
  };

  const handlePayment = () => {
    setPaymentAmount(order.total || 0);
    setPaymentReference(`Order #${order.id}`);
    setIsQRPaymentOpen(true);
  };

  const handlePaymentComplete = () => {
    setIsQRPaymentOpen(false);
    onClose();
  };

  const handlePaymentConfirm = (paymentData: {
    paymentMethod: string;
    amount: number;
    reference: string;
  }) => {
    handlePaymentComplete();
    console.log(
      'Payment Confirm from Order Details',
      paymentData.paymentMethod + ' ' + paymentData.amount + ' ' + paymentData.reference
    );
    onConfirm({
      paymentMethod: paymentData.paymentMethod,
      amount: paymentData.amount,
      reference: paymentData.reference,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Order Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500 w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Customer Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <FaUser className="text-gray-400 w-4 h-4" />
              <span className="text-sm text-gray-600">Customer:</span>
              <span className="text-sm font-medium text-gray-800">
                {order.customerName || 'Not specified'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaClipboard className="text-gray-400 w-4 h-4" />
              <span className="text-sm text-gray-600">Note:</span>
              <span className="text-sm font-medium text-gray-800">
                {order.customerNote || 'None'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-gray-400 w-4 h-4" />
              <span className="text-sm text-gray-600">Status:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {order.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaMoneyBill className="text-gray-400 w-4 h-4" />
              <span className="text-sm text-gray-600">Total:</span>
              <span className="text-sm font-semibold text-blue-600">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-2 mb-4">
            {order.orderItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{item.quantity}x</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.dish.name}</p>
                    {item.notes && <p className="text-xs text-gray-500">Note: {item.notes}</p>}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center py-3 border-t border-gray-100 mb-4">
            <span className="text-base font-medium text-gray-700">Total Amount:</span>
            <span className="text-base font-semibold text-blue-600">
              {formatCurrency(order.total)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handlePayment}
              className="col-span-1 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 
                       transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <FaMoneyBill className="w-4 h-4" />
              <span className="hidden sm:inline">Pay</span>
              <span className="sm:hidden">Pay</span>
            </button>
            <button
              onClick={onSplitBill}
              className="col-span-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                       transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <FaExchangeAlt className="w-4 h-4" />
              <span className="hidden sm:inline">Split</span>
              <span className="sm:hidden">Split</span>
            </button>
            <button
              onClick={onClose}
              className="col-span-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl 
                       hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <FaTimes className="w-4 h-4" />
              <span className="hidden sm:inline">Close</span>
              <span className="sm:hidden">Close</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* QR Payment Modal */}
      <QRPayment
        isOpen={isQRPaymentOpen}
        onClose={() => setIsQRPaymentOpen(false)}
        onComplete={handlePaymentComplete}
        amount={paymentAmount}
        tableId={order.tableId}
        reference={paymentReference}
        onConfirm={handlePaymentConfirm}
      />
    </motion.div>
  );
};

export default OrderDetails;
