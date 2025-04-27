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
  FaCheck,
} from 'react-icons/fa';
import { ExtendedOrder } from '../Tables';
import QRPayment from './QRPayment';
import SpinningModal from '@/components/UI/SpinningModal';
import ChangeTableModal from './ChangeTableModal';

interface OrderDetailsProps {
  order: ExtendedOrder;
  onClose: () => void;
  onSplitBill: () => void;
  onConfirm: (paymentData: { paymentMethod: string; amount: number; reference: string }) => void;
  onTableChange?: (newTableId: number) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  onClose,
  onSplitBill,
  onConfirm,
  onTableChange,
}) => {
  const [isQRPaymentOpen, setIsQRPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentReference, setPaymentReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTableChangeModalOpen, setIsTableChangeModalOpen] = useState(false);

  // Format currency to VND with thousands separators
  const formatCurrency = (amount: number) => {
    return `VND: ${amount.toLocaleString('vi-VN')}`;
  };

  const handlePayment = () => {
    setPaymentAmount(order.total);
    setPaymentReference(`Table ${order.tableId} - Order #${order.id}`);
    setIsQRPaymentOpen(true);
  };

  const handlePaymentComplete = () => {
    setIsQRPaymentOpen(false);
    onClose();
  };

  const handlePaymentConfirm = async (paymentData: {
    paymentMethod: string;
    amount: number;
    reference: string;
  }) => {
    setTimeout(() => {
      setIsProcessing(true);
    }, 1000);
    try {
      await onConfirm({
        paymentMethod: paymentData.paymentMethod,
        amount: paymentData.amount,
        reference: paymentData.reference,
      });
      handlePaymentComplete();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTableChange = (newTableId: number) => {
    if (onTableChange) {
      onTableChange(newTableId);
      onClose();
    }
  };

  return (
    <>
      <SpinningModal isOpen={isProcessing} message="Processing payment..." />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white md:bg-gray-800/80 flex items-start md:items-center justify-center z-50"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white w-full h-[100dvh] md:h-auto md:rounded-2xl md:w-full md:max-w-[1000px] md:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 flex-none">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">Order Details</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Table {order.tableId} • {order.orderItems.length} items
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <FaTimes className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 space-y-6">
              {/* Customer Info if available */}
              {(order.customerName || order.customerNote) && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  {order.customerName && (
                    <div className="flex items-center gap-2 mb-2">
                      <FaUser className="text-blue-500" />
                      <span className="text-sm font-medium text-blue-700">
                        {order.customerName}
                      </span>
                    </div>
                  )}
                  {order.customerNote && (
                    <div className="flex items-center gap-2">
                      <FaStickyNote className="text-blue-500" />
                      <span className="text-sm text-blue-700">{order.customerNote}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-3">
                {order.orderItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-medium text-gray-700">x{item.quantity}</span>
                        <span className="font-medium text-gray-800">{item.dish.name}</span>
                      </div>
                      <span className="font-medium text-gray-600 ml-4">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-gray-500 mt-2 italic pl-6">{item.notes}</p>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                  {/* <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VAT (10%)</span>
                    <span className="font-medium text-gray-800">
                      {formatCurrency(order.total * 0.1)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">Total</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(order.total * 1.1)}
                    </span>
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions Bar - Fixed on Mobile */}
          <div className="bg-white border-t border-gray-200 p-4 md:p-6 flex-none">
            <div className="flex flex-wrap gap-2 max-w-[1000px] mx-auto">
              <button
                onClick={onClose}
                className="flex-1 min-w-[120px] py-2.5 md:py-3 px-3 md:px-4 border border-gray-200 text-gray-700 font-medium 
                         rounded-xl hover:bg-gray-50 transition-colors text-sm cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => setIsTableChangeModalOpen(true)}
                className="flex-1 min-w-[120px] py-2.5 md:py-3 px-3 md:px-4 bg-purple-600 text-white font-medium rounded-xl 
                         hover:bg-purple-700 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaExchangeAlt className="text-sm" />
                Change Table
              </button>
              <button
                onClick={onSplitBill}
                className="flex-1 min-w-[120px] py-2.5 md:py-3 px-3 md:px-4 bg-blue-600 text-white font-medium rounded-xl 
                         hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaMoneyBill className="text-sm" />
                Split Bill
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 min-w-[120px] py-2.5 md:py-3 px-3 md:px-4 bg-green-600 text-white font-medium rounded-xl 
                         hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaCheck className="text-sm" />
                Pay Now
              </button>
            </div>
          </div>
        </motion.div>

        {/* Table Change Modal */}
        <ChangeTableModal
          isOpen={isTableChangeModalOpen}
          onClose={() => setIsTableChangeModalOpen(false)}
          onConfirm={handleTableChange}
          currentTableId={order.tableId}
        />

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
    </>
  );
};

export default OrderDetails;
