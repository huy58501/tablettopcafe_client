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
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);

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

      // Get report data
      const reportData = allReportData.allReport.map((report: any) => ({
        moneyIn: report.moneyIn,
        moneyOut: report.moneyOut,
        totalOrder: report.totalOrder,
        totalSale: report.totalSale,
        date: report.date,
      }));

      // Get employee data
      const employeeDataArray = employeeData.allEmployee.map((employee: any) => ({
        id: employee.id,
        fullName: employee.fullName,
        position: employee.position,
        email: employee.email,
        phone: employee.phone,
        user: employee.user,
      }));

      // Calculate top employees by number of orders handled
      const employeeOrderCounts: { [key: string]: number } = {};
      orders.forEach((order: any) => {
        // Assume order has a createdBy or userId field for the employee/user who handled it
        const handlerId = order.createdBy || order.userId || order.employeeId;
        if (handlerId) {
          employeeOrderCounts[handlerId] = (employeeOrderCounts[handlerId] || 0) + 1;
        }
      });
      const topEmployees = Object.entries(employeeOrderCounts)
        .map(([id, count]) => {
          const employee = employeeData.allEmployee.find(
            (emp: any) => emp.user?.id === id || emp.id === id
          );
          return {
            name: employee?.fullName || employee?.user?.username || id,
            count,
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate hourly sales distribution
      const hourlySales: { [key: string]: number } = {};
      orders.forEach((order: any) => {
        const orderDate = new Date(Number(order.createdAt));
        const hour = orderDate.getHours();
        hourlySales[hour] = (hourlySales[hour] || 0) + order.total;
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
        employeeData: employeeDataArray,
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
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Reports Dashboard</h2>
            <p className="text-indigo-100 text-sm sm:text-base">Track your business performance</p>
          </div>
          <div className="flex flex-row gap-2 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm text-indigo-100">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="bg-white/20 border border-white/30 rounded-md px-2 py-1 sm:px-3 sm:py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50 text-xs sm:text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm text-indigo-100">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="bg-white/20 border border-white/30 rounded-md px-2 py-1 sm:px-3 sm:py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50 text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 sm:gap-4 mb-2 sm:mb-4">
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 transform hover:scale-105 transition-transform duration-200 border-l-4 border-indigo-500 flex flex-col justify-between min-h-[90px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatAmount(analytics.totalRevenue)}
              </p>
            </div>
            <div className="bg-indigo-100 p-2 sm:p-3 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 transform hover:scale-105 transition-transform duration-200 border-l-4 border-blue-500 flex flex-col justify-between min-h-[90px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Reported</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatAmount(analytics.totalReported)}
              </p>
            </div>
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 transform hover:scale-105 transition-transform duration-200 border-l-4 border-green-500 flex flex-col justify-between min-h-[90px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.totalOrders}</p>
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 transform hover:scale-105 transition-transform duration-200 border-l-4 border-purple-500 flex flex-col justify-between min-h-[90px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Tables</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {tablesData?.allTable.filter((table: any) => table.status === 'occupied').length ||
                  0}
              </p>
            </div>
            <div className="bg-purple-100 p-2 sm:p-3 rounded-full flex items-center justify-center">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Report Data Section */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Report Summary</h3>
          <div className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm font-medium">
            Financial Overview
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Money In
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Money Out
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total Orders
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total Sales
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.reportData.map((report, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(report.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatAmount(report.moneyIn)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatAmount(report.moneyOut)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.totalOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatAmount(report.totalSale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clock-in Section */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Staff Clock-in</h3>
          <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
            Today's Attendance
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Clock In
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Clock Out
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Money In
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Money Out
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.clockInData.map((clockIn, index) => {
                // Try to find the employee by userId
                const employee = analytics.employeeData.find(
                  emp => emp.user?.id === clockIn.userId
                );
                // Try to find the user by userId if employee not found
                const user = employee
                  ? employee.user
                  : userData?.allUser?.find((u: any) => u.id === clockIn.userId) || null;
                const displayName = employee?.fullName || user?.username || clockIn.userId;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {displayName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(clockIn.clockIn), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {clockIn.clockOut
                        ? format(new Date(clockIn.clockOut), 'MMM dd, yyyy HH:mm')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {clockIn.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatAmount(clockIn.moneyIn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatAmount(clockIn.moneyOut)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Section */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Employee Information</h3>
          <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
            Staff Details
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Position
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Phone
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Username
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.employeeData.map((employee, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.user?.username || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.user?.role || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Employees by Orders Handled */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Top Employees by Orders Handled</h3>
            <div className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm font-medium">
              Staff Performance
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.topEmployees || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Hourly Sales Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Hourly Sales Distribution</h3>
            <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
              Peak Hours
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.hourlySalesArray || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  formatter={(value: number) => formatAmount(value)}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="total" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Popular Items and Booking Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Popular Items */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Popular Items</h3>
            <div className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm font-medium">
              Top 5
            </div>
          </div>
          <div className="space-y-4">
            {analytics.popularItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 font-medium">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900 bg-white px-3 py-1 rounded-full shadow-sm">
                  {item.count} orders
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Booking Distribution</h3>
            <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
              Type Analysis
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(analytics.bookingDistribution).map(([type, count]) => ({
                    name: type,
                    value: count,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {Object.entries(analytics.bookingDistribution).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <SpinningModal isOpen={isLoading} />}
    </div>
  );
};

export default Reports;
