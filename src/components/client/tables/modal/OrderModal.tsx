import React, { useState, useEffect } from 'react';
import { Order, OrderItem } from '@/types/table';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaTrash,
  FaCheckCircle,
  FaSpinner,
  FaTimes,
  FaShoppingCart,
  FaChevronUp,
} from 'react-icons/fa';
import { gql, useMutation, useQuery } from '@apollo/client';
import { CREATE_ORDER } from '@/services/orderServices';
import { CREATE_BOOKING } from '@/services/bookingServices';
import { GET_ALL_SLOTS } from '@/hooks/useAvailableSlots';
import { ALL_DISHES } from '@/services/dishServices';
import { useTables } from '@/hooks/useTable';
import SpinningModal from '@/components/UI/SpinningModal';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Order) => void;
  tableId: number;
  existingOrder?: Order;
  peopleCount?: number;
}

const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tableId,
  existingOrder,
  peopleCount,
}) => {
  const [createOrder, { loading: isSubmitting }] = useMutation(CREATE_ORDER);
  const [createBooking] = useMutation(CREATE_BOOKING);
  const { data: slotData } = useQuery(GET_ALL_SLOTS);
  const { handleUpdateTableStatus } = useTables();
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  const [order, setOrder] = useState<Order>({
    id: existingOrder?.id || 0,
    bookingId: existingOrder?.bookingId || 0,
    status: existingOrder?.status || 'pending',
    total: existingOrder?.total || 0,
    createdAt: existingOrder?.createdAt || new Date().toISOString(),
    orderItems: existingOrder?.orderItems || [],
    tableId: existingOrder?.tableId || 0,
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: dishesData, loading: dishesLoading } = useQuery(ALL_DISHES);

  // Group dishes by category
  const dishesByCategory = React.useMemo(() => {
    if (!dishesData?.allDishes) return {};

    return dishesData.allDishes.reduce((acc: Record<string, any[]>, dish: any) => {
      const category = dish.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(dish);
      return acc;
    }, {});
  }, [dishesData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/get-me`, {
          method: 'POST',
          credentials: 'include',
        });
        const data = await response.json();
        setUser(data.user.username);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Format currency to VND with thousands separators
  const formatCurrency = (amount: number) => {
    return `VND: ${amount.toLocaleString('vi-VN')}`;
  };

  const handleAddOrUpdateItem = (menuItem: { id: string; name: string; price: number }) => {
    const existingItemIndex = order.orderItems.findIndex(
      item => item.dish.id === parseInt(menuItem.id)
    );

    let updatedItems: OrderItem[];

    if (existingItemIndex >= 0) {
      // If item exists, increment quantity
      updatedItems = order.orderItems.map((item, index) =>
        index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      // If item doesn't exist, add new item
      const newItem: OrderItem = {
        id: Date.now(),
        quantity: 1,
        price: menuItem.price,
        notes: '',
        dish: {
          id: parseInt(menuItem.id),
          name: menuItem.name,
          price: menuItem.price,
          isActive: true,
        },
      };
      updatedItems = [...order.orderItems, newItem];
    }

    const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    setOrder({
      ...order,
      orderItems: updatedItems,
      total,
    });
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    const updatedItems = order.orderItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );

    const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    setOrder({
      ...order,
      orderItems: updatedItems,
      total,
    });
  };

  const handleUpdateNotes = (itemId: number, notes: string) => {
    const updatedItems = order.orderItems.map(item =>
      item.id === itemId ? { ...item, notes } : item
    );

    setOrder({
      ...order,
      orderItems: updatedItems,
    });
  };

  const handleRemoveItem = (itemId: number) => {
    const updatedItems = order.orderItems.filter(item => item.id !== itemId);
    const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    setOrder({
      ...order,
      orderItems: updatedItems,
      total,
    });
  };

  const getNextSlotId = () => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    // Default to a fallback slot ID if no slot data is available
    if (!slotData?.allTimeSlots || slotData.allTimeSlots.length === 0) {
      return 20; // Default fallback slot ID
    }

    const nextSlot = slotData.allTimeSlots.find((slot: any) => {
      const [hour, minute] = slot.startTime.split(':').map(Number);
      const slotMinutes = hour * 60 + minute;
      return slotMinutes > nowMinutes;
    });

    return nextSlot?.id || slotData.allTimeSlots[slotData.allTimeSlots.length - 1].id;
  };

  const handleSaveOrder = async () => {
    try {
      setIsLoading(true);

      // Transform order items to match the GraphQL input type
      const orderItems = order.orderItems.map(item => ({
        dishId: item.dish.id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || '',
      }));

      const now = new Date();

      const createBookingRes = await createBooking({
        variables: {
          customerName: 'Guest',
          phoneNumber: '0000000000',
          reservationDate: now.toISOString().split('T')[0],
          startSlotId: getNextSlotId(),
          durationSlots: 6,
          peopleCount: peopleCount || 1,
          bookingType: 'dine-in',
          customerNote: '',
          tableId: tableId,
        },
      });

      if (!createBookingRes?.data?.createBooking?.id) {
        throw new Error('Failed to create booking');
      }

      const bookingId = createBookingRes.data.createBooking.id;

      // Call the createOrder mutation
      const { data } = await createOrder({
        variables: {
          bookingId: parseInt(bookingId),
          orderItems,
          createdBy: user || '',
        },
      });

      await handleUpdateTableStatus(tableId, 'occupied');

      // Call the onSave callback with the created order
      if (data?.createOrder) {
        setIsLoading(false);
        // Show success modal
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          onSave(data.createOrder);
          onClose();
        }, 500);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error in handleSaveOrder:', {
        error,
        tableId,
        orderDetails: {
          items: order.orderItems.length,
          total: order.total,
        },
      });
      setIsLoading(false);
    }
  };

  // Handle click outside modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the overlay, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white md:bg-gray-800/80 md:backdrop-blur-sm flex items-start md:items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full h-full md:h-auto md:rounded-3xl md:w-full md:max-w-6xl md:max-h-[90vh] overflow-hidden shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center sticky top-0 bg-white z-10">
          <button
            onClick={e => {
              e.stopPropagation();
              onClose();
            }}
            className="mr-3 p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <FaArrowLeft className="text-gray-400" />
          </button>
          <h2 className="text-lg font-medium text-gray-700">
            {existingOrder ? 'Edit Order' : 'New Order'}
          </h2>
        </div>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccessModal && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50"
            >
              <FaCheckCircle className="text-green-500 text-xl" />
              <span className="font-medium">Order created successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Spinner Modal */}
        <SpinningModal
          isOpen={isLoading}
          message="Creating your order..."
          size="medium"
          color="blue"
        />

        {/* Mobile Layout */}
        <div className="flex flex-col md:hidden h-[calc(100vh-64px)] overflow-hidden">
          {/* Menu Categories */}
          <div className="flex-1 overflow-y-auto px-4 py-3 pb-20">
            {dishesLoading ? (
              <SpinningModal
                isOpen={true}
                message="Loading menu items..."
                size="medium"
                color="blue"
                overlayColor="transparent"
              />
            ) : (
              Object.entries(dishesByCategory).map(([category, dishes]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-base font-medium text-gray-700 mb-3">{category}</h3>
                  <div className="grid grid-cols-2 gap-2 cursor-pointer">
                    {(dishes as any[]).map((dish: any) => (
                      <button
                        key={dish.id}
                        onClick={e => {
                          e.stopPropagation();
                          handleAddOrUpdateItem(dish);
                        }}
                        className="flex flex-col items-center p-3 rounded-xl border border-gray-100 
                                 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                      >
                        <div className="text-2xl mb-1">{dish.image}</div>
                        <div className="text-sm font-medium text-gray-800 text-center cursor-pointer">
                          {dish.name}
                        </div>
                        <div className="text-sm text-gray-500">{formatCurrency(dish.price)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
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
                    {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(order.total)}</span>
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
                className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 rounded-t-2xl shadow-lg z-50"
                style={{ maxHeight: '80vh' }}
              >
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

                <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 180px)' }}>
                  <div className="p-4 space-y-4">
                    {order.orderItems.map(item => (
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
                          value={item.notes}
                          onChange={e => handleUpdateNotes(item.id, e.target.value)}
                          className="w-full p-2 text-sm bg-white border border-gray-200 
                                   rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium text-gray-800">Total</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onClose();
                      }}
                      className="flex-1 py-3 border border-gray-200 text-gray-700 
                               rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleSaveOrder();
                      }}
                      disabled={order.orderItems.length === 0 || isSubmitting}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl 
                               hover:bg-blue-700 transition-colors text-sm font-medium
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Order'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex h-[calc(90vh-140px)]">
          {/* Menu Items Grid */}
          <div className="w-2/3 p-6 overflow-y-auto border-r border-gray-100">
            {dishesLoading ? (
              <SpinningModal
                isOpen={true}
                message="Loading menu items..."
                size="medium"
                color="blue"
                overlayColor="transparent"
              />
            ) : (
              Object.entries(dishesByCategory).map(([category, dishes]) => (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">{category}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(dishes as any[]).map((dish: any) => (
                      <button
                        key={dish.id}
                        onClick={e => {
                          e.stopPropagation();
                          handleAddOrUpdateItem(dish);
                        }}
                        className="p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 
                                 hover:bg-blue-50 transition-all duration-200 text-left group cursor-pointer"
                      >
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform cursor-pointer">
                          {dish.image}
                        </div>
                        <div className="font-medium text-gray-800">{dish.name}</div>
                        <div className="text-gray-500">{formatCurrency(dish.price)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Summary for Desktop */}
          <div className="w-1/3 flex flex-col bg-gray-50">
            <div className="flex-1 p-6 overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Order Items</h3>
              {order.orderItems.length > 0 ? (
                <div className="space-y-3">
                  {order.orderItems.map(item => (
                    <div
                      key={item.id}
                      className="bg-white p-3 rounded-xl border border-gray-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800 truncate">{item.dish.name}</span>
                        <span className="font-medium text-gray-800">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
                          >
                            <FaMinus className="text-gray-500 text-sm" />
                          </button>
                          <span className="w-8 text-center font-medium text-gray-700">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
                          >
                            <FaPlus className="text-gray-500 text-sm" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Add notes for this item..."
                        value={item.notes}
                        onChange={e => handleUpdateNotes(item.id, e.target.value)}
                        className="w-full p-2 text-sm bg-gray-50 border border-gray-200 
                                 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No items added yet</div>
              )}
            </div>

            {/* Total and Actions */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium text-gray-700">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(order.total)}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium 
                           rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleSaveOrder();
                  }}
                  disabled={order.orderItems.length === 0 || isSubmitting}
                  className="flex-1 py-3 bg-blue-600 text-white font-medium 
                           rounded-xl hover:bg-blue-700 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrderModal;
