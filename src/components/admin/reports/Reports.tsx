'use client';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ORDERS } from '../../../services/orderServices';
import { GET_ALL_BOOKINGS } from '../../../services/bookingServices';
import { GET_ALL_TABLES } from '../../../services/tableServices';
import { GET_REPORT } from '../../../services/reportServices';
import { GET_ALL_CLOCK_INS } from '../../../services/clockInServices';
import { GET_ALL_USERS_WITH_EMPLOYMENT, GET_ALL_EMPLOYEES } from '../../../services/reportServices';

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
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import SpinningModal from '@/components/UI/SpinningModal';
import { useReport } from '@/hooks/useReport';

interface Analytics {
  totalRevenue: number;
  totalRevenueByReport: number;
  totalOrders: number;
  totalReported: number;
  revenueByDay: { [key: string]: number };
  bookingDistribution: { [key: string]: number };
  orderStatusDistribution: { [key: string]: number };
  popularItems: { name: string; count: number }[];
  reportData: {
    moneyIn: number;
    moneyOut: number;
    totalOrder: number;
    totalSale: number;
    date: string;
  }[];
  clockInData: {
    userId: string;
    clockIn: string;
    clockOut: string | null;
    status: string;
    notes: string | null;
    moneyIn: number;
    moneyOut: number;
  }[];
  employeeData: {
    id: string;
    fullName: string;
    position: string;
    email: string;
    phone: string;
    user: {
      id: string;
      username: string;
      role: string;
    };
  }[];
  topEmployees: { name: string; count: number }[];
  hourlySalesArray: { hour: string; total: number }[];
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
    totalRevenueByReport: 0,
    totalOrders: 0,
    totalReported: 0,
    revenueByDay: {},
    bookingDistribution: {},
    orderStatusDistribution: {},
    popularItems: [],
    reportData: [],
    clockInData: [],
    employeeData: [],
    topEmployees: [],
    hourlySalesArray: [],
  });

  const { loading: clockInLoading, data: clockInData } = useQuery(GET_ALL_CLOCK_INS);
  const { loading: ordersLoading, data: ordersData } = useQuery(GET_ORDERS);
  const { loading: bookingsLoading, data: bookingsData } = useQuery(GET_ALL_BOOKINGS);
  const { loading: tablesLoading, data: tablesData } = useQuery(GET_ALL_TABLES);
  const { data: allReportData, loading: allReportLoading } = useQuery(GET_REPORT);
  const { data: userData, loading: userLoading } = useQuery(GET_ALL_USERS_WITH_EMPLOYMENT);
  const { data: employeeData, loading: employeeLoading } = useQuery(GET_ALL_EMPLOYEES);

  const isLoading =
    ordersLoading ||
    bookingsLoading ||
    tablesLoading ||
    allReportLoading ||
    clockInLoading ||
    userLoading ||
    employeeLoading;

  useEffect(() => {
    console.log('ordersData', ordersData);
    console.log('bookingsData', bookingsData);
    console.log('tablesData', tablesData);
    console.log('clockInData', clockInData);
    console.log('allReportData', allReportData);
    console.log('userData', userData);
    console.log('employeeData', employeeData);
  }, [ordersData, bookingsData, tablesData, clockInData, allReportData, userData, employeeData]);

  useEffect(() => {
    if (
      ordersData?.allOrders &&
      bookingsData?.allBooking &&
      tablesData?.allTable &&
      clockInData?.allClockIns &&
      allReportData?.allReport &&
      userData?.allUser &&
      employeeData?.allEmployee
    ) {
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

      // Get today's clock-in data
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());

      const todayClockIns = clockInData.allClockIns.filter((clockIn: any) => {
        const clockInDate = new Date(clockIn.clockIn);
        return clockInDate >= todayStart && clockInDate <= todayEnd;
      });

      // Calculate total revenue from orders
      const totalRevenue = orders.reduce((sum: number, order: any) => {
        // Only count paid orders
        if (order.status.toLowerCase() === 'paid') {
          return sum + order.total;
        }
        return sum;
      }, 0);

      // Calculate total revenue from reports
      const totalRevenueByReport = allReportData.allReport.reduce(
        (sum: number, report: any) => sum + report.totalSale,
        0
      );

      // Calculate total reported
      const totalReported = allReportData.allReport.reduce(
        (sum: number, report: any) => sum + report.totalSale,
        0
      );

      // Calculate revenue by day
      const revenueByDay: { [key: string]: number } = {};
      orders.forEach((order: any) => {
        if (order.status.toLowerCase() === 'paid') {
          const date = format(new Date(order.createdAt), 'yyyy-MM-dd');
          revenueByDay[date] = (revenueByDay[date] || 0) + order.total;
        }
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
        const status = order.status.toLowerCase();
        orderStatusDistribution[status] = (orderStatusDistribution[status] || 0) + 1;
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

      // Get report data
      const reportData = allReportData.allReport.map((report: any) => ({
        moneyIn: report.moneyIn,
        moneyOut: report.moneyOut,
        totalOrder: report.totalOrder,
        totalSale: report.totalSale,
        date: report.date,
      }));

      // Calculate top employees by number of orders handled
      const employeeOrderCounts: { [key: string]: number } = {};
      orders.forEach((order: any) => {
        const createdBy = order.createdBy;
        if (createdBy) {
          // Find the corresponding user
          const user = userData?.allUser?.find((u: any) => u.username === createdBy);
          const displayName = user ? user.username : createdBy;
          employeeOrderCounts[displayName] = (employeeOrderCounts[displayName] || 0) + 1;
        }
      });

      const topEmployees = Object.entries(employeeOrderCounts)
        .map(([username, count]) => ({
          name: username,
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate hourly sales distribution
      const hourlySales: { [key: string]: number } = {};
      orders.forEach((order: any) => {
        if (order.status.toLowerCase() === 'paid') {
          const orderDate = new Date(order.createdAt);
          const hour = orderDate.getHours();
          hourlySales[hour] = (hourlySales[hour] || 0) + order.total;
        }
      });
      const hourlySalesArray = Array.from({ length: 24 }, (_, hour) => ({
        hour: `${hour}:00`,
        total: hourlySales[hour] || 0,
      }));

      setAnalytics({
        totalRevenue,
        totalRevenueByReport,
        totalOrders: orders.length,
        totalReported,
        revenueByDay,
        bookingDistribution,
        orderStatusDistribution,
        popularItems,
        reportData,
        clockInData: todayClockIns,
        employeeData: employeeData.allEmployee.map((employee: any) => ({
          id: employee.id,
          fullName: employee.fullName,
          position: employee.position,
          email: employee.email,
          phone: employee.phone,
          user: employee.user,
        })),
        topEmployees,
        hourlySalesArray,
      });
    }
  }, [
    ordersData,
    bookingsData,
    tablesData,
    allReportData,
    clockInData,
    userData,
    employeeData,
    startDate,
    endDate,
  ]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace(/\s/g, '.');
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
        <h2 className="text-xl sm:text-2xl font-bold">Reports Dashboard</h2>
        <p className="text-indigo-100 text-sm sm:text-base">Current Status Overview</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tables</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {tablesData?.allTable?.length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Available Tables</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {tablesData?.allTable?.filter((t: any) => t.status === 'available').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Occupied Tables</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {tablesData?.allTable?.filter((t: any) => t.status === 'occupied').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {ordersData?.allOrders?.filter((o: any) => o.status === 'PENDING').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ordersData?.allOrders?.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {order.orderItems.map((item: any) => (
                        <div key={item.id} className="text-sm">
                          <span className="font-medium">{item.quantity}x</span> {item.dish.name}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatAmount(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium
                      ${order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium
                      ${
                        order.payment === 'paid' || order.payment === 'Tiền Mặt'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.payment === 'Tiền Mặt' ? 'Paid (Cash)' : order.payment || 'Unpaid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tables Status */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tables Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tablesData?.allTable?.map((table: any) => (
            <div
              key={table.id}
              className={`p-4 rounded-lg border ${
                table.status === 'occupied'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <div className="text-sm font-medium">{table.number}</div>
              <div className="text-xs text-gray-500">Room: {table.room}</div>
              <div className="text-xs text-gray-500">Capacity: {table.capacity}</div>
              <div
                className={`mt-2 text-xs font-medium ${
                  table.status === 'occupied' ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Bookings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Bookings</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  People
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookingsData?.allBooking?.map((booking: any) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{booking.table.number}</div>
                    <div className="text-xs text-gray-500">{booking.table.room}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{booking.customerName}</div>
                    <div className="text-xs text-gray-500">{booking.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {booking.startSlot.startTime} - {booking.startSlot.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.peopleCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800">
                      {booking.bookingType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
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

      {/* End of Day Report */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">End of Day Report</h3>
          <div className="flex space-x-2">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
              onClick={() => {
                // This would typically trigger a report generation
                console.log('Generating report for', startDate);
              }}
            >
              Generate Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Financial Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-700 mb-3">Financial Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Revenue:</span>
                <span className="text-sm font-medium">{formatAmount(analytics.totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Orders:</span>
                <span className="text-sm font-medium">{analytics.totalOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Order Value:</span>
                <span className="text-sm font-medium">
                  {analytics.totalOrders > 0
                    ? formatAmount(analytics.totalRevenue / analytics.totalOrders)
                    : formatAmount(0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cash Payments:</span>
                <span className="text-sm font-medium">
                  {formatAmount(
                    ordersData?.allOrders
                      ?.filter((o: any) => o.payment === 'Tiền Mặt')
                      ?.reduce((sum: number, o: any) => sum + o.total, 0) || 0
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-700 mb-3">Order Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Paid Orders:</span>
                <span className="text-sm font-medium">
                  {ordersData?.allOrders?.filter((o: any) => o.status === 'paid').length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending Orders:</span>
                <span className="text-sm font-medium">
                  {ordersData?.allOrders?.filter((o: any) => o.status === 'PENDING').length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Bookings:</span>
                <span className="text-sm font-medium">{bookingsData?.allBooking?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Confirmed Bookings:</span>
                <span className="text-sm font-medium">
                  {bookingsData?.allBooking?.filter((b: any) => b.status === 'Confirmed').length ||
                    0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Items */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">Top Selling Items</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity Sold
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.popularItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hourly Sales Chart */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">Hourly Sales Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.hourlySalesArray}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip formatter={value => formatAmount(Number(value))} />
                <Bar dataKey="total" fill="#8884d8" name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employee Performance */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">Employee Performance</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Orders Handled
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.topEmployees.map((employee, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <SpinningModal isOpen={isLoading} />}
    </div>
  );
};

export default Reports;
