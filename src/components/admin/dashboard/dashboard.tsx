'use client';
import { useEffect, useState } from 'react';
import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ORDERS } from '../../../services/orderServices';
import { GET_ALL_BOOKINGS } from '../../../services/bookingServices';
import { GET_ALL_TABLES } from '../../../services/tableServices';
import { GET_ALL_CLOCK_INS } from '../../../services/clockInServices';
import { GET_ALL_USERS_WITH_EMPLOYMENT } from '../../../services/reportServices';
import SpinningModal from '@/components/UI/SpinningModal';
import { format, differenceInHours, differenceInMinutes, startOfToday } from 'date-fns';
import { FaUsers, FaChair, FaMoneyBillWave, FaUtensils } from 'react-icons/fa';

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatTime = (dateString: string | null) => {
  if (!dateString) return 'Still working';
  return format(new Date(dateString), 'HH:mm');
};

const formatDate = (timestamp: string) => {
  return format(new Date(Number(timestamp)), 'dd/MM/yyyy');
};

const calculateHoursWorked = (clockIn: string, clockOut: string | null) => {
  const start = new Date(clockIn);
  const end = clockOut ? new Date(clockOut) : new Date();

  const totalMinutes = differenceInMinutes(end, start);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
};

const calculateTableTotal = (bookings: any[]) => {
  if (!bookings || bookings.length === 0) return 0;
  // Get the latest booking
  const latestBooking = bookings[bookings.length - 1];
  return latestBooking.order ? latestBooking.order.total : 0;
};

const getPaymentStatus = (bookings: any[]) => {
  if (!bookings || bookings.length === 0) return 'paid';
  // Get the latest booking
  const latestBooking = bookings[bookings.length - 1];
  return latestBooking.order && latestBooking.order.status !== 'paid' ? 'unpaid' : 'paid';
};

interface PopularItem {
  id: number;
  name: string;
  quantity: number;
  revenue: number;
}

const Dashboard = () => {
  const { loading: ordersLoading, data: ordersData } = useQuery(GET_ORDERS);
  const { loading: bookingsLoading, data: bookingsData } = useQuery(GET_ALL_BOOKINGS);
  const { loading: tablesLoading, data: tablesData } = useQuery(GET_ALL_TABLES);
  const { loading: clockInsLoading, data: clockInsData } = useQuery(GET_ALL_CLOCK_INS);
  const { data: userData, loading: userLoading } = useQuery(GET_ALL_USERS_WITH_EMPLOYMENT);

  const isLoading =
    ordersLoading || bookingsLoading || tablesLoading || clockInsLoading || userLoading;

  const [paymentTotals, setPaymentTotals] = useState({
    today: 0,
    week: 0,
    month: 0,
  });

  const [todayClockIns, setTodayClockIns] = useState<any[]>([]);
  const [onlineBookings, setOnlineBookings] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalCustomers: 0,
    occupiedTables: 0,
    availableTables: 0,
    popularItems: [] as PopularItem[],
  });

  useEffect(() => {
    if (ordersData?.allOrders) {
      const today = startOfToday();

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const totals = ordersData.allOrders.reduce(
        (acc: any, order: any) => {
          const orderDate = new Date(order.createdAt);

          if (orderDate >= today) {
            acc.today += order.total;
          }
          if (orderDate >= weekAgo) {
            acc.week += order.total;
          }
          if (orderDate >= monthAgo) {
            acc.month += order.total;
          }

          return acc;
        },
        { today: 0, week: 0, month: 0 }
      );

      setPaymentTotals(totals);

      // Calculate popular items
      const itemMap = new Map<number, PopularItem>();
      ordersData.allOrders.forEach((order: any) => {
        order.orderItems.forEach((item: any) => {
          if (!itemMap.has(item.dish.id)) {
            itemMap.set(item.dish.id, {
              id: item.dish.id,
              name: item.dish.name,
              quantity: 0,
              revenue: 0,
            });
          }
          const currentItem = itemMap.get(item.dish.id)!;
          currentItem.quantity += item.quantity;
          currentItem.revenue += item.price * item.quantity;
        });
      });

      const popularItems = Array.from(itemMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      setDashboardStats(prev => ({
        ...prev,
        popularItems,
      }));
    }
  }, [ordersData]);

  useEffect(() => {
    if (tablesData?.allTable) {
      const occupiedTables = tablesData.allTable.filter(
        (table: any) => table.status === 'occupied'
      ).length;
      const totalCustomers = tablesData.allTable.reduce((acc: number, table: any) => {
        return acc + (table.bookings?.length || 0);
      }, 0);

      setDashboardStats(prev => ({
        ...prev,
        totalCustomers,
        occupiedTables,
        availableTables: tablesData.allTable.length - occupiedTables,
      }));
    }
  }, [tablesData]);

  useEffect(() => {
    if (clockInsData?.allClockIns) {
      const today = startOfToday();

      const todayClockIns = clockInsData.allClockIns.filter((clockIn: any) => {
        const clockInDate = new Date(clockIn.clockIn);
        return clockInDate >= today;
      });

      setTodayClockIns(todayClockIns);
    }
  }, [clockInsData]);

  useEffect(() => {
    if (bookingsData?.allBooking) {
      const onlineBookings = bookingsData.allBooking.filter(
        (booking: any) => booking.bookingType === 'online'
      );
      setOnlineBookings(onlineBookings);
    }
  }, [bookingsData]);

  if (isLoading) {
    return <SpinningModal isOpen={true} message="Loading dashboard data..." />;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-xl font-bold text-gray-800">{dashboardStats.totalCustomers}</p>
            </div>
            <FaUsers className="text-blue-500 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Occupied Tables</p>
              <p className="text-xl font-bold text-gray-800">{dashboardStats.occupiedTables}</p>
            </div>
            <FaChair className="text-red-500 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Available Tables</p>
              <p className="text-xl font-bold text-gray-800">{dashboardStats.availableTables}</p>
            </div>
            <FaChair className="text-green-500 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Revenue</p>
              <p className="text-xl font-bold text-gray-800">{formatVND(paymentTotals.today)}</p>
            </div>
            <FaMoneyBillWave className="text-green-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Today</h3>
          <p className="text-2xl font-bold text-green-600">{formatVND(paymentTotals.today)}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">This Week</h3>
          <p className="text-2xl font-bold text-blue-600">{formatVND(paymentTotals.week)}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">This Month</h3>
          <p className="text-2xl font-bold text-purple-600">{formatVND(paymentTotals.month)}</p>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Tables Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
          {tablesData?.allTable
            .slice()
            .sort((a: any, b: any) => a.id - b.id)
            .map((table: any) => {
              const latestBooking =
                table.bookings && table.bookings.length > 0
                  ? table.bookings[table.bookings.length - 1]
                  : null;
              const total = calculateTableTotal(table.bookings);
              const paymentStatus = getPaymentStatus(table.bookings);
              const bgColor =
                table.status === 'available'
                  ? 'bg-green-50'
                  : table.status === 'occupied'
                    ? 'bg-red-50'
                    : 'bg-yellow-50';
              const textColor =
                table.status === 'available'
                  ? 'text-green-600'
                  : table.status === 'occupied'
                    ? 'text-red-600'
                    : 'text-yellow-600';

              return (
                <div key={table.id} className={`${bgColor} p-4 rounded-lg shadow-sm`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">{table.number}</h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${textColor} bg-opacity-20`}
                    >
                      {table.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">Room: {table.room}</div>
                  {table.status === 'occupied' && latestBooking && total > 0 && (
                    <>
                      <div className="mt-2 font-medium text-gray-800">
                        Total: {formatVND(total)}
                      </div>
                      <div
                        className={`text-sm ${paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Staff Activity */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Today's Clock-ins</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Clock In
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Clock Out
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hours
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {todayClockIns.map((clockIn: any) => (
                <tr key={clockIn.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{clockIn.user.username}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatTime(clockIn.clockIn)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatTime(clockIn.clockOut)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {calculateHoursWorked(clockIn.clockIn, clockIn.clockOut)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Online Bookings */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Online Bookings</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Table
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Guests
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {onlineBookings.map((booking: any) => (
                <tr key={booking.id}>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(booking.reservationDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{booking.startSlot.startTime}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {booking.table.number} ({booking.table.room})
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{booking.peopleCount}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'Confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popular Items */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Popular Items</h3>
          <FaUtensils className="text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Item
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dashboardStats.popularItems.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {formatVND(item.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
