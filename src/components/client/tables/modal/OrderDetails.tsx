import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaMoneyBill,
  FaExchangeAlt,
  FaCheck,
  FaPlus,
  FaMinus,
  FaTrash,
  FaShoppingCart,
  FaChevronUp,
} from 'react-icons/fa';
import { ExtendedOrder, ExtendedOrderItem } from '../Tables';
import QRPayment from './QRPayment';
import SpinningModal from '@/components/UI/SpinningModal';
import ChangeTableModal from './ChangeTableModal';
import { useDishes } from '@/hooks/useDishes';
import { UPDATE_ORDER } from '@/services/orderServices';
import { useMutation } from '@apollo/client';

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
  const [showMobileCart, setShowMobileCart] = useState(false);
  const { dishesData, dishesLoading } = useDishes();
  const [updatedOrderItems, setUpdatedOrderItems] = useState<ExtendedOrderItem[]>(order.orderItems);
  const [updateOrder, { loading: updateOrderLoading }] = useMutation(UPDATE_ORDER);
  // Format currency to VND with thousands separators
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return 'VND: 0';
    return `VND: ${amount.toLocaleString('vi-VN')}`;
  };

  useEffect(() => {
    console.log('order', order);
  }, [order]);

  // Handle adding or updating dish quantity
  const handleAddOrUpdateDish = async (dish: any) => {
    const newItems = [...updatedOrderItems];
    const existingItem = newItems.find(item => item.dish.id === dish.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      const newItem: ExtendedOrderItem = {
        id: Date.now(), // Temporary ID for new items
        name: dish.name,
        quantity: 1,
        price: dish.price,
        notes: '',
        dish: dish,
      };
      newItems.push(newItem);
    }

    setUpdatedOrderItems(newItems);
  };

  // Handle updating item quantity
  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const newItems = updatedOrderItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setUpdatedOrderItems(newItems);
  };

  // Handle removing item
  const handleRemoveItem = async (itemId: number) => {
    const newItems = updatedOrderItems.filter(item => item.id !== itemId);
    setUpdatedOrderItems(newItems);
  };

  // Handle updating notes
  const handleUpdateNotes = async (itemId: number, notes: string) => {
    const newItems = updatedOrderItems.map(item =>
      item.id === itemId ? { ...item, notes } : item
    );
    setUpdatedOrderItems(newItems);
  };

  // Calculate total
  const calculateTotal = () => {
    if (!updatedOrderItems || updatedOrderItems.length === 0) return 0;
    return updatedOrderItems.reduce((sum, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return sum + price * quantity;
    }, 0);
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

  const handleUpdateOrder = async () => {
    try {
      const formattedItems = updatedOrderItems.map(item => ({
        dishId: item.dish.id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || '',
      }));

      await updateOrder({
        variables: {
          id: order.id,
          orderItems: formattedItems,
        },
      });
      setShowMobileCart(false);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  return (
    <>
      <SpinningModal isOpen={isProcessing} message="Processing payment..." />
      <SpinningModal isOpen={dishesLoading} message="Loading dishes..." />
      <SpinningModal isOpen={updateOrderLoading} message="Updating order..." />
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
          className="bg-white w-full h-[100dvh] md:h-auto md:rounded-2xl md:w-full md:max-w-[1200px] md:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
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

          {/* Desktop Layout */}
          <div className="hidden md:flex flex-1 overflow-hidden">
            {/* Left Side - Dishes Grid */}
            <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Dishes</h3>
              {(() => {
                const dishesByCategory: { [category: string]: any[] } = {};
                if (dishesData?.allDishes) {
                  const sortedDishes = [...dishesData.allDishes].sort(
                    (a: any, b: any) => Number(a.id) - Number(b.id)
                  );
                  sortedDishes.forEach((dish: any) => {
                    const cat = dish.category || 'Uncategorized';
                    if (!dishesByCategory[cat]) dishesByCategory[cat] = [];
                    dishesByCategory[cat].push(dish);
                  });
                }

                return Object.keys(dishesByCategory).map(category => (
                  <div key={category} className="mb-6">
                    <h4 className="text-md font-semibold text-blue-700 mb-3">{category}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {dishesByCategory[category].map((dish: any) => (
                        <motion.div
                          key={dish.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            const existingItem = updatedOrderItems.find(
                              item => item.dish.id === dish.id
                            );
                            if (existingItem) {
                              handleUpdateQuantity(existingItem.id, existingItem.quantity + 1);
                            } else {
                              const newItem: ExtendedOrderItem = {
                                id: Date.now(),
                                name: dish.name,
                                quantity: 1,
                                price: dish.price,
                                notes: '',
                                dish: dish,
                              };
                              setUpdatedOrderItems([...updatedOrderItems, newItem]);
                            }
                          }}
                          className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 
                                   transition-colors cursor-pointer"
                        >
                          <h4 className="font-medium text-gray-800 truncate">{dish.name}</h4>
                          <p className="text-sm text-gray-600">{formatCurrency(dish.price)}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Right Side - Order Items */}
            <div className="w-1/2 flex flex-col h-full">
              <h3 className="text-lg font-semibold text-gray-800 p-4 pb-2">Current Order</h3>

              {/* Scrollable Order Items */}
              <div
                className="flex-1 overflow-y-auto px-4"
                style={{ maxHeight: 'calc(100vh - 300px)' }}
              >
                <div className="space-y-3 pb-4">
                  {updatedOrderItems.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{item.dish.name}</h4>
                          <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded-full hover:bg-blue-100"
                          >
                            <FaMinus className="text-gray-600" />
                          </button>
                          <motion.span
                            key={item.quantity}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            className="font-medium w-6 text-center text-blue-700"
                          >
                            {item.quantity}
                          </motion.span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded-full hover:bg-blue-100"
                          >
                            <FaPlus className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 rounded-full hover:bg-red-100 text-red-500"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Add notes for this item..."
                        value={item.notes || ''}
                        onChange={e => handleUpdateNotes(item.id, e.target.value)}
                        className="mt-2 w-full p-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex flex-col md:hidden h-[calc(100vh-64px)] overflow-hidden">
            {/* Menu Categories */}
            <div className="flex-1 overflow-y-auto px-4 py-3 pb-20">
              {(() => {
                const dishesByCategory: { [category: string]: any[] } = {};
                if (dishesData?.allDishes) {
                  const sortedDishes = [...dishesData.allDishes].sort(
                    (a: any, b: any) => Number(a.id) - Number(b.id)
                  );
                  sortedDishes.forEach((dish: any) => {
                    const cat = dish.category || 'Uncategorized';
                    if (!dishesByCategory[cat]) dishesByCategory[cat] = [];
                    dishesByCategory[cat].push(dish);
                  });
                }

                return Object.entries(dishesByCategory).map(([category, dishes]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-base font-medium text-gray-700 mb-3">{category}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {(dishes as any[]).map((dish: any) => (
                        <button
                          key={dish.id}
                          onClick={() => handleAddOrUpdateDish(dish)}
                          className="flex flex-col items-center p-3 rounded-xl border border-gray-100 
                                   hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                        >
                          <div className="text-2xl mb-1">{dish.image}</div>
                          <div className="text-sm font-medium text-gray-800 text-center">
                            {dish.name}
                          </div>
                          <div className="text-sm text-gray-500">{formatCurrency(dish.price)}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
              <div className="p-4">
                <button
                  onClick={() => setShowMobileCart(!showMobileCart)}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl 
                           hover:bg-blue-700 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FaShoppingCart className="text-lg" />
                    <span className="font-medium">
                      {updatedOrderItems.length} {updatedOrderItems.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatCurrency(calculateTotal())}</span>
                    <FaChevronUp
                      className={`transform transition-transform ${showMobileCart ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile Cart Slide-up Panel */}
            <AnimatePresence>
              {showMobileCart && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="fixed inset-0 bg-white border-t border-gray-200 z-50"
                >
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-800">Order Summary</h3>
                        <button
                          onClick={() => setShowMobileCart(false)}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <FaTimes className="text-gray-500" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      <div className="p-4 space-y-4">
                        {updatedOrderItems.map(item => (
                          <div key={item.id} className="bg-gray-50 rounded-xl p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-800">{item.dish.name}</span>
                              <span className="text-gray-800">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center bg-white rounded-lg border border-gray-200">
                                  <button
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                    className="p-1.5 hover:bg-gray-50 rounded-l-lg"
                                  >
                                    <FaMinus className="text-gray-500 text-xs" />
                                  </button>
                                  <span className="w-8 text-center text-sm font-medium">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                    className="p-1.5 hover:bg-gray-50 rounded-r-lg"
                                  >
                                    <FaPlus className="text-gray-500 text-xs" />
                                  </button>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <FaTrash className="text-sm" />
                              </button>
                            </div>

                            <input
                              type="text"
                              placeholder="Add notes for this item..."
                              value={item.notes || ''}
                              onChange={e => handleUpdateNotes(item.id, e.target.value)}
                              className="w-full p-2 text-sm bg-white border border-gray-200 
                                       rounded-lg focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 border-t border-gray-100">
                      {/* Mobile Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={onClose}
                          className="flex-1 min-w-[120px] py-3 border border-gray-200 text-gray-700 
                                   rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          Close
                        </button>
                        <button
                          onClick={() => setIsTableChangeModalOpen(true)}
                          className="flex-1 min-w-[120px] py-3 bg-purple-600 text-white rounded-xl 
                                   hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <FaExchangeAlt className="text-sm" />
                          Change Table
                        </button>
                        <button
                          onClick={onSplitBill}
                          className="flex-1 min-w-[120px] py-3 bg-blue-600 text-white rounded-xl 
                                   hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <FaMoneyBill className="text-sm" />
                          Split Bill
                        </button>
                        <button
                          onClick={handlePayment}
                          className="flex-1 min-w-[120px] py-3 bg-green-600 text-white rounded-xl 
                                   hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <FaCheck className="text-sm" />
                          Pay Now
                        </button>
                        <button
                          onClick={handleUpdateOrder}
                          className="flex-1 min-w-[120px] py-3 bg-indigo-600 text-white rounded-xl 
                                   hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <FaCheck className="text-sm" />
                          Update Order
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Actions Bar - Desktop Only */}
          <div className="hidden md:block bg-white border-t border-gray-200 p-4 md:p-6 flex-none">
            {/* Subtotal */}
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-800 text-lg">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>

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
              <button
                onClick={handleUpdateOrder}
                className="flex-1 min-w-[120px] py-2.5 md:py-3 px-3 md:px-4 bg-indigo-600 text-white font-medium rounded-xl 
                         hover:bg-indigo-700 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaCheck className="text-sm" />
                Update Order
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
