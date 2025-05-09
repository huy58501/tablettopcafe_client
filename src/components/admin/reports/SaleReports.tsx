'use client';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ORDERS } from '../../../services/orderServices';
import { GET_ALL_BOOKINGS } from '../../../services/bookingServices';
import { GET_ALL_TABLES } from '../../../services/tableServices';
import { GET_REPORT } from '../../../services/reportServices';
import { GET_ALL_CLOCK_INS } from '../../../services/clockInServices';
import { GET_ALL_USERS_WITH_EMPLOYMENT, GET_ALL_EMPLOYEES } from '../../../services/reportServices';
import SpinningModal from '@/components/UI/SpinningModal';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  subMonths,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns';
import { FaFileExcel, FaFilePdf, FaCalendar, FaChartLine } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface SalesData {
  date: string;
  total: number;
  orders: number;
  averageOrderValue: number;
}

interface TopSellingItem {
  id: number;
  name: string;
  quantity: number;
  revenue: number;
}

interface PaymentSummary {
  cash: number;
  qr: number;
}

const Reports = () => {
  const { loading: clockInLoading, data: clockInData } = useQuery(GET_ALL_CLOCK_INS);
  const { loading: ordersLoading, data: ordersData } = useQuery(GET_ORDERS);
  const { loading: bookingsLoading, data: bookingsData } = useQuery(GET_ALL_BOOKINGS);
  const { loading: tablesLoading, data: tablesData } = useQuery(GET_ALL_TABLES);
  const { data: allReportData, loading: allReportLoading } = useQuery(GET_REPORT);
  const { data: userData, loading: userLoading } = useQuery(GET_ALL_USERS_WITH_EMPLOYMENT);
  const { data: employeeData, loading: employeeLoading } = useQuery(GET_ALL_EMPLOYEES);

  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  });

  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topSellingItems, setTopSellingItems] = useState<TopSellingItem[]>([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topPaymentMethod: '',
  });

  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    cash: 0,
    qr: 0,
  });

  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

  const [lastMonthRevenue, setLastMonthRevenue] = useState(0);

  const [topWorker, setTopWorker] = useState<{ username: string; hours: number } | null>(null);

  const isLoading =
    ordersLoading ||
    bookingsLoading ||
    tablesLoading ||
    allReportLoading ||
    clockInLoading ||
    userLoading ||
    employeeLoading;

  useEffect(() => {
    if (ordersData?.allOrders) {
      console.log('--- Processing Orders ---');
      const filteredOrders = ordersData.allOrders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dateRange.startDate && orderDate <= dateRange.endDate;
      });

      console.log(`Total orders in date range: ${filteredOrders.length}`);

      // Calculate payment totals - only for paid orders
      let cashTotal = 0;
      let qrTotal = 0;
      let totalRevenue = 0;

      console.log('\n--- Payment Details ---');
      filteredOrders.forEach((order: any) => {
        console.log(`\nOrder #${order.id}:`);
        console.log(`Status: ${order.status}`);
        console.log(`Total: ${formatVND(order.total)}`);
        console.log(`Payment: ${order.payment}`);
        console.log(`Reference: ${order.reference || 'N/A'}`);

        // Add to total revenue regardless of payment status
        totalRevenue += order.total;
        console.log(`Running Total Revenue: ${formatVND(totalRevenue)}`);

        // Always parse the reference for split payments, even if payment !== 'Split Bill'
        let splitCash = 0;
        let splitQR = 0;
        if (order.reference) {
          // Parse all cash payments
          const cashMatches = order.reference.match(/Tiền Mặt \+ ([\d,.]+)/g);
          if (cashMatches) {
            cashMatches.forEach((match: string) => {
              const amount = parseInt(match.split('+ ')[1].replace(/[.,]/g, ''));
              splitCash += amount;
            });
          }
          // Parse all QR payments
          const qrMatches = order.reference.match(/Chuyển Khoản \+ ([\d,.]+)/g);
          if (qrMatches) {
            qrMatches.forEach((match: string) => {
              const amount = parseInt(match.split('+ ')[1].replace(/[.,]/g, ''));
              splitQR += amount;
            });
          }
        }
        // If split bill found, add those, otherwise fall back to main payment type
        if (splitCash > 0 || splitQR > 0) {
          cashTotal += splitCash;
          qrTotal += splitQR;
        } else if (order.payment === 'Tiền Mặt') {
          cashTotal += order.total;
        } else if (order.payment === 'Chuyển Khoản') {
          qrTotal += order.total;
        }
        console.log(`Running Cash Total: ${formatVND(cashTotal)}`);
        console.log(`Running QR Total: ${formatVND(qrTotal)}`);
      });

      setPaymentSummary({
        cash: cashTotal,
        qr: qrTotal,
      });

      // Calculate summary
      setSummary({
        totalRevenue: totalRevenue,
        totalOrders: filteredOrders.length,
        averageOrderValue: filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0,
        topPaymentMethod: cashTotal >= qrTotal ? 'Cash' : 'QR',
      });

      // Update top payment method based on amount rather than transaction count
      const totalCashTransactions = filteredOrders.filter(
        (order: any) =>
          order.status === 'paid' &&
          (order.payment === 'Tiền Mặt' ||
            (order.payment === 'Split Bill' && order.reference.includes('Tiền Mặt')))
      ).length;

      const totalQRTransactions = filteredOrders.filter(
        (order: any) =>
          order.status === 'paid' &&
          (order.payment === 'Chuyển Khoản' ||
            (order.payment === 'Split Bill' && order.reference.includes('Chuyển Khoản')))
      ).length;

      console.log('\n--- Transaction Counts ---');
      console.log(`Cash Transactions: ${totalCashTransactions}`);
      console.log(`QR Transactions: ${totalQRTransactions}`);

      // Calculate daily sales data
      const dailyData = eachDayOfInterval({
        start: dateRange.startDate,
        end: dateRange.endDate,
      }).map(date => {
        const dayOrders = filteredOrders.filter((order: any) => {
          const orderDate = new Date(order.createdAt);
          return format(orderDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        });

        const total = dayOrders.reduce((sum: number, order: any) => sum + order.total, 0);
        return {
          date: format(date, 'yyyy-MM-dd'),
          total,
          orders: dayOrders.length,
          averageOrderValue: dayOrders.length > 0 ? total / dayOrders.length : 0,
        };
      });

      setSalesData(dailyData);

      // Calculate top selling items
      const itemMap = new Map<number, TopSellingItem>();
      filteredOrders.forEach((order: any) => {
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

      setTopSellingItems(
        Array.from(itemMap.values())
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 10)
      );

      // Calculate last month's total revenue (paid orders only)
      const lastMonthOrders = ordersData.allOrders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= lastMonthStart && orderDate <= lastMonthEnd && order.status === 'paid';
      });
      const lastMonthTotal = lastMonthOrders.reduce(
        (sum: number, order: any) => sum + order.total,
        0
      );
      setLastMonthRevenue(lastMonthTotal);
    }
    // Calculate top worker for this month
    if (clockInData?.allClockIns) {
      // Get current month range
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      // Aggregate hours per user
      const userHours: Record<string, { username: string; hours: number }> = {};
      clockInData.allClockIns.forEach((ci: any) => {
        const clockIn = new Date(ci.clockIn);
        const clockOut = ci.clockOut ? new Date(ci.clockOut) : new Date();
        // Only count if clockIn is in this month
        if (clockIn >= monthStart && clockIn <= monthEnd) {
          const diff = differenceInMinutes(clockOut, clockIn) / 60;
          if (!userHours[ci.userId]) {
            userHours[ci.userId] = { username: ci.user.username, hours: 0 };
          }
          userHours[ci.userId].hours += diff;
        }
      });
      // Find top worker
      let top: { username: string; hours: number } | null = null;
      Object.values(userHours).forEach(u => {
        if (!top || u.hours > top.hours) top = u;
      });
      setTopWorker(top);
    }
  }, [ordersData, dateRange, clockInData]);

  const handleExportExcel = () => {
    // Prepare data for export
    const salesSheet = salesData.map(day => ({
      Date: day.date,
      'Total Revenue': formatVND(day.total),
      'Number of Orders': day.orders,
      'Average Order Value': formatVND(day.averageOrderValue),
    }));

    const itemsSheet = topSellingItems.map(item => ({
      'Item Name': item.name,
      'Quantity Sold': item.quantity,
      'Total Revenue': formatVND(item.revenue),
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(salesSheet), 'Daily Sales');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(itemsSheet), 'Top Items');
    XLSX.writeFile(workbook, `sales_report_${format(dateRange.startDate, 'yyyy-MM-dd')}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Add header
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Sales Report', 14, 25);

    // Reset text color for rest of the document
    doc.setTextColor(0, 0, 0);

    // Add date range
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Date Range: ${format(dateRange.startDate, 'dd/MM/yyyy')} - ${format(
        dateRange.endDate,
        'dd/MM/yyyy'
      )}`,
      14,
      50
    );

    // Summary section with a light background
    doc.setFillColor(240, 240, 240);
    doc.rect(10, 60, 190, 45, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Summary', 14, 70);

    // Summary details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Total Revenue:`, 14, 80);
    doc.setFont('helvetica', 'bold');
    doc.text(`${formatVND(summary.totalRevenue)}`, 70, 80);

    doc.setFont('helvetica', 'normal');
    doc.text(`Total Orders:`, 14, 90);
    doc.setFont('helvetica', 'bold');
    doc.text(`${summary.totalOrders}`, 70, 90);

    doc.setFont('helvetica', 'normal');
    doc.text(`Average Order Value:`, 14, 100);
    doc.setFont('helvetica', 'bold');
    doc.text(`${formatVND(summary.averageOrderValue)}`, 70, 100);

    // Payment Methods section
    doc.setFillColor(240, 240, 240);
    doc.rect(10, 115, 190, 35, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Payment Methods', 14, 125);

    // Payment details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Cash:`, 14, 135);
    doc.setFont('helvetica', 'bold');
    doc.text(`${formatVND(paymentSummary.cash)}`, 70, 135);

    doc.setFont('helvetica', 'normal');
    doc.text(`QR:`, 14, 145);
    doc.setFont('helvetica', 'bold');
    doc.text(`${formatVND(paymentSummary.qr)}`, 70, 145);

    // Top Selling Items Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Top Selling Items', 14, 165);

    const itemsTableData = topSellingItems.map(item => [
      item.name,
      item.quantity.toString(),
      formatVND(item.revenue),
    ]);

    autoTable(doc, {
      startY: 170,
      head: [['Item Name', 'Quantity', 'Revenue']],
      body: itemsTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 85 },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 50, halign: 'right' },
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 10, right: 10 },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
    });

    // Add footer
    const pageCount = doc.internal.pages.length;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')} - Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save with formatted date in filename
    doc.save(`sales_report_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`);
  };

  if (isLoading) {
    return <SpinningModal isOpen={true} message="Loading report data..." />;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center">
            <FaCalendar className="mr-2" />
            Select Date Range
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <FaFileExcel className="mr-2" />
              Export Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <FaFilePdf className="mr-2" />
              Export PDF
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={format(dateRange.startDate, 'yyyy-MM-dd')}
              onChange={e =>
                setDateRange(prev => ({
                  ...prev,
                  startDate: parseISO(e.target.value),
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={format(dateRange.endDate, 'yyyy-MM-dd')}
              onChange={e =>
                setDateRange(prev => ({
                  ...prev,
                  endDate: parseISO(e.target.value),
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Revenue Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-yellow-100 to-yellow-300 p-6 rounded-2xl shadow flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FaChartLine className="text-yellow-500 text-4xl" />
            <div>
              <div className="text-base font-medium text-yellow-700">Total Revenue</div>
              <div className="text-3xl md:text-4xl font-bold text-yellow-900">
                {formatVND(summary.totalRevenue)}
              </div>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-xs text-yellow-700 font-medium">For selected date range</div>
          </div>
        </div>
        {/* Last Month Revenue */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FaChartLine className="text-blue-400 text-4xl" />
            <div>
              <div className="text-base font-medium text-blue-700">Last Month Revenue</div>
              <div className="text-3xl md:text-4xl font-bold text-blue-900">
                {formatVND(lastMonthRevenue)}
              </div>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-xs text-blue-600 font-medium">
              {format(lastMonthStart, 'MMM yyyy')}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Summary */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Payment Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Cash Payments</h3>
            <p className="mt-1 text-2xl font-semibold text-green-600">
              {formatVND(paymentSummary.cash)}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">QR Payments</h3>
            <p className="mt-1 text-2xl font-semibold text-blue-600">
              {formatVND(paymentSummary.qr)}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow h-full flex flex-col justify-center">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-900">{summary.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow h-full flex flex-col justify-center">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Average Order Value</h3>
          <p className="text-2xl font-bold text-gray-900">{formatVND(summary.averageOrderValue)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow h-full flex flex-col justify-center">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Top Payment Method</h3>
          <p className="text-2xl font-bold text-gray-900">{summary.topPaymentMethod}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow h-full flex flex-col justify-center">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Work Hard This Month</h3>
          {topWorker ? (
            <>
              <p className="text-2xl font-bold text-blue-700">{topWorker.username}</p>
              <p className="text-xs text-gray-500">{topWorker.hours.toFixed(1)} hours</p>
            </>
          ) : (
            <p className="text-gray-400">No data</p>
          )}
        </div>
      </div>

      {/* Sales Trend */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <FaChartLine className="mr-2 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-700">Sales Trend</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Revenue
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Orders
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Avg. Order Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesData.map(day => (
                <tr key={day.date}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {format(parseISO(day.date), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {formatVND(day.total)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{day.orders}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {formatVND(day.averageOrderValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Top Selling Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Item Name
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Quantity Sold
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topSellingItems.map(item => (
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

export default Reports;
