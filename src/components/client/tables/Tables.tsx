import { Table, Order, OrderItem } from '@/types/table';
import OrderModal from './modal/OrderModal';
import OrderDetails from './modal/OrderDetails';
import SplitBill from './modal/SplitBill';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaUtensils,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowLeft,
  FaMoneyBill,
  FaDoorOpen,
  FaHistory,
  FaTable,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useTables } from '@/hooks/useTable';
import SpinningModal from '@/components/UI/SpinningModal';
import { useUpdateOrderStatus } from '@/hooks/useOrder';

// Extended OrderItem interface
interface ExtendedOrderItem extends OrderItem {
  name: string;
}

// Extended Table type to include orders
interface TableWithOrders extends Table {
  orders: ExtendedOrder | null;
  room?: string;
}

// Extended Order type to include additional properties needed for the UI
export interface ExtendedOrder extends Order {
  orderItems: ExtendedOrderItem[];
  customerName?: string;
  customerNote?: string;
}

// Group tables by room
interface TablesByRoom {
  [room: string]: TableWithOrders[];
}

// Table history record
interface TableHistoryRecord {
  id: number;
  tableId: number;
  tableNumber: string;
  room: string;
  status: string;
  capacity: number;
  timestamp: string;
  action: string;
  total: string;
  details: string;
  orderDetails?: HistoryOrderDetails;
}

// Interface for order details modal in history
interface HistoryOrderDetails {
  id: number;
  orderItems: ExtendedOrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

const Tables: React.FC = () => {
  const [tables, setTables] = useState<TableWithOrders[]>([]);
  const [tablesByRoom, setTablesByRoom] = useState<TablesByRoom>({});
  const [selectedTable, setSelectedTable] = useState<TableWithOrders | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [tableHistory, setTableHistory] = useState<TableHistoryRecord[]>([]);
  // Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPeopleCountModalOpen, setIsPeopleCountModalOpen] = useState(false);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isSplitBillOpen, setIsSplitBillOpen] = useState(false);

  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [tempPeopleCount, setTempPeopleCount] = useState<string>('1');
  const [splitBillData, setSplitBillData] = useState<any>(null);
  const [totalBill, setTotalBill] = useState<number>(0);
  const { tablesData, tablesLoading, handleUpdateTableStatus } = useTables();
  const { handleUpdateOrderStatus, handleUpdateOrderPayment } = useUpdateOrderStatus();
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<HistoryOrderDetails | null>(
    null
  );
  const [isHistoryOrderDetailsOpen, setIsHistoryOrderDetailsOpen] = useState(false);

  // Format currency to VND with thousands separators
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')}`;
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  useEffect(() => {
    if (tablesData) {
      const mappedTables = tablesData.allTable.map((table: Table) => ({
        ...table,
        orders:
          table.status === 'occupied' &&
          table.bookings?.length > 0 &&
          table.bookings[table.bookings.length - 1]?.order
            ? table.bookings[table.bookings.length - 1].order
            : null,
      }));
      setTables(mappedTables);
      setTotalBill(
        mappedTables.reduce(
          (acc: number, table: TableWithOrders) => acc + (table.orders?.total || 0),
          0
        )
      );

      // Group tables by room and sort by ID
      const groupedTables: TablesByRoom = {};
      mappedTables.forEach((table: TableWithOrders) => {
        const room = table.room || 'Main Area';
        if (!groupedTables[room]) {
          groupedTables[room] = [];
        }
        groupedTables[room].push(table);
      });

      // Sort tables by ID within each room
      Object.keys(groupedTables).forEach(room => {
        groupedTables[room].sort((a, b) => a.id - b.id);
      });

      setTablesByRoom(groupedTables);

      // Generate table history data
      generateTableHistory(mappedTables);
    }
  }, [tablesData]);

  // Generate table history from tables data
  const generateTableHistory = (tablesData: TableWithOrders[]) => {
    const history: TableHistoryRecord[] = [];

    // Get today's date range (12am to 12pm)
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Process all orders from tablesData
    if (tablesData && tablesData.length > 0) {
      // Get all orders from all tables
      const allOrders: any[] = [];
      tablesData.forEach(table => {
        if (table.bookings && table.bookings.length > 0) {
          table.bookings.forEach(booking => {
            if (booking.order && booking.order.status === 'paid') {
              allOrders.push({
                ...booking.order,
                tableId: table.id,
                tableNumber: table.number,
                room: table.room || 'Main Area',
                capacity: table.capacity,
              });
            }
          });
        }
      });

      // Filter orders created today
      allOrders.forEach(order => {
        // Convert timestamp to Date object
        const orderDate = new Date(parseInt(order.createdAt));

        // Check if the order was created today (between startOfDay and endOfDay)
        if (orderDate >= startOfDay && orderDate <= endOfDay) {
          // Add only the order record for paid orders
          history.push({
            id: history.length + 1,
            tableId: order.tableId,
            tableNumber: order.tableNumber,
            room: order.room,
            status: order.status,
            capacity: order.capacity,
            timestamp: order.createdAt,
            action: 'Order Paid',
            total: formatCurrency(order.total),
            details: `Order #${order.id}`,
            orderDetails: {
              id: order.id,
              orderItems: order.orderItems,
              total: order.total,
              status: order.status,
              createdAt: order.createdAt,
            },
          });
        }
      });
    }

    // Sort history by timestamp (newest first)
    history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setTableHistory(history);
  };

  const handleTableClick = (table: TableWithOrders) => {
    setSelectedTable(table);

    if (table.status === 'available') {
      // If table is available, open the people count modal first
      setIsPeopleCountModalOpen(true);
    } else if (table.status === 'occupied' && table.orders) {
      // If table is occupied, show the order details
      setIsOrderDetailsOpen(true);
    }
  };

  const handlePeopleCountSubmit = () => {
    if (selectedTable && peopleCount > 0 && peopleCount <= selectedTable.capacity) {
      setIsPeopleCountModalOpen(false);
      setIsOrderModalOpen(true);
    }
  };

  const handleNumberClick = (num: number) => {
    // Convert the clicked number to string
    const newValue = num.toString();

    // Update the temporary value
    setTempPeopleCount(newValue);

    // Only update peopleCount if it's within capacity
    if (selectedTable && num <= selectedTable.capacity) {
      setPeopleCount(num);
    }
  };

  const handleClearNumber = () => {
    setTempPeopleCount('1');
    setPeopleCount(1);
  };

  const handleBackspace = () => {
    // If there's only one digit left, set it to 1
    if (tempPeopleCount.length <= 1) {
      setTempPeopleCount('1');
      setPeopleCount(1);
      return;
    }

    // Remove the last digit
    const newValue = tempPeopleCount.slice(0, -1);
    setTempPeopleCount(newValue);

    // Update peopleCount
    const parsedValue = parseInt(newValue);
    if (!isNaN(parsedValue)) {
      setPeopleCount(parsedValue);
    }
  };

  const handlePaymentConfirm = (paymentData: {
    paymentMethod: string;
    amount: number;
    reference: string;
  }) => {
    // Update the order status to 'paid'
    if (paymentData.amount === selectedTable?.orders?.total) {
      handleUpdateOrderPayment(selectedTable?.orders?.id || 0, paymentData.paymentMethod);
      handleUpdateOrderStatus(selectedTable?.orders?.id || 0, 'paid');
      handleUpdateTableStatus(selectedTable?.id || 0, 'available');
    } else {
      console.log('Payment amount is incorrect');
    }
  };

  // Function to get table status icon and color
  const getTableStatusInfo = (status: string) => {
    switch (status) {
      case 'available':
        return {
          icon: <FaCheckCircle className="text-green-500" />,
          color: 'bg-gradient-to-br from-green-50 to-green-100',
          hoverColor: 'hover:from-green-100 hover:to-green-200',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
        };
      case 'occupied':
        return {
          icon: <FaUtensils className="text-red-500" />,
          color: 'bg-gradient-to-br from-red-50 to-red-100',
          hoverColor: 'hover:from-red-100 hover:to-red-200',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
        };
      case 'reserved':
        return {
          icon: <FaClock className="text-yellow-500" />,
          color: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
          hoverColor: 'hover:from-yellow-100 hover:to-yellow-200',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
        };
      default:
        return {
          icon: <FaExclamationCircle className="text-gray-500" />,
          color: 'bg-gradient-to-br from-gray-50 to-gray-100',
          hoverColor: 'hover:from-gray-100 hover:to-gray-200',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
        };
    }
  };

  function handleAddOrder(id: number, order: ExtendedOrder): void {
    // Update the tables state with the new order
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === id
          ? {
              ...table,
              status: 'occupied',
              orders: {
                ...order,
                orderItems: order.orderItems || [],
              },
            }
          : table
      )
    );

    // Update tablesByRoom state while preserving table order within each room
    setTablesByRoom(prevTablesByRoom => {
      const newTablesByRoom = { ...prevTablesByRoom };
      Object.keys(newTablesByRoom).forEach(room => {
        newTablesByRoom[room] = [...newTablesByRoom[room]].map(table =>
          table.id === id
            ? {
                ...table,
                status: 'occupied',
                orders: {
                  ...order,
                  orderItems: order.orderItems || [],
                },
              }
            : table
        );
      });
      return newTablesByRoom;
    });

    // Close the order modal
    setIsOrderModalOpen(false);
  }

  // Handle click outside modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the overlay, not its children
    if (e.target === e.currentTarget) {
      if (isOrderModalOpen) {
        setIsOrderModalOpen(false);
      } else if (isPeopleCountModalOpen) {
        setIsPeopleCountModalOpen(false);
      } else if (isOrderDetailsOpen) {
        setIsOrderDetailsOpen(false);
      } else if (isSplitBillOpen) {
        setIsSplitBillOpen(false);
      }
    }
  };

  const handleSplitBill = (splitData: any) => {
    // Here you can handle the split bill data
    setIsSplitBillOpen(false);
    const splitBillData = splitData.splits.map((item: any) => ({
      ...item,
      total: item.total,
    }));
    let splitTotal = 0;
    splitBillData.forEach((item: any) => {
      splitTotal += item.total;
    });
    // You can add your logic here to update the order or handle the payment
  };

  const handleHistoryOrderClick = (orderDetails: HistoryOrderDetails) => {
    setSelectedHistoryOrder(orderDetails);
    setIsHistoryOrderDetailsOpen(true);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Loading Spinner */}
      <SpinningModal
        isOpen={tablesLoading}
        message="Loading tables..."
        size="medium"
        color="blue"
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Table Management</h1>
            <p className="text-gray-600 mt-1">Manage your restaurant tables and orders</p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <FaCheckCircle className="text-green-500" />
              <span className="text-sm text-gray-600">Available</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <FaUtensils className="text-red-500" />
              <span className="text-sm text-gray-600">Occupied</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <FaClock className="text-yellow-500" />
              <span className="text-sm text-gray-600">Reserved</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('current')}
              className={`flex items-center py-4 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'current'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaTable className="mr-2" />
              Current Tables
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center py-4 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaHistory className="mr-2" />
              Table History
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'current' ? (
          <>
            {/* Display tables grouped by room */}
            {Object.entries(tablesByRoom).map(([room, roomTables], roomIndex) => (
              <div key={room} className="mb-8">
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Room: {room}</h2>
                </div>

                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: roomIndex * 0.1 }}
                >
                  {roomTables.map((table, index) => {
                    const statusInfo = getTableStatusInfo(table.status);
                    return (
                      <motion.div
                        key={table.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        onClick={() => handleTableClick(table)}
                        className={`
                          ${statusInfo.color} ${statusInfo.hoverColor} ${statusInfo.borderColor}
                          p-4 md:p-5 rounded-xl border-2 cursor-pointer transform transition-all duration-200
                          hover:scale-105 hover:shadow-lg active:scale-95
                          flex flex-col justify-between min-h-[140px] md:min-h-[160px]
                        `}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg md:text-xl font-bold text-gray-800">
                              {table.number}
                            </h3>
                            <div className="text-xl md:text-2xl">{statusInfo.icon}</div>
                          </div>

                          <div className="space-y-1 md:space-y-2">
                            <div className="flex items-center space-x-2">
                              <FaUsers className="text-gray-500" />
                              <span className="text-sm md:text-base text-gray-600">
                                Capacity: {table.capacity}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FaUtensils className="text-gray-500" />
                              <span className="text-sm md:text-base text-gray-600">
                                Orders: {table.orders?.orderItems?.length || 0}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FaMoneyBill className="text-gray-500" />
                              <span className="text-sm md:text-base text-gray-600">
                                Total: {formatCurrency(table.orders?.total || 0)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className={`text-sm font-medium ${statusInfo.textColor}`}>
                            {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            ))}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Paid Orders History for Today</h2>
              <p className="text-gray-600">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Table
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableHistory.length > 0 ? (
                    tableHistory.map(record => (
                      <tr
                        key={record.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          record.orderDetails && handleHistoryOrderClick(record.orderDetails)
                        }
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.tableNumber}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {record.room}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{record.details}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.total}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                        No paid orders for today
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* People Count Modal */}
        {isPeopleCountModalOpen && selectedTable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-800/80 flex items-center justify-center z-50 p-4"
            onClick={handleOverlayClick}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-[450px] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setIsPeopleCountModalOpen(false);
                    }}
                    className="mr-3 p-2 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <FaArrowLeft className="text-gray-600 text-lg" />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-800">Number of People</h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Display */}
                <div className="bg-white border-2 border-blue-100 rounded-xl p-6 mb-8 text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">{peopleCount}</div>
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <FaUsers className="text-blue-400" />
                    <p className="text-sm">Maximum capacity: {selectedTable.capacity} people</p>
                  </div>
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                      key={num}
                      onClick={e => {
                        e.stopPropagation();
                        handleNumberClick(num);
                      }}
                      className="aspect-square flex items-center justify-center bg-white border-2 border-gray-200 
                               hover:border-blue-400 hover:bg-blue-50 text-2xl font-semibold text-gray-700 
                               rounded-xl transition-all duration-200 active:scale-95"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleClearNumber();
                    }}
                    className="aspect-square flex items-center justify-center bg-white border-2 border-red-200 
                             hover:border-red-400 hover:bg-red-50 text-lg font-medium text-red-600 
                             rounded-xl transition-all duration-200 active:scale-95"
                  >
                    Clear
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleNumberClick(0);
                    }}
                    className="aspect-square flex items-center justify-center bg-white border-2 border-gray-200 
                             hover:border-blue-400 hover:bg-blue-50 text-2xl font-semibold text-gray-700 
                             rounded-xl transition-all duration-200 active:scale-95"
                  >
                    0
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleBackspace();
                    }}
                    className="aspect-square flex items-center justify-center bg-white border-2 border-gray-200 
                             hover:border-gray-400 hover:bg-gray-50 text-lg font-medium text-gray-600 
                             rounded-xl transition-all duration-200 active:scale-95"
                  >
                    ←
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setIsPeopleCountModalOpen(false);
                    }}
                    className="flex-1 py-3.5 px-4 border-2 border-gray-200 text-gray-700 font-medium 
                             rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePeopleCountSubmit}
                    className="flex-1 py-3.5 px-4 bg-blue-600 text-white font-medium 
                             rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Order Modal */}
        {isOrderModalOpen && selectedTable && (
          <div
            className="fixed inset-0 bg-gray-800/80 flex items-center justify-center z-50 p-4"
            onClick={handleOverlayClick}
          >
            <OrderModal
              isOpen={isOrderModalOpen}
              onClose={() => setIsOrderModalOpen(false)}
              onSave={order => handleAddOrder(selectedTable.id, order as ExtendedOrder)}
              tableId={selectedTable.id}
              peopleCount={peopleCount}
            />
          </div>
        )}

        {/* Order Details Modal */}
        {isOrderDetailsOpen && selectedTable && selectedTable.orders && (
          <div
            className="fixed inset-0 bg-gray-800/80 flex items-center justify-center z-50 p-4"
            onClick={handleOverlayClick}
          >
            <OrderDetails
              order={selectedTable.orders}
              onClose={() => setIsOrderDetailsOpen(false)}
              onSplitBill={() => {
                setIsOrderDetailsOpen(false);
                setIsSplitBillOpen(true);
              }}
              onConfirm={handlePaymentConfirm}
            />
          </div>
        )}

        {/* Split Bill Modal */}
        {isSplitBillOpen && selectedTable && selectedTable.orders && (
          <SplitBill
            isOpen={isSplitBillOpen}
            onClose={() => setIsSplitBillOpen(false)}
            order={selectedTable.orders}
            onConfirm={handleSplitBill}
          />
        )}

        {/* History Order Details Modal */}
        {isHistoryOrderDetailsOpen && selectedHistoryOrder && (
          <div
            className="fixed inset-0 bg-gray-800/80 flex items-center justify-center z-50 p-4"
            onClick={() => setIsHistoryOrderDetailsOpen(false)}
          >
            <div
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Order Details #{selectedHistoryOrder.id}
                  </h2>
                  <button
                    onClick={() => setIsHistoryOrderDetailsOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <FaArrowLeft className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Status</span>
                    <span className="font-medium text-green-600">
                      {selectedHistoryOrder.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Date</span>
                    <span>{formatDate(selectedHistoryOrder.createdAt)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-medium text-gray-900 mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {selectedHistoryOrder.orderItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center text-lg font-medium text-gray-900">
                      <span>Total</span>
                      <span>{formatCurrency(selectedHistoryOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tables;
