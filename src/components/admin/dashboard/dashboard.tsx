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

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalBookings: number;
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
    totalOrders: 0,
    totalBookings: 0,
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
      clockInsData?.allClockIns &&
      userData?.allUser
    ) {
      const orders = ordersData.allOrders;
      const bookings = bookingsData.allBooking;
      const tables = tablesData.allTable;
      const clockIns = clockInsData.allClockIns as ClockIn[];
      const users = userData.allUser;

      // Define today range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Filter to today's data
      const todayOrders = orders.filter((order: any) => {
        const orderDate = new Date(Number(order.createdAt));
        return orderDate >= today && orderDate < tomorrow;
      });
      const todayBookings = bookings.filter((booking: any) => {
        const bookingDate = new Date(Number(booking.reservationDate));
        return bookingDate >= today && bookingDate < tomorrow;
      });
      const todayClockIns = clockIns.filter(clockIn => {
        const clockInDate = new Date(clockIn.clockIn);
        return clockInDate >= today && clockInDate < tomorrow;
      });

      // Calculate total revenue (today)
      const totalRevenue = todayOrders.reduce((sum: number, order: any) => sum + order.total, 0);

      // Calculate revenue by day (today only, so just one entry)
      const revenueByDay: { [key: string]: number } = {};
      todayOrders.forEach((order: any) => {
        const date = format(new Date(Number(order.createdAt)), 'yyyy-MM-dd');
        revenueByDay[date] = (revenueByDay[date] || 0) + order.total;
      });

      // Calculate order status distribution (today)
      const orderStatusDistribution: { [key: string]: number } = {};
      todayOrders.forEach((order: any) => {
        orderStatusDistribution[order.status] = (orderStatusDistribution[order.status] || 0) + 1;
      });

      // Calculate booking distribution (today)
      const bookingDistribution: { [key: string]: number } = {};
      todayBookings.forEach((booking: any) => {
        const type = booking.bookingType || 'walk-in';
        bookingDistribution[type] = (bookingDistribution[type] || 0) + 1;
      });

      // Calculate clock-ins by hour (today)
      const clockInsByHour: { [key: string]: number } = {};
      const activeClockIns = todayClockIns.filter(clockIn => clockIn.status === 'active').length;
      todayClockIns.forEach(clockIn => {
        try {
          const clockInDate = new Date(clockIn.clockIn);
          if (!isNaN(clockInDate.getTime())) {
            const hour = format(clockInDate, 'HH:00');
            clockInsByHour[hour] = (clockInsByHour[hour] || 0) + 1;
          }
        } catch (error) {
          console.error('Error parsing clockIn:', clockIn.clockIn);
        }
      });
      // Sort clockInsByHour by hour
      const sortedClockInsByHour: { [key: string]: number } = {};
      Object.keys(clockInsByHour)
        .sort()
        .forEach(hour => {
          sortedClockInsByHour[hour] = clockInsByHour[hour];
        });

      // Tables with orders (today): status occupied
      const tablesWithOrders = tables.filter((table: any) => table.status === 'occupied');

      // Tables with bookings (today): show all today's bookings for each table
      const tablesWithBookings = tables
        .map((table: any) => {
          const todaysBookings =
            table.bookings?.filter((b: any) => todayBookings.some((tb: any) => tb.id === b.id)) ||
            [];
          return { ...table, todaysBookings };
        })
        .filter((table: any) => table.todaysBookings.length > 0);

      // Users clocked in today
      const usersClockedInToday = users.filter((user: any) =>
        todayClockIns.some(ci => ci.userId === user.id)
      );

      setMetrics({
        totalRevenue,
        totalOrders: todayOrders.length,
        totalBookings: todayBookings.length,
        activeClockIns,
        revenueByDay,
        orderStatusDistribution,
        bookingDistribution,
        clockInsByHour: sortedClockInsByHour,
        tablesWithOrders,
        tablesWithBookings,
        usersClockedInToday,
      });
    }
  }, [ordersData, bookingsData, tablesData, clockInsData, userData]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="bg-gray-50 min-h-screen px-1 sm:px-2 md:px-4 space-y-4">
      <SpinningModal isOpen={isLoading} message="Loading dashboard data..." />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4">
        <div className="bg-white p-3 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">
                {formatAmount(metrics.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                {metrics.totalOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-1">
                {metrics.totalBookings}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Active Clock-ins</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600 mt-1">
                {metrics.activeClockIns}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tables with Orders */}
      <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 mb-2 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold mb-2 text-blue-700">
          Tables with Orders (Occupied)
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">Table #</th>
                <th className="px-2 py-1 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.tablesWithOrders?.map((table: any) => (
                <tr key={table.id}>
                  <td className="px-2 py-1">{table.number}</td>
                  <td className="px-2 py-1">{table.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tables with Bookings */}
      <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 mb-2 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold mb-2 text-green-700">
          Tables with Bookings (Today)
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">Table #</th>
                <th className="px-2 py-1 text-left">Status</th>
                <th className="px-2 py-1 text-left">Booking Details (Today)</th>
              </tr>
            </thead>
            <tbody>
              {metrics.tablesWithBookings?.map((table: any) => (
                <tr key={table.id}>
                  <td className="px-2 py-1 align-top">{table.number}</td>
                  <td className="px-2 py-1 align-top">{table.status}</td>
                  <td className="px-2 py-1">
                    <ul className="list-disc ml-4">
                      {table.todaysBookings.map((booking: any) => (
                        <li key={booking.id}>
                          {booking.customerName} ({booking.peopleCount} people) -{' '}
                          {booking.bookingType} -{' '}
                          {format(new Date(Number(booking.reservationDate)), 'HH:mm dd/MM/yyyy')}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Clocked In Today */}
      <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 mb-2 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold mb-2 text-purple-700">
          Users Clocked In Today
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">Username</th>
                <th className="px-2 py-1 text-left">Clock In Time</th>
                <th className="px-2 py-1 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.usersClockedInToday?.map((user: any) => {
                // Find the most recent clock-in for today for this user
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                const userClockInsToday = clockInsData.allClockIns
                  .filter((c: any) => c.userId === user.id)
                  .filter((c: any) => {
                    const clockInDate = new Date(c.clockIn);
                    return clockInDate >= today && clockInDate < tomorrow;
                  })
                  .sort(
                    (a: any, b: any) =>
                      new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()
                  );
                const ci = userClockInsToday[0]; // Most recent clock-in today
                if (!ci) return null;
                return (
                  <tr key={user.id}>
                    <td className="px-2 py-1">{user.username}</td>
                    <td className="px-2 py-1">
                      {ci ? format(new Date(ci.clockIn), 'HH:mm dd/MM/yyyy') : '-'}
                    </td>
                    <td className="px-2 py-1">{ci ? ci.status : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div className="bg-white p-2 sm:p-6 rounded-xl shadow-sm">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-4">
            Revenue Trend
          </h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={Object.entries(metrics.revenueByDay).map(([date, revenue]) => ({
                  date,
                  revenue,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatAmount(value)} />
                <Line type="monotone" dataKey="revenue" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-2 sm:p-6 rounded-xl shadow-sm">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-4">
            Clock-ins by Hour
          </h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(metrics.clockInsByHour).map(([hour, count]) => ({
                  hour,
                  count,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-2 sm:p-6 rounded-xl shadow-sm">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-4">
            Order Status Distribution
          </h3>
          <div className="h-64 sm:h-80">
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
                  label
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

        <div className="bg-white p-2 sm:p-6 rounded-xl shadow-sm">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-4">
            Booking Distribution
          </h3>
          <div className="h-64 sm:h-80 flex items-center justify-center">
            {Object.keys(metrics.bookingDistribution).length === 0 ? (
              <span className="text-gray-400">No bookings today</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(metrics.bookingDistribution).map(([type, count]) => ({
                      name: type,
                      value: count,
                    }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {Object.entries(metrics.bookingDistribution).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
