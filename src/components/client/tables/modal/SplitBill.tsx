import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaMoneyBill,
  FaCheck,
  FaTimes,
  FaArrowRight,
  FaArrowLeft,
  FaPlus,
  FaCreditCard,
} from 'react-icons/fa';
import { ExtendedOrder } from '../Tables';
import QRPayment from './QRPayment';

interface SplitBillProps {
  setIsLoading?: (loading: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
  order: ExtendedOrder;
  onConfirm: (splitData: FinalSplitData) => void;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  notes?: string;
  dish: {
    id: number;
    name: string;
    price: number;
    category?: string;
    isActive: boolean;
  };
}

interface SplitItem extends OrderItem {
  splitQuantity: number;
  name: string;
}

export interface SplitBillState {
  items: SplitItem[];
  total: number;
  paymentMethod: string;
  reference: string;
}

export interface FinalSplitData {
  splits: SplitBillState[];
}

const SplitBill: React.FC<SplitBillProps> = ({
  isOpen,
  onClose,
  order,
  onConfirm,
  setIsLoading,
}) => {
  // Initialize items with split quantities
  const [items, setItems] = useState<SplitItem[]>([]);
  const [bill1Items, setBill1Items] = useState<SplitItem[]>([]);
  const [bill2Items, setBill2Items] = useState<SplitItem[]>([]);
  const [completedSplits, setCompletedSplits] = useState<SplitBillState[]>([]);
  const [splitStep, setSplitStep] = useState(1);
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  // Format currency to VND with thousands separators
  const formatCurrency = (amount: number) => {
    return `VND: ${amount.toLocaleString('vi-VN')}`;
  };

  // Initialize items when order changes
  useEffect(() => {
    if (order) {
      const initialItems = order.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes,
        dish: item.dish,
        name: item.dish?.name || 'Unknown Item',
        splitQuantity: item.quantity,
      }));
      setItems(initialItems);
      setBill1Items(initialItems);
      setBill2Items([]);
      setCompletedSplits([]);
      setSplitStep(1);
    }
  }, [order]);

  const calculateTotal = (items: SplitItem[]) => {
    return items.reduce((total, item) => total + item.price * item.splitQuantity, 0);
  };

  const bill1Total = calculateTotal(bill1Items);
  const bill2Total = calculateTotal(bill2Items);

  const moveItemToBill2 = (item: SplitItem) => {
    if (item.splitQuantity > 0) {
      const updatedBill1Items = bill1Items
        .map(i => {
          if (i.id === item.id) {
            const newSplitQuantity = i.splitQuantity - 1;
            return { ...i, splitQuantity: newSplitQuantity };
          }
          return i;
        })
        .filter(i => i.splitQuantity > 0);

      const existingItem = bill2Items.find(i => i.id === item.id);
      let updatedBill2Items;

      if (existingItem) {
        updatedBill2Items = bill2Items.map(i => {
          if (i.id === item.id) {
            return { ...i, splitQuantity: i.splitQuantity + 1 };
          }
          return i;
        });
      } else {
        updatedBill2Items = [...bill2Items, { ...item, splitQuantity: 1 }];
      }

      setBill1Items(updatedBill1Items);
      setBill2Items(updatedBill2Items);
    }
  };

  const moveItemToBill1 = (item: SplitItem) => {
    if (item.splitQuantity > 0) {
      const updatedBill2Items = bill2Items
        .map(i => {
          if (i.id === item.id) {
            const newSplitQuantity = i.splitQuantity - 1;
            return { ...i, splitQuantity: newSplitQuantity };
          }
          return i;
        })
        .filter(i => i.splitQuantity > 0);

      const existingItem = bill1Items.find(i => i.id === item.id);
      let updatedBill1Items;

      if (existingItem) {
        updatedBill1Items = bill1Items.map(i => {
          if (i.id === item.id) {
            return { ...i, splitQuantity: i.splitQuantity + 1 };
          }
          return i;
        });
      } else {
        updatedBill1Items = [...bill1Items, { ...item, splitQuantity: 1 }];
      }

      setBill1Items(updatedBill1Items);
      setBill2Items(updatedBill2Items);
    }
  };

  const handleSplitConfirm = () => {
    if (!paymentCompleted) {
      // Show QR payment modal first
      handlePayment(bill2Total, `Table ${order.tableId} - Split ${splitStep}`);
    }
  };

  const handleFinalConfirm = (splitsBill: SplitBillState[]) => {
    // Set loading state before sending final data
    setIsLoading?.(true);
    onConfirm({
      splits: splitsBill,
    });
  };

  const handleCancel = () => {
    if (completedSplits.length > 0) {
      // Ask for confirmation before canceling all splits
      if (window.confirm('Are you sure you want to cancel all splits?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handlePayment = (amount: number, reference: string = '') => {
    setPaymentAmount(amount);
    setPaymentReference(reference);
    setShowQRPayment(true);
  };

  const handlePaymentComplete = () => {
    setShowQRPayment(false);
    setPaymentCompleted(false);
  };

  const handlePaymentConfirm = (paymentData: {
    paymentMethod: string;
    amount: number;
    reference: string;
  }) => {
    // Handle the payment confirmation with reference
    console.log(
      `Payment confirmed - Method: ${paymentData.paymentMethod}, Reference: ${paymentData.reference}, Amount: ${paymentData.amount}`
    );

    // Store the payment data for this split
    const newSplit: SplitBillState = {
      items: bill2Items,
      total: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      reference: paymentData.reference,
    };

    setCompletedSplits([...completedSplits, newSplit]);

    // Set loading state before processing final data
    setIsLoading?.(true);

    // If there are remaining items, prepare for next split
    if (bill1Items.length > 0) {
      setIsLoading?.(false);
      setBill2Items([]);
      setSplitStep(splitStep + 1);
      setPaymentCompleted(true);
      handlePaymentComplete();
    } else {
      setIsLoading?.(false);
      // No more items to split, send final data
      handleFinalConfirm([...completedSplits, newSplit]);
      // Loading state will be handled by parent component after this
    }
  };

  if (!isOpen) return null;

  const BillItem = ({
    item,
    onMove,
    direction,
  }: {
    item: SplitItem;
    onMove: () => void;
    direction: 'left' | 'right';
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors 
                ${direction === 'right' ? 'hover:bg-blue-50' : 'hover:bg-gray-50'}`}
      onClick={onMove}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 truncate">{item.name}</h4>
          <div className="flex items-center mt-1 text-sm">
            <span className="font-medium text-gray-600">
              {item.splitQuantity}/{item.quantity}
            </span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="font-medium text-gray-600">
              {formatCurrency(item.price * item.splitQuantity)}
            </span>
          </div>
        </div>
        <div
          className={`ml-3 p-2 rounded-full ${
            direction === 'right' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
          }`}
        >
          {direction === 'right' ? <FaArrowRight /> : <FaArrowLeft />}
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white md:bg-gray-800/80 flex items-start md:items-center justify-center z-50"
      onClick={e => e.target === e.currentTarget && handleCancel()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full h-full md:h-auto md:rounded-2xl md:w-full md:max-w-[1000px] md:max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">Split Bill</h2>
              <p className="text-sm text-gray-600 mt-1">
                Step {splitStep}{' '}
                {completedSplits.length > 0 && `• ${completedSplits.length} split(s) completed`}
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <FaTimes className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row h-[calc(100vh-60px)] md:h-auto">
          {/* Bill 1 */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-100 cursor-pointer">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base md:text-lg font-medium text-gray-700">Remaining Items</h3>
              <span className="text-base md:text-lg font-semibold text-blue-600">
                {formatCurrency(bill1Total)}
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mb-3">
              Tap any item to move it to Split {splitStep}
            </p>
            <div className="space-y-2">
              {bill1Items.map(item => (
                <BillItem
                  key={item.id}
                  item={item}
                  onMove={() => moveItemToBill2(item)}
                  direction="right"
                />
              ))}
            </div>
          </div>

          {/* Bill 2 */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto cursor-pointer">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base md:text-lg font-medium text-gray-700">Split {splitStep}</h3>
              <span className="text-base md:text-lg font-semibold text-blue-600">
                {formatCurrency(bill2Total)}
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mb-3">
              Tap any item to move it back to Remaining Items
            </p>
            <div className="space-y-2">
              {bill2Items.map(item => (
                <BillItem
                  key={item.id}
                  item={item}
                  onMove={() => moveItemToBill1(item)}
                  direction="left"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar - Fixed on Mobile */}
        <div className="fixed bottom-0 left-0 right-0 md:static bg-white border-t border-gray-200 p-4 md:p-6">
          {completedSplits.length > 0 && (
            <div className="mb-4 overflow-x-auto">
              <div className="flex gap-2">
                {completedSplits.map((split, index) => (
                  <div key={index} className="flex-shrink-0 bg-gray-50 rounded-lg p-2">
                    <div className="font-medium text-gray-700">Split {index + 1}</div>
                    <div className="text-sm text-gray-600">{formatCurrency(split.total)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 font-medium 
                       rounded-xl hover:bg-gray-50 transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSplitConfirm}
              disabled={bill2Items.length === 0}
              className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-xl 
                       hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2
                       disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
            >
              <FaCheck className="text-sm" />
              <span>
                {bill1Items.length === 0 ? 'Complete All Splits' : 'Continue to Next Split'}
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* QR Payment Modal */}
      <QRPayment
        isOpen={showQRPayment}
        onClose={() => setShowQRPayment(false)}
        onComplete={handlePaymentComplete}
        amount={paymentAmount}
        tableId={order.tableId}
        reference={paymentReference}
        onConfirm={handlePaymentConfirm}
      />
    </motion.div>
  );
};

export default SplitBill;
