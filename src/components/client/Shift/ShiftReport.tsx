import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaMoneyBill, FaShoppingCart, FaChartLine, FaPlus, FaTrash } from 'react-icons/fa';

interface ShiftReportProps {
  isOpen: boolean;
  onClose: () => void;
  shift: {
    startTime: string;
    endTime: string;
  };
}

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
}

const ShiftReport: React.FC<ShiftReportProps> = ({ isOpen, onClose, shift }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'supplies',
  });

  // Mock data - replace with actual data from your system
  const salesData = {
    totalSales: 2500000,
    totalOrders: 25,
    averageOrderValue: 100000,
    paymentMethods: {
      cash: 1500000,
      card: 1000000,
    },
  };

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount) {
      setExpenses(prev => [
        ...prev,
        {
          id: Date.now(),
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
        },
      ]);
      setNewExpense({
        description: '',
        amount: '',
        category: 'supplies',
      });
    }
  };

  const handleRemoveExpense = (id: number) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return `VND: ${amount.toLocaleString('vi-VN')}`;
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netIncome = salesData.totalSales - totalExpenses;

  if (!isOpen) return null;

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
          <h2 className="text-base font-semibold text-gray-800">Shift Report</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500 w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          {/* Shift Time */}
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-gray-500">Start Time</span>
                <p className="text-sm font-medium text-gray-800">{formatTime(shift.startTime)}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">End Time</span>
                <p className="text-sm font-medium text-gray-800">{formatTime(shift.endTime)}</p>
              </div>
            </div>
          </div>

          {/* Sales Summary */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-medium text-gray-800 flex items-center gap-2">
              <FaChartLine className="w-4 h-4 text-blue-500" />
              Sales Summary
            </h3>
            <div className="bg-blue-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Total Sales</span>
                <span className="text-sm font-semibold text-blue-700">
                  {formatCurrency(salesData.totalSales)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Total Orders</span>
                <span className="text-sm font-medium text-blue-700">{salesData.totalOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Average Order</span>
                <span className="text-sm font-medium text-blue-700">
                  {formatCurrency(salesData.averageOrderValue)}
                </span>
              </div>
              <div className="border-t border-blue-100 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Cash Payments</span>
                  <span className="text-sm font-medium text-blue-700">
                    {formatCurrency(salesData.paymentMethods.cash)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-blue-700">Card Payments</span>
                  <span className="text-sm font-medium text-blue-700">
                    {formatCurrency(salesData.paymentMethods.card)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-medium text-gray-800 flex items-center gap-2">
              <FaShoppingCart className="w-4 h-4 text-red-500" />
              Expenses
            </h3>

            {/* Add Expense Form */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-3">
              <input
                type="text"
                placeholder="Description"
                value={newExpense.description}
                onChange={e => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg 
                         focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={e => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                  className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg 
                           focus:outline-none focus:border-blue-500"
                />
                <select
                  value={newExpense.category}
                  onChange={e => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg 
                           focus:outline-none focus:border-blue-500"
                >
                  <option value="supplies">Supplies</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="utilities">Utilities</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button
                onClick={handleAddExpense}
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm 
                         hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaPlus className="w-3 h-3" />
                Add Expense
              </button>
            </div>

            {/* Expenses List */}
            <div className="space-y-2">
              {expenses.map(expense => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-xl"
                >
                  <div>
                    <p className="text-sm font-medium text-red-800">{expense.description}</p>
                    <p className="text-xs text-red-600 capitalize">{expense.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-red-800">
                      {formatCurrency(expense.amount)}
                    </span>
                    <button
                      onClick={() => handleRemoveExpense(expense.id)}
                      className="p-1 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <FaTrash className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="border-t border-gray-100 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Sales</span>
                <span className="text-sm font-medium text-gray-800">
                  {formatCurrency(salesData.totalSales)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Expenses</span>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-base font-medium text-gray-800">Net Income</span>
                <span className="text-base font-semibold text-green-600">
                  {formatCurrency(netIncome)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShiftReport;
