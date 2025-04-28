import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaMoneyBill, FaShoppingCart, FaChartLine, FaPlus, FaTrash } from 'react-icons/fa';
import { useQuery } from '@apollo/client';
import { GET_ORDERS } from '@/services/orderServices';

interface ShiftReportProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    id: number;
    clockIn: string;
    clockOut: string;
    moneyIn: number;
    moneyOut: number;
    status: string;
    userId: number;
    note: string;
  };
  onSaveReport?: (reportData: ShiftReportData) => void;
}

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
}

interface ShiftReportData {
  startTime: string;
  endTime: string;
  totalSales: number;
  totalOrders: number;
  paymentMethods: {
    cash: number;
    card: number;
  };
  expenses: Expense[];
  totalExpenses: number;
  netIncome: number;
  moneyIn: number;
  moneyOut: number;
  cashout: number;
}

interface Order {
  id: number;
  total: number;
  payment?: string;
  createdAt: string;
  status: string;
}

const ShiftReport: React.FC<ShiftReportProps> = ({ isOpen, onClose, userData, onSaveReport }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'supplies',
  });
  const [moneyIn, setMoneyIn] = useState<number>(0);
  const [moneyOut, setMoneyOut] = useState<number>(0);
  const [cashout, setCashout] = useState<number>(0);
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    totalOrders: 0,
    paymentMethods: {
      cash: 0,
      card: 0,
    },
  });

  // Fetch orders
  const { data: ordersData, loading: ordersLoading } = useQuery(GET_ORDERS);

  useEffect(() => {
    // Calculate cashout (money in - money out)
    setCashout(moneyIn - moneyOut || 0);
    console.log('userData in report', userData);
  }, [userData, moneyIn, moneyOut]);

  useEffect(() => {
    if (ordersData && ordersData.allOrders) {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      // Filter orders for today and only include paid orders
      const todayOrders = ordersData.allOrders.filter((order: Order) => {
        try {
          // Check if createdAt is a valid timestamp
          if (!order.createdAt) return false;

          // Parse the timestamp (milliseconds since epoch)
          const timestamp = parseInt(order.createdAt, 10);
          if (isNaN(timestamp)) return false;
          // Create date from timestamp
          const orderDate = new Date(timestamp);
          // Check if the date is valid
          if (isNaN(orderDate.getTime())) return false;

          // Format the date to YYYY-MM-DD for comparison
          const formattedDate = orderDate.toISOString().split('T')[0];
          // Only include paid orders from today
          return formattedDate === today;
        } catch (error) {
          console.error('Error parsing date:', error);
          return false;
        }
      });
      console.log('todayOrders', todayOrders);
      // Calculate total sales
      const totalSales = todayOrders.reduce((sum: number, order: Order) => sum + order.total, 0);
      // For simplicity, assume all orders are cash payments
      const cashTotal = totalSales;
      const cardTotal = 0;

      setSalesData({
        totalSales,
        totalOrders: todayOrders.length,
        paymentMethods: {
          cash: cashTotal,
          card: cardTotal,
        },
      });
    }
  }, [ordersData]);

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

  const handleSaveReport = () => {
    if (onSaveReport) {
      const reportData: ShiftReportData = {
        startTime: userData.clockIn,
        endTime: userData.clockOut,
        totalSales: salesData.totalSales,
        totalOrders: salesData.totalOrders,
        paymentMethods: salesData.paymentMethods,
        expenses,
        totalExpenses,
        netIncome,
        moneyIn,
        moneyOut,
        cashout,
      };
      onSaveReport(reportData);
    }
    onClose();
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
        className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-y-auto max-h-[90vh]"
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
                <p className="text-sm font-medium text-gray-800">{formatTime(userData?.clockIn)}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">End Time</span>
                <p className="text-sm font-medium text-gray-800">
                  {formatTime(userData?.clockOut)}
                </p>
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
              {ordersLoading ? (
                <div className="text-center py-4">
                  <p className="text-sm text-blue-700">Loading sales data...</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">Total Sales</span>
                    <span className="text-sm font-semibold text-blue-700">
                      {formatCurrency(salesData.totalSales)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">Total Orders</span>
                    <span className="text-sm font-medium text-blue-700">
                      {salesData.totalOrders}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Money In/Out */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-medium text-gray-800 flex items-center gap-2">
              <FaMoneyBill className="w-4 h-4 text-green-500" />
              Cash Management
            </h3>
            <div className="bg-green-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Money In</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={moneyIn}
                    onChange={e => setMoneyIn(Number(e.target.value))}
                    className="w-24 px-2 py-1 text-sm bg-white border border-green-200 rounded-lg 
                             focus:outline-none focus:border-green-500"
                  />
                  <span className="text-sm font-medium text-green-700">VND</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Money Out</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={moneyOut}
                    onChange={e => setMoneyOut(Number(e.target.value))}
                    className="w-24 px-2 py-1 text-sm bg-white border border-green-200 rounded-lg 
                             focus:outline-none focus:border-green-500"
                  />
                  <span className="text-sm font-medium text-green-700">VND</span>
                </div>
              </div>
              <div className="border-t border-green-100 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-700">Cashout</span>
                  <span className="text-sm font-semibold text-green-700">
                    {formatCurrency(cashout)}
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cashout</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(cashout)}
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

          {/* Save Button */}
          <div className="mt-6">
            <button
              onClick={handleSaveReport}
              className="w-full py-2 bg-green-600 text-white rounded-lg text-sm 
                       hover:bg-green-700 transition-colors"
            >
              Save Report
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShiftReport;
