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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { format } from 'date-fns';

interface ClockIn {
  id: string;
  userId: string;
  notes: string;
  status: 'active' | 'inactive';
  clockIn: string;
  clockOut: string | null;
}

interface Booking {
  id: number;
  bookingType: string;
  customerName: string;
  phoneNumber: string;
  status: string;
}

interface DashboardMetrics {
  totalRevenue: number;
  totalDineIn: number;
  totalOnlineBookings: number;
  activeClockIns: number;
  revenueByDay: { [key: string]: number };
  orderStatusDistribution: { [key: string]: number };
  bookingDistribution: { [key: string]: number };
  clockInsByHour: { [key: string]: number };
  tablesWithOrders?: any[];
  tablesWithBookings?: any[];
  usersClockedInToday?: any[];
}

const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    totalDineIn: 0,
    totalOnlineBookings: 0,
    activeClockIns: 0,
    revenueByDay: {},
    orderStatusDistribution: {},
    bookingDistribution: {},
    clockInsByHour: {},
    tablesWithOrders: [],
    tablesWithBookings: [],
    usersClockedInToday: [],
  });

  const { loading: ordersLoading, data: ordersData } = useQuery(GET_ORDERS);
  const { loading: bookingsLoading, data: bookingsData } = useQuery(GET_ALL_BOOKINGS);
  const { loading: tablesLoading, data: tablesData } = useQuery(GET_ALL_TABLES);
  const { loading: clockInsLoading, data: clockInsData } = useQuery(GET_ALL_CLOCK_INS);
  const { data: userData, loading: userLoading } = useQuery(GET_ALL_USERS_WITH_EMPLOYMENT);

  const isLoading =
    ordersLoading || bookingsLoading || tablesLoading || clockInsLoading || userLoading;

  useEffect(() => {
    if (
      ordersData?.allOrders &&
      bookingsData?.allBooking &&
      tablesData?.allTable &&
      userData?.allUser
    ) {
      const orders = ordersData.allOrders;
      const bookings = bookingsData.allBooking;
      const tables = tablesData.allTable;

      // Calculate total revenue from all orders
      const totalRevenue = orders.reduce((sum: number, order: any) => {
        return sum + (order.total || 0);
      }, 0);

      // Calculate total dine-in orders and online bookings
      const totalDineIn = bookings.filter(
        (booking: Booking) => booking.bookingType === 'dine-in'
      ).length;
      const totalOnlineBookings = bookings.filter(
        (booking: Booking) => booking.bookingType === 'online'
      ).length;
      // Calculate order status distribution
      const orderStatusDistribution: { [key: string]: number } = {};
      orders.forEach((order: any) => {
        const status = order.status || 'unknown';
        orderStatusDistribution[status] = (orderStatusDistribution[status] || 0) + 1;
      });

      // Get tables with orders (occupied tables)
      const tablesWithOrders = tables.filter((table: any) => table.status === 'occupied');

      // Get tables with bookings
      const tablesWithBookings = tables
        .map((table: any) => ({
          ...table,
          todaysBookings: bookings.filter((b: any) => b.id === table.bookingId) || [],
        }))
        .filter((table: any) => table.todaysBookings.length > 0);

      setMetrics({
        totalRevenue,
        totalDineIn,
        totalOnlineBookings,
        activeClockIns: 0,
        revenueByDay: {},
        orderStatusDistribution,
        bookingDistribution: {},
        clockInsByHour: {},
        tablesWithOrders,
        tablesWithBookings,
        usersClockedInToday: [],
      });
    }
  }, [ordersData, bookingsData, tablesData, userData]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="bg-gray-50 min-h-screen p-4 space-y-6">
      <SpinningModal isOpen={isLoading} message="Loading dashboard data..." />

      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
        <p className="text-gray-500">Real-time business metrics and operations</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">{formatAmount(metrics.totalRevenue)}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Dine-in Orders</p>
              <p className="text-3xl font-bold mt-1">{metrics.totalDineIn}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 p-3 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Online Bookings</p>
              <p className="text-3xl font-bold mt-1">{metrics.totalOnlineBookings}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Working Today Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Staff Working Today</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {clockInsData?.allClockIns
              ?.filter((clockIn: ClockIn) => clockIn.status === 'active' && !clockIn.clockOut)
              .map((clockIn: ClockIn) => {
                const user = userData?.allUser?.find((u: any) => u.id === clockIn.userId);
                return (
                  <div
                    key={clockIn.id}
                    className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="bg-blue-100 rounded-full p-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user?.name || 'Staff Member'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Since {format(new Date(clockIn.clockIn), 'HH:mm')}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Orders and Payment Status Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Orders & Payments</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          {ordersData?.allOrders?.map((order: any) => (
            <div key={order.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-medium text-gray-900">Order #{order.id}</div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.payment === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {order.payment || 'unpaid'}
                </span>
              </div>
              <div className="space-y-2">
                {order.orderItems?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{item.quantity}x</span>
                      <span>{item.dish?.name || 'Unknown Dish'}</span>
                    </div>
                    <span>{formatAmount(item.price)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-200 mt-2">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total</span>
                    <span>{formatAmount(order.total)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Status: {order.status}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bookings Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Current Bookings</h2>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">
              {bookingsData?.allBooking?.length || 0} Bookings
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {bookingsData?.allBooking?.map((booking: any) => (
            <div
              key={booking.id}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-full p-2">
                    <svg
                      className="w-4 h-4 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Guest</div>
                    <div className="text-sm text-gray-500">
                      {booking.phoneNumber || '0000000000'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <svg
                    className="w-4 h-4 text-gray-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  {booking.table
                    ? `Table ${booking.table.number} (${booking.table.room})`
                    : 'No table assigned'}
                </div>
                <div className="flex items-center text-sm">
                  <svg
                    className="w-4 h-4 text-gray-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {booking.peopleCount} people
                </div>
                {booking.startSlot && (
                  <div className="flex items-center text-sm">
                    <svg
                      className="w-4 h-4 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {booking.startSlot.startTime} - {booking.startSlot.endTime}
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <svg
                    className="w-4 h-4 text-gray-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                  {booking.customerNote || 'No notes'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(metrics.orderStatusDistribution).map(([status, count]) => ({
                    name: status,
                    value: count,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {Object.entries(metrics.orderStatusDistribution).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Table Status Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    {
                      name: 'Occupied',
                      value:
                        tablesData?.allTable?.filter((t: any) => t.status === 'occupied').length ||
                        0,
                    },
                    {
                      name: 'Available',
                      value:
                        tablesData?.allTable?.filter((t: any) => t.status === 'available').length ||
                        0,
                    },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  <Cell fill="#EF4444" />
                  <Cell fill="#10B981" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
