'use client';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_BOOKINGS } from '@/services/bookingServices';
import { GET_ORDERS } from '@/services/orderServices';
import { GET_ALL_TABLES } from '@/services/tableServices';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  parseISO,
  isWithinInterval,
} from 'date-fns';

interface Analytics {
  totalRevenue: number;
  averageOrderValue: number;
  totalBookings: number;
  totalOrders: number;
  occupancyRate: number;
  peakHours: any[];
  popularTables: any[];
  revenueByDay: { date: string; revenue: number }[];
  bookingsByType: { type: string; count: number }[];
  orderStatusDistribution: { status: string; count: number }[];
}

const Reports = () => {
  // Date range state
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Fetch data
  const { data: bookingsData } = useQuery(GET_ALL_BOOKINGS);
  const { data: ordersData } = useQuery(GET_ORDERS);
  const { data: tablesData } = useQuery(GET_ALL_TABLES);

  // Analytics state
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRevenue: 0,
    averageOrderValue: 0,
    totalBookings: 0,
    totalOrders: 0,
    occupancyRate: 0,
    peakHours: [],
    popularTables: [],
    revenueByDay: [],
    bookingsByType: [],
    orderStatusDistribution: [],
  });

  // Add formatter function
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate date range
  useEffect(() => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        setStartDate(new Date(now.setHours(0, 0, 0, 0)));
        setEndDate(new Date(now.setHours(23, 59, 59, 999)));
        break;
      case 'week':
        setStartDate(startOfWeek(now));
        setEndDate(endOfWeek(now));
        break;
      case 'month':
        setStartDate(new Date(now.getFullYear(), now.getMonth(), 1));
        setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        break;
    }
  }, [dateRange]);

  // Process data when it changes
  useEffect(() => {
    if (bookingsData && ordersData && tablesData) {
      const filteredOrders = ordersData.allOrders.filter((order: any) => {
        const orderDate = new Date(parseInt(order.createdAt));
        return isWithinInterval(orderDate, { start: startDate, end: endDate });
      });

      const filteredBookings = bookingsData.allBooking.filter((booking: any) => {
        const bookingDate = parseISO(booking.reservationDate);
        return isWithinInterval(bookingDate, { start: startDate, end: endDate });
      });

      // Calculate analytics
      const totalRevenue = filteredOrders.reduce((sum: number, order: any) => sum + order.total, 0);
      const averageOrderValue = totalRevenue / filteredOrders.length || 0;

      // Calculate occupancy rate
      const totalTables = tablesData.allTable.length;
      const occupiedTables = tablesData.allTable.filter(
        (table: any) => table.status === 'occupied'
      ).length;
      const occupancyRate = (occupiedTables / totalTables) * 100;

      // Calculate revenue by day
      const revenueByDay = eachDayOfInterval({ start: startDate, end: endDate }).map(day => {
        const dayOrders = filteredOrders.filter((order: any) => {
          const orderDate = new Date(parseInt(order.createdAt));
          return orderDate.toDateString() === day.toDateString();
        });
        return {
          date: format(day, 'MM/dd'),
          revenue: dayOrders.reduce((sum: number, order: any) => sum + order.total, 0),
        };
      });

      // Calculate booking distribution by type
      const bookingsByType: { type: string; count: number }[] = Object.entries(
        filteredBookings.reduce((acc: Record<string, number>, booking: any) => {
          acc[booking.bookingType] = (acc[booking.bookingType] || 0) + 1;
          return acc;
        }, {})
      ).map(([type, count]) => ({
        type,
        count: count as number,
      }));

      // Calculate order status distribution
      const orderStatusDistribution: { status: string; count: number }[] = Object.entries(
        filteredOrders.reduce((acc: Record<string, number>, order: any) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {})
      ).map(([status, count]) => ({
        status,
        count: count as number,
      }));

      setAnalytics({
        totalRevenue,
        averageOrderValue,
        totalBookings: filteredBookings.length,
        totalOrders: filteredOrders.length,
        occupancyRate,
        peakHours: [], // TODO: Implement peak hours calculation
        popularTables: [], // TODO: Implement popular tables calculation
        revenueByDay,
        bookingsByType,
        orderStatusDistribution,
      });
    }
  }, [bookingsData, ordersData, tablesData, startDate, endDate]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Analytics & Reports</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setDateRange('today')}
              className={`px-4 py-2 rounded-lg ${
                dateRange === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`px-4 py-2 rounded-lg ${
                dateRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-4 py-2 rounded-lg ${
                dateRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <h3 className="text-gray-400 text-sm">Total Revenue</h3>
            <p className="text-2xl font-bold text-white">{formatVND(analytics.totalRevenue)}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <h3 className="text-gray-400 text-sm">Average Order Value</h3>
            <p className="text-2xl font-bold text-white">
              {formatVND(analytics.averageOrderValue)}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <h3 className="text-gray-400 text-sm">Total Bookings</h3>
            <p className="text-2xl font-bold text-white">{analytics.totalBookings}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <h3 className="text-gray-400 text-sm">Current Occupancy</h3>
            <p className="text-2xl font-bold text-white">{Math.round(analytics.occupancyRate)}%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-8">
          {/* Revenue Chart */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <h3 className="text-lg font-medium text-white mb-4">Revenue Trend</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="date" stroke="#ffffff60" />
                  <YAxis
                    stroke="#ffffff60"
                    tickFormatter={value => formatVND(value).replace('₫', '')}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    formatter={(value: any) => [formatVND(value), 'Revenue']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booking Types and Order Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Booking Types */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-4">Booking Types</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.bookingsByType}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {analytics.bookingsByType.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-4">Order Status Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.orderStatusDistribution}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {analytics.orderStatusDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
