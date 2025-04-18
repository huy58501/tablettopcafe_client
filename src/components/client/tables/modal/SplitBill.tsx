import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMoneyBill, FaCheck, FaTimes, FaArrowRight, FaArrowLeft, FaPlus } from 'react-icons/fa';
import { ExtendedOrder } from '../Tables';

interface SplitBillProps {
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

interface SplitBillState {
  items: SplitItem[];
  total: number;
}

interface FinalSplitData {
  splits: SplitBillState[];
}

const SplitBill: React.FC<SplitBillProps> = ({ isOpen, onClose, order, onConfirm }) => {
  // Initialize items with split quantities
  const [items, setItems] = useState<SplitItem[]>([]);
  const [bill1Items, setBill1Items] = useState<SplitItem[]>([]);
  const [bill2Items, setBill2Items] = useState<SplitItem[]>([]);
  const [completedSplits, setCompletedSplits] = useState<SplitBillState[]>([]);
  const [splitStep, setSplitStep] = useState(1);

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
    if (bill2Items.length > 0) {
      // Store current split
      const newSplit: SplitBillState = {
        items: bill2Items,
        total: bill2Total,
      };
      setCompletedSplits([...completedSplits, newSplit]);

      // Continue with remaining items in Bill 1
      if (bill1Items.length > 0) {
        setBill2Items([]);
        setSplitStep(splitStep + 1);
      } else {
        // No more items to split, send final data
        handleFinalConfirm([...completedSplits, newSplit]);
      }
    }
  };

  const handleFinalConfirm = (splits: SplitBillState[]) => {
    onConfirm({
      splits: splits,
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
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
    >
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h4 className="font-medium text-gray-800">{item.name}</h4>
          <p className="text-sm text-gray-600">{item.notes}</p>
          <div className="flex items-center mt-1">
            <span className="text-sm font-medium text-gray-700">
              Quantity: {item.splitQuantity}/{item.quantity}
            </span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-sm font-medium text-gray-700">
              {formatCurrency(item.price * item.splitQuantity)}
            </span>
          </div>
        </div>
        <button
          onClick={onMove}
          className={`ml-4 p-2 rounded-full transition-colors ${
            direction === 'right'
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          {direction === 'right' ? <FaArrowRight /> : <FaArrowLeft />}
        </button>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-800/80 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && handleCancel()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-[1000px] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Split Bill</h2>
              <p className="text-sm text-gray-600 mt-1">
                Step {splitStep}{' '}
                {completedSplits.length > 0 && `• ${completedSplits.length} split(s) completed`}
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <FaTimes className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex gap-6">
            {/* Bill 1 */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">Remaining Items</h3>
                <span className="text-lg font-semibold text-blue-600">
                  {formatCurrency(bill1Total)}
                </span>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
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
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">Split {splitStep}</h3>
                <span className="text-lg font-semibold text-blue-600">
                  {formatCurrency(bill2Total)}
                </span>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
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

          {/* Completed Splits Summary */}
          {completedSplits.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Completed Splits</h3>
              <div className="flex flex-wrap gap-3">
                {completedSplits.map((split, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-700">Split {index + 1}</div>
                    <div className="text-sm text-gray-600">{formatCurrency(split.total)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="flex-1 py-3.5 px-4 border-2 border-gray-200 text-gray-700 font-medium 
                       rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSplitConfirm}
              disabled={bill2Items.length === 0}
              className="flex-1 py-3.5 px-4 bg-blue-600 text-white font-medium 
                       rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 
                       disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaCheck className="text-sm" />
              <span>
                {bill1Items.length === 0 ? 'Complete All Splits' : 'Continue to Next Split'}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SplitBill;
