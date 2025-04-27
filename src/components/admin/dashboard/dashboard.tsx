'use client';
import { useEffect, useState } from 'react';
import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ORDERS } from '../../../services/orderServices';
import { GET_ALL_BOOKINGS } from '../../../services/bookingServices';
import { GET_ALL_TABLES } from '../../../services/tableServices';
import { GET_ALL_CLOCK_INS } from '../../../services/clockInServices';
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
  });

  const { loading: ordersLoading, data: ordersData } = useQuery(GET_ORDERS);
  const { loading: bookingsLoading, data: bookingsData } = useQuery(GET_ALL_BOOKINGS);
  const { loading: tablesLoading, data: tablesData } = useQuery(GET_ALL_TABLES);
  const { loading: clockInsLoading, data: clockInsData } = useQuery(GET_ALL_CLOCK_INS);

  const isLoading = ordersLoading || bookingsLoading || tablesLoading || clockInsLoading;

  useEffect(() => {
    if (
      ordersData?.allOrders &&
      bookingsData?.allBooking &&
      tablesData?.allTable &&
      clockInsData?.allClockIns
    ) {
      const orders = ordersData.allOrders;
      const bookings = bookingsData.allBooking;
      const tables = tablesData.allTable;
      const clockIns = clockInsData.allClockIns as ClockIn[];

      // Calculate total revenue
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);

      // Calculate revenue by day
      const revenueByDay: { [key: string]: number } = {};
      orders.forEach((order: any) => {
        const date = format(new Date(Number(order.createdAt)), 'yyyy-MM-dd');
        revenueByDay[date] = (revenueByDay[date] || 0) + order.total;
      });

      // Calculate order status distribution
      const orderStatusDistribution: { [key: string]: number } = {};
      orders.forEach((order: any) => {
        orderStatusDistribution[order.status] = (orderStatusDistribution[order.status] || 0) + 1;
      });

      // Calculate booking distribution
      const bookingDistribution: { [key: string]: number } = {};
      bookings.forEach((booking: any) => {
        const type = booking.bookingType || 'walk-in';
        bookingDistribution[type] = (bookingDistribution[type] || 0) + 1;
      });

      // Calculate clock-ins by hour
      const clockInsByHour: { [key: string]: number } = {};
      const activeClockIns = clockIns.filter(clockIn => clockIn.status === 'active').length;

      clockIns.forEach(clockIn => {
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

      setMetrics({
        totalRevenue,
        totalOrders: orders.length,
        totalBookings: bookings.length,
        activeClockIns,
        revenueByDay,
        orderStatusDistribution,
        bookingDistribution,
        clockInsByHour: sortedClockInsByHour,
      });
    }
  }, [ordersData, bookingsData, tablesData, clockInsData]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="bg-gray-50 min-h-screen px-2 sm:px-4">
      <SpinningModal isOpen={isLoading} message="Loading dashboard data..." />

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {formatAmount(metrics.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{metrics.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{metrics.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Clock-ins</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{metrics.activeClockIns}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-80">
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

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Clock-ins by Hour</h3>
          <div className="h-80">
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

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status Distribution</h3>
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
                  outerRadius={100}
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

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Distribution</h3>
          <div className="h-80">
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
                  outerRadius={100}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
