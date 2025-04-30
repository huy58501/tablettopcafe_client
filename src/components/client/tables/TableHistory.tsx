import { useState, useEffect } from 'react';
import { FaTimes, FaReceipt, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';
import { TableWithOrders, ExtendedOrderItem } from './Tables';
import { motion, AnimatePresence } from 'framer-motion';

// Interface for order details modal in history
interface HistoryOrderDetails {
  id: number;
  orderItems: ExtendedOrderItem[];
  total: number;
  status: string;
  createdAt: string;
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

type TimeFilter = 'today' | 'week' | 'month';

interface TableHistoryProps {
  tablesData: TableWithOrders[];
}

const TableHistory: React.FC<TableHistoryProps> = ({ tablesData }) => {
  const [tableHistory, setTableHistory] = useState<TableHistoryRecord[]>([]);
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<HistoryOrderDetails | null>(
    null
  );
  const [isHistoryOrderDetailsOpen, setIsHistoryOrderDetailsOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');

  // Format currency to VND with thousands separators
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')}`;
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      day: 'numeric',
      month: 'short',
    });
  };

  useEffect(() => {
    generateTableHistory(tablesData);
  }, [tablesData, timeFilter]);

  // Get date range based on time filter
  const getDateRange = () => {
    const today = new Date();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    switch (timeFilter) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
    }

    return { startDate, endDate };
  };

  // Generate table history from tables data
  const generateTableHistory = (tablesData: TableWithOrders[]) => {
    const history: TableHistoryRecord[] = [];
    const { startDate, endDate } = getDateRange();

    console.log('Processing tables data:', tablesData);
    console.log('Date range:', { startDate, endDate });

    if (tablesData && tablesData.length > 0) {
      const allOrders: any[] = [];
      tablesData.forEach(table => {
        console.log(`Processing table ${table.number}:`, table);

        if (table.bookings && table.bookings.length > 0) {
          table.bookings.forEach(booking => {
            console.log(`Processing booking:`, booking);

            if (booking.order) {
              console.log('Found order:', booking.order);
              // Check for either 'PAID' or 'paid' status
              if (
                booking.order.status === 'PAID' ||
                booking.order.status === 'paid' ||
                booking.order.status === 'PAID'
              ) {
                const orderDate = new Date(booking.order.createdAt);
                console.log('Order date:', orderDate);

                if (orderDate >= startDate && orderDate <= endDate) {
                  console.log('Order is within date range');
                  allOrders.push({
                    ...booking.order,
                    tableId: table.id,
                    tableNumber: table.number,
                    room: table.room || 'Main Area',
                    capacity: table.capacity,
                    orderItems: booking.order.orderItems.map(item => ({
                      ...item,
                      name: item.dish.name,
                      price: item.dish.price,
                    })),
                  });
                }
              }
            }
          });
        }
      });

      console.log('All collected orders:', allOrders);

      allOrders.forEach(order => {
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
      });
    }

    console.log('Final history:', history);
    history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setTableHistory(history);
  };

  const handleHistoryOrderClick = (orderDetails: HistoryOrderDetails) => {
    setSelectedHistoryOrder(orderDetails);
    setIsHistoryOrderDetailsOpen(true);
  };

  const getFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case 'today':
        return 'Today';
      case 'week':
        return 'Last 7 Days';
      case 'month':
        return 'Last 30 Days';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Orders History</h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500" />
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium">
              Total Orders: {tableHistory.length}
            </div>
            <div className="flex gap-2">
              {(['today', 'week', 'month'] as TimeFilter[]).map(filter => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    timeFilter === filter
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {getFilterLabel(filter)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {tableHistory.length === 0 ? (
          <div className="p-8 text-center">
            <FaReceipt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-500">There are no completed orders for the selected period.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tableHistory.map(record => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => record.orderDetails && handleHistoryOrderClick(record.orderDetails)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium text-gray-900">
                        Table {record.tableNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {record.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-gray-400" />
                        {record.room}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-gray-400" />
                        {formatDate(record.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <FaMoneyBillWave className="text-green-500" />
                      <span className="font-medium text-gray-900">{record.total} VND</span>
                    </div>
                    <button className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100">
                      <span className="sr-only">View details</span>→
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {isHistoryOrderDetailsOpen && selectedHistoryOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-800/80 flex items-center justify-center z-50 p-4"
            onClick={() => setIsHistoryOrderDetailsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Order #{selectedHistoryOrder.id}
                  </h2>
                  <button
                    onClick={() => setIsHistoryOrderDetailsOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <FaTimes className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Order Status and Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm text-green-600 font-medium">Status</div>
                      <div className="mt-1 text-green-700">{selectedHistoryOrder.status}</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-blue-600 font-medium">Date</div>
                      <div className="mt-1 text-blue-700">
                        {formatDate(selectedHistoryOrder.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {selectedHistoryOrder.orderItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                            <p className="text-sm text-gray-500">@ {formatCurrency(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-gray-900 text-white rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Amount</span>
                      <span className="text-xl font-semibold">
                        {formatCurrency(selectedHistoryOrder.total)} VND
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TableHistory;
