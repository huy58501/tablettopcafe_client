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
} from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useTables } from '@/hooks/useTable';
import SpinningModal from '@/components/UI/SpinningModal';

interface TablesProps {
  onTableSelect?: (table: TableWithOrders) => void;
}

// Extended Table type to include orders
interface TableWithOrders extends Table {
  orders: ExtendedOrder | null;
  room?: string;
}

// Extended Order type to include additional properties needed for the UI
export interface ExtendedOrder extends Order {
  orderItems: OrderItem[];
  customerName?: string;
  customerNote?: string;
}

// Group tables by room
interface TablesByRoom {
  [room: string]: TableWithOrders[];
}

const Tables: React.FC<TablesProps> = ({ onTableSelect }) => {
  const [tables, setTables] = useState<TableWithOrders[]>([]);
  const [tablesByRoom, setTablesByRoom] = useState<TablesByRoom>({});
  const [selectedTable, setSelectedTable] = useState<TableWithOrders | null>(null);
  // Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPeopleCountModalOpen, setIsPeopleCountModalOpen] = useState(false);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isSplitBillOpen, setIsSplitBillOpen] = useState(false);

  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [tempPeopleCount, setTempPeopleCount] = useState<string>('1');
  const [splitBillData, setSplitBillData] = useState<any>(null);
  const [totalBill, setTotalBill] = useState<number>(0);
  const { data: tablesData, loading: tablesLoading } = useTables();
  // Format currency to VND with thousands separators
  const formatCurrency = (amount: number) => {
    return `VND: ${amount.toLocaleString('vi-VN')}`;
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
      setTotalBill(mappedTables.reduce((acc: number, table: TableWithOrders) => acc + (table.orders?.total || 0), 0));

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

      // Debug log
      if (process.env.NODE_ENV === 'development') {
        console.log('Mapped Tables:', mappedTables);
      }
    }
  }, [tablesData]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('tablesData: ', tablesData);
      console.warn('tables data:', tables);
      console.warn('tables by room:', tablesByRoom);
    }
  }, [tables, tablesByRoom]);

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

    // Debug log
    if (process.env.NODE_ENV === 'development') {
      console.log('Updated order:', order);
    }

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
    if (splitTotal === totalBill) {
      console.log('Split bill data is correct');
    } else {
      console.log('Split bill data is incorrect');
    }
    // You can add your logic here to update the order or handle the payment
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
      </div>
    </div>
  );
};

export default Tables;
