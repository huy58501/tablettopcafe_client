import { Table, Order, OrderItem } from '@/types/table';
import OrderModal from './modal/OrderModal';
import OrderDetails from './modal/OrderDetails';
import SplitBill, { FinalSplitData, SplitBillState } from './modal/SplitBill';
import TableHistory from './TableHistory';
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
  FaCalendarAlt,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useTables } from '@/hooks/useTable';
import SpinningModal from '@/components/UI/SpinningModal';
import { useUpdateOrderStatus } from '@/hooks/useOrder';
import { useReservations } from '@/hooks/useReservations';
import TableBooking from './TableBooking';
import { useBookingNotifications } from '@/hooks/useBookingNotifications';

// Extended OrderItem interface
export interface ExtendedOrderItem extends OrderItem {
  name: string;
}

// Extended Table type to include orders
export interface TableWithOrders extends Table {
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

const Tables: React.FC = () => {
  const [tables, setTables] = useState<TableWithOrders[]>([]);
  const [tablesByRoom, setTablesByRoom] = useState<TablesByRoom>({});
  const [selectedTable, setSelectedTable] = useState<TableWithOrders | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'booking'>('current');
  // Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPeopleCountModalOpen, setIsPeopleCountModalOpen] = useState(false);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isSplitBillOpen, setIsSplitBillOpen] = useState(false);

  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [tempPeopleCount, setTempPeopleCount] = useState<string>('1');
  const [_splitBillData, setSplitBillData] = useState<any>(null);
  const {
    tablesData,
    tablesLoading,
    handleUpdateTableStatus,
    handleUpdateBookingTableChange,
    refetchTables,
  } = useTables();
  const { handleUpdateOrderStatus, handleUpdateOrderPayment } = useUpdateOrderStatus();
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const { handleUpdateStatus } = useReservations();
  const [isTableChangeLoading, setIsTableChangeLoading] = useState(false);
  const { upcomingBookingNotification, setUpcomingBookingNotification } = useBookingNotifications();
  const [orderLoading, setOrderLoading] = useState(false);

  // Add auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        refetchTables();
      },
      5 * 60 * 1000
    ); // 5 minutes in milliseconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [refetchTables]);

  // Format currency to VND with thousands separators
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')}`;
  };

  useEffect(() => {
    if (tablesData) {
      setOrderLoading(true);
      const mappedTables = [...tablesData.allTable].sort((a: Table, b: Table) => a.id - b.id);
      console.log('mappedTable: ', mappedTables);
      setTables(mappedTables);

      // Group tables by room
      const groupedTables: TablesByRoom = {};
      mappedTables.forEach((table: TableWithOrders) => {
        const room = table.room || 'Main Area';
        if (!groupedTables[room]) {
          groupedTables[room] = [];
        }
        groupedTables[room].push(table);
      });

      setTablesByRoom(groupedTables);
      setOrderLoading(false);
    }
  }, [tablesData]);

  const handleTableClick = (table: TableWithOrders) => {
    setSelectedTable(table);

    if (table.status === 'available') {
      // If table is available, open the people count modal first
      setIsPeopleCountModalOpen(true);
    } else if (table.status === 'occupied') {
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

  // Reset all modal states and temporary data
  const resetModalStates = () => {
    setIsOrderModalOpen(false);
    setIsPeopleCountModalOpen(false);
    setIsOrderDetailsOpen(false);
    setIsSplitBillOpen(false);
    setPeopleCount(1);
    setTempPeopleCount('1');
    setSplitBillData(null);
    setIsPaymentLoading(false);
  };

  // Handle closing modals with proper state cleanup
  const handleCloseModal = (modalType: 'order' | 'peopleCount' | 'orderDetails' | 'splitBill') => {
    switch (modalType) {
      case 'order':
        // If order modal is closed, reset all states
        resetModalStates();
        break;
      case 'peopleCount':
        // Reset people count and close modal
        setPeopleCount(1);
        setTempPeopleCount('1');
        setIsPeopleCountModalOpen(false);
        break;
      case 'orderDetails':
        // Just close the modal, preserve the order data
        setIsOrderDetailsOpen(false);
        break;
      case 'splitBill':
        // If split bill is cancelled, just close the modal and preserve order data
        setIsSplitBillOpen(false);
        setIsPaymentLoading(false);
        break;
    }
  };

  // Handle overlay clicks for each modal
  const handleOverlayClick = (
    e: React.MouseEvent<HTMLDivElement>,
    modalType: 'order' | 'peopleCount' | 'orderDetails' | 'splitBill'
  ) => {
    if (e.target === e.currentTarget) {
      handleCloseModal(modalType);
    }
  };

  const handleSplitBill = (splitData: FinalSplitData) => {
    // Process the split bill data first
    const splitBillData = splitData.splits.map((item: SplitBillState) => ({
      ...item,
      total: item.total,
    }));
    let splitTotal = 0;
    const splitReference: string[] = [];

    splitBillData.forEach((item: SplitBillState) => {
      splitTotal += item.total;
      splitReference.push(`${item.paymentMethod} + ${item.total.toLocaleString('vi-VN')}`);
    });

    // Set loading state before closing modal
    setIsPaymentLoading(true);

    // Close the split bill modal
    setIsSplitBillOpen(false);

    // Process payment
    handlePaymentConfirm({
      paymentMethod: 'Split Bill',
      amount: splitTotal,
      reference: splitReference.join(', '),
    });
  };

  const handlePaymentConfirm = async (paymentData: {
    paymentMethod: string;
    amount: number;
    reference: string;
  }) => {
    setIsPaymentLoading(true);
    try {
      // Update the order status to 'paid'
      if (paymentData.amount === selectedTable?.orders?.total) {
        await handleUpdateOrderPayment(
          selectedTable?.orders?.id || 0,
          paymentData.paymentMethod,
          paymentData.reference
        );
        await handleUpdateOrderStatus(selectedTable?.orders?.id || 0, 'paid');
        await handleUpdateTableStatus(selectedTable?.id || 0, 'available');
        await handleUpdateStatus(
          selectedTable?.bookings[selectedTable?.bookings.length - 1]?.id.toString() || '0',
          'Confirmed'
        );
      } else {
        console.error('Payment amount is incorrect');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleTableChange = async (newTableId: number): Promise<void> => {
    setIsTableChangeLoading(true);
    const bookingId = selectedTable?.bookings[selectedTable?.bookings.length - 1]?.id;
    const currentTableId = selectedTable?.id;
    try {
      await handleUpdateBookingTableChange(bookingId || 0, newTableId);
      await handleUpdateTableStatus(currentTableId || 0, 'available');
      await handleUpdateTableStatus(newTableId, 'occupied');

      // Update local state
      setTables(prevTables =>
        prevTables.map(table => {
          if (table.id === currentTableId) {
            return { ...table, status: 'available', orders: null };
          }
          if (table.id === newTableId && selectedTable?.orders) {
            return {
              ...table,
              status: 'occupied',
              orders: selectedTable.orders,
              bookings: selectedTable.bookings,
            };
          }
          return table;
        })
      );

      // Update tablesByRoom state
      setTablesByRoom(prevTablesByRoom => {
        const newTablesByRoom = { ...prevTablesByRoom };
        Object.keys(newTablesByRoom).forEach(room => {
          newTablesByRoom[room] = newTablesByRoom[room].map(table => {
            if (table.id === currentTableId) {
              return { ...table, status: 'available', orders: null };
            }
            if (table.id === newTableId && selectedTable?.orders) {
              return {
                ...table,
                status: 'occupied',
                orders: selectedTable.orders,
                bookings: selectedTable.bookings,
              };
            }
            return table;
          });
        });
        return newTablesByRoom;
      });
    } catch (error) {
      console.error('Error updating booking table change:', error);
    } finally {
      setIsTableChangeLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen ">
      {/* Loading Spinner */}
      <SpinningModal isOpen={tablesLoading} message="Loading tables..." />

      <SpinningModal isOpen={isPaymentLoading} message="Processing payment..." />

      <SpinningModal isOpen={isTableChangeLoading} message="Changing table..." />

      <SpinningModal isOpen={orderLoading} message="Loading orders..." />

      {/* Upcoming Booking Notification */}
      {upcomingBookingNotification && (
        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white p-4 rounded-lg shadow-lg max-w-md animate-slide-in">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaCalendarAlt className="h-6 w-6" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">
                Upcoming Booking in{' '}
                {Math.max(
                  0,
                  Math.round(
                    (new Date(Number(upcomingBookingNotification.reservationDate)).getTime() -
                      new Date().getTime()) /
                      60000
                  )
                )}{' '}
                minutes!
              </h3>
              <div className="mt-2 text-sm">
                <p>Table {upcomingBookingNotification.table?.number || 'N/A'}</p>
                <p>Customer: {upcomingBookingNotification.customerName}</p>
                <p>Time: {upcomingBookingNotification.startSlot.startTime}</p>
                <p>Guests: {upcomingBookingNotification.peopleCount}</p>
              </div>
              <button
                onClick={() => setUpcomingBookingNotification(null)}
                className="mt-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

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
                  ? 'border-blue-500 text-blue-600 cursor-pointer'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer'
              }`}
            >
              <FaTable className="mr-2" />
              Current Tables
            </button>
            <button
              onClick={() => setActiveTab('booking')}
              className={`flex items-center py-4 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'booking'
                  ? 'border-blue-500 text-blue-600 cursor-pointer'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer'
              }`}
            >
              <FaCalendarAlt className="mr-2" />
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center py-4 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600 cursor-pointer'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer'
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
                    const latestOrder =
                      Array.isArray(table.bookings) && table.bookings.length > 0
                        ? table.bookings[table.bookings.length - 1]
                        : null;
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
                                Orders: {latestOrder?.order?.orderItems?.length || 0}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FaMoneyBill className="text-gray-500" />
                              <span className="text-sm md:text-base text-gray-600">
                                Total: {formatCurrency(latestOrder?.order?.total || 0)}
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
        ) : activeTab === 'history' ? (
          <TableHistory tablesData={tables} />
        ) : (
          <TableBooking />
        )}

        {/* People Count Modal */}
        {isPeopleCountModalOpen && selectedTable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-800/80 flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={e => handleOverlayClick(e, 'peopleCount')}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-[450px] shadow-2xl flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Fixed Header */}
              <div className="flex-none bg-gray-50 p-2 border-b border-gray-200 rounded-t-2xl">
                <div className="flex items-center">
                  <button
                    onClick={() => handleCloseModal('peopleCount')}
                    className="mr-3 p-2 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <FaArrowLeft className="text-gray-600 text-lg" />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-800">Number of People</h2>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {/* Display - Fixed at Top of Content */}
                <div className="bg-white border-2 border-blue-100 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">
                    {peopleCount}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <FaUsers className="text-blue-400" />
                    <p className="text-sm sm:text-base">
                      Maximum capacity: {selectedTable.capacity} people
                    </p>
                  </div>
                </div>

                {/* Number Pad - Scrollable */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6 max-w-[400px] mx-auto cursor-pointer">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                      key={num}
                      onClick={e => {
                        e.stopPropagation();
                        handleNumberClick(num);
                      }}
                      className="
                        aspect-square flex items-center justify-center bg-white 
                        border-2 border-gray-200 text-xl sm:text-2xl font-semibold text-gray-700 
                        rounded-xl transition-all duration-200 
                        hover:border-blue-400 hover:bg-blue-50 
                        active:scale-95 touch-manipulation
                        min-h-[3rem] sm:min-h-[4rem]
                        shadow-sm hover:shadow-md
                        cursor-pointer
                      "
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleClearNumber();
                    }}
                    className="
                      aspect-square flex items-center justify-center bg-white 
                      border-2 border-red-200 text-sm sm:text-base font-medium text-red-600 
                      rounded-xl transition-all duration-200 
                      hover:border-red-400 hover:bg-red-50 
                      active:scale-95 touch-manipulation
                      min-h-[3rem] sm:min-h-[4rem]
                      shadow-sm hover:shadow-md
                      cursor-pointer
                    "
                  >
                    Clear
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleNumberClick(0);
                    }}
                    className="
                      aspect-square flex items-center justify-center bg-white 
                      border-2 border-gray-200 text-xl sm:text-2xl font-semibold text-gray-700 
                      rounded-xl transition-all duration-200 
                      hover:border-blue-400 hover:bg-blue-50 
                      active:scale-95 touch-manipulation
                      min-h-[3rem] sm:min-h-[4rem]
                      shadow-sm hover:shadow-md
                      cursor-pointer
                    "
                  >
                    0
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleBackspace();
                    }}
                    className="
                      aspect-square flex items-center justify-center bg-white 
                      border-2 border-gray-200 text-lg sm:text-xl font-medium text-gray-600
                      rounded-xl transition-all duration-200 
                      hover:border-gray-400 hover:bg-gray-50 
                      active:scale-95 touch-manipulation
                      min-h-[3rem] sm:min-h-[4rem]
                      shadow-sm hover:shadow-md
                      cursor-pointer
                    "
                  >
                    <FaArrowLeft />
                  </button>
                </div>
              </div>

              {/* Fixed Action Buttons */}
              <div className="flex-none p-4 border-t border-gray-200">
                <div className="flex gap-2 sm:gap-3 max-w-[400px] mx-auto">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setIsPeopleCountModalOpen(false);
                    }}
                    className="
                      flex-1 py-3 sm:py-4 px-3 sm:px-6
                      border-2 border-gray-200 text-gray-700 
                      font-medium text-sm sm:text-base
                      rounded-xl transition-all duration-200
                      hover:bg-gray-50 active:scale-98
                      shadow-sm hover:shadow-md
                      cursor-pointer
                      touch-manipulation
                    "
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePeopleCountSubmit}
                    className="
                      flex-1 py-3 sm:py-4 px-3 sm:px-6
                      bg-blue-600 text-white font-medium 
                      text-sm sm:text-base rounded-xl 
                      transition-all duration-200
                      hover:bg-blue-700 active:scale-98
                      shadow-sm hover:shadow-md
                      cursor-pointer
                      touch-manipulation
                    "
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
            onClick={e => handleOverlayClick(e, 'order')}
          >
            <OrderModal
              isOpen={isOrderModalOpen}
              onClose={() => handleCloseModal('order')}
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
            onClick={e => handleOverlayClick(e, 'orderDetails')}
          >
            <OrderDetails
              order={selectedTable.orders}
              onClose={() => handleCloseModal('orderDetails')}
              onSplitBill={() => {
                setIsOrderDetailsOpen(false);
                setIsSplitBillOpen(true);
              }}
              onConfirm={handlePaymentConfirm}
              onTableChange={handleTableChange}
            />
          </div>
        )}

        {/* Split Bill Modal */}
        {isSplitBillOpen && selectedTable && selectedTable.orders && (
          <SplitBill
            setIsLoading={setIsPaymentLoading}
            isOpen={isSplitBillOpen}
            onClose={() => handleCloseModal('splitBill')}
            order={selectedTable.orders}
            onConfirm={handleSplitBill}
          />
        )}
      </div>
    </div>
  );
};

export default Tables;
