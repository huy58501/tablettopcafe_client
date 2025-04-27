'use client';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ORDERS } from '../../../services/orderServices';
import { GET_ALL_BOOKINGS } from '../../../services/bookingServices';
import { GET_ALL_TABLES } from '../../../services/tableServices';
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
} from 'recharts';
import { format, parseISO } from 'date-fns';
import SpinningModal from '@/components/UI/SpinningModal';

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalBookings: number;
  averagePeoplePerBooking: number;
  revenueByDay: { [key: string]: number };
  bookingDistribution: { [key: string]: number };
  orderStatusDistribution: { [key: string]: number };
  popularItems: { name: string; count: number }[];
}

const Reports = () => {
  // Set initial date range to next 7 days (as shown in the image)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const [startDate, setStartDate] = useState<string>(format(today, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(nextWeek, 'yyyy-MM-dd'));
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRevenue: 0,
    totalOrders: 0,
    totalBookings: 0,
    averagePeoplePerBooking: 0,
    revenueByDay: {},
    bookingDistribution: {},
    orderStatusDistribution: {},
    popularItems: [],
  });

  const { loading: ordersLoading, data: ordersData } = useQuery(GET_ORDERS);
  const { loading: bookingsLoading, data: bookingsData } = useQuery(GET_ALL_BOOKINGS);
  const { loading: tablesLoading, data: tablesData } = useQuery(GET_ALL_TABLES);

  const isLoading = ordersLoading || bookingsLoading || tablesLoading;

  useEffect(() => {
    if (ordersData?.allOrders && bookingsData?.allBooking && tablesData?.allTable) {
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999); // Include the entire end date

      const orders = ordersData.allOrders.filter((order: any) => {
        const orderDate = new Date(Number(order.createdAt));
        return orderDate >= startDateTime && orderDate <= endDateTime;
      });

      const bookings = bookingsData.allBooking.filter((booking: any) => {
        const bookingDate = new Date(Number(booking.reservationDate));
        return bookingDate >= startDateTime && bookingDate <= endDateTime;
      });

      // Calculate total revenue
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);

      // Calculate revenue by day
      const revenueByDay: { [key: string]: number } = {};
      orders.forEach((order: any) => {
        const date = format(new Date(Number(order.createdAt)), 'yyyy-MM-dd');
        revenueByDay[date] = (revenueByDay[date] || 0) + order.total;
      });

      // Calculate booking distribution
      const bookingDistribution: { [key: string]: number } = {};
      bookings.forEach((booking: any) => {
        const type = booking.bookingType || 'walk-in';
        bookingDistribution[type] = (bookingDistribution[type] || 0) + 1;
      });

      // Calculate order status distribution
      const orderStatusDistribution: { [key: string]: number } = {};
      orders.forEach((order: any) => {
        orderStatusDistribution[order.status] = (orderStatusDistribution[order.status] || 0) + 1;
      });

      // Calculate popular items
      const itemCounts: { [key: string]: number } = {};
      orders.forEach((order: any) => {
        order.orderItems?.forEach((item: any) => {
          const itemName = item.dish.name;
          itemCounts[itemName] = (itemCounts[itemName] || 0) + item.quantity;
        });
      });

      const popularItems = Object.entries(itemCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate average people per booking
      const totalPeople = bookings.reduce(
        (sum: number, booking: any) => sum + (booking.peopleCount || 0),
        0
      );
      const averagePeoplePerBooking = bookings.length > 0 ? totalPeople / bookings.length : 0;

      setAnalytics({
        totalRevenue,
        totalOrders: orders.length,
        totalBookings: bookings.length,
        averagePeoplePerBooking,
        revenueByDay,
        bookingDistribution,
        orderStatusDistribution,
        popularItems,
      });
    }
  }, [ordersData, bookingsData, tablesData, startDate, endDate]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-4 bg-gray-50 min-h-screen pt-[70px]">
      <div className="mb-6 flex space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-blue-600">{formatAmount(analytics.totalRevenue)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Orders</h3>
          <p className="text-2xl font-bold text-green-600">{analytics.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Bookings</h3>
          <p className="text-2xl font-bold text-purple-600">{analytics.totalBookings}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Avg. People/Booking</h3>
          <p className="text-2xl font-bold text-orange-600">
            {analytics.averagePeoplePerBooking.toFixed(1)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Day</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(analytics.revenueByDay).map(([date, revenue]) => ({
                  date,
                  revenue,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatAmount(value)} />
                <Bar dataKey="revenue" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(analytics.bookingDistribution).map(([type, count]) => ({
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
                  {Object.entries(analytics.bookingDistribution).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(analytics.orderStatusDistribution).map(
                    ([status, count]) => ({ name: status, value: count })
                  )}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {Object.entries(analytics.orderStatusDistribution).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Items</h3>
          <div className="space-y-4">
            {analytics.popularItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-semibold">{item.count} orders</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SpinningModal isOpen={isLoading} message="Loading reports data..." />
    </div>
  );
};

export default Reports;
