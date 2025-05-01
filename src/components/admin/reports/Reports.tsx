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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { FaFileExcel, FaFilePdf, FaCalendar, FaChartLine } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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

        // Only count payment methods for paid orders
        if (order.status === 'paid') {
          console.log('Processing paid order payment:');
          if (order.payment === 'Split Bill') {
            console.log('Parsing split bill:', order.reference);

            // Find all cash payments
            const cashMatches = order.reference.match(/Tiền Mặt \+ ([\d,.]+)/g);
            let totalCash = 0;
            if (cashMatches) {
              console.log('Found cash payments:', cashMatches);
              cashMatches.forEach((match: string) => {
                const amount = parseInt(match.split('+ ')[1].replace(/[.,]/g, ''));
                console.log('Cash payment found:', formatVND(amount));
                totalCash += amount;
              });
            }

            // Find all QR payments
            const qrMatches = order.reference.match(/Chuyển Khoản \+ ([\d,.]+)/g);
            let totalQR = 0;
            if (qrMatches) {
              console.log('Found QR payments:', qrMatches);
              qrMatches.forEach((match: string) => {
                const amount = parseInt(match.split('+ ')[1].replace(/[.,]/g, ''));
                console.log('QR payment found:', formatVND(amount));
                totalQR += amount;
              });
            }

            console.log(
              `Total split bill - Cash: ${formatVND(totalCash)}, QR: ${formatVND(totalQR)}`
            );
            cashTotal += totalCash;
            qrTotal += totalQR;

            // Verify total matches
            const splitTotal = totalCash + totalQR;
            if (splitTotal !== order.total) {
              console.warn(
                `Split bill total (${formatVND(splitTotal)}) doesn't match order total (${formatVND(order.total)})`
              );
            }
          } else if (order.payment === 'Tiền Mặt') {
            cashTotal += order.total;
            console.log(`Added to Cash Total: ${formatVND(order.total)}`);
          } else if (order.payment === 'Chuyển Khoản') {
            qrTotal += order.total;
            console.log(`Added to QR Total: ${formatVND(order.total)}`);
          }
          console.log(`Running Cash Total: ${formatVND(cashTotal)}`);
          console.log(`Running QR Total: ${formatVND(qrTotal)}`);
        } else {
          console.log('Order not paid - not counting in payment totals');
        }
      });

      console.log('\n--- Final Totals ---');
      console.log(`Total Revenue: ${formatVND(totalRevenue)}`);
      console.log(`Total Cash Payments: ${formatVND(cashTotal)}`);
      console.log(`Total QR Payments: ${formatVND(qrTotal)}`);
      console.log(`Sum of Payments: ${formatVND(cashTotal + qrTotal)}`);
      console.log(`Unpaid Amount: ${formatVND(totalRevenue - (cashTotal + qrTotal))}`);

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
    }
  }, [ordersData, dateRange]);

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

    // Add title
    doc.setFontSize(18);
    doc.text('Sales Report', 14, 20);
    doc.setFontSize(12);
    doc.text(
      `${format(dateRange.startDate, 'dd/MM/yyyy')} - ${format(dateRange.endDate, 'dd/MM/yyyy')}`,
      14,
      30
    );

    // Add summary
    doc.setFontSize(14);
    doc.text('Summary', 14, 45);
    doc.setFontSize(10);
    doc.text(`Total Revenue: ${formatVND(summary.totalRevenue)}`, 14, 55);
    doc.text(`Total Orders: ${summary.totalOrders}`, 14, 62);
    doc.text(`Average Order Value: ${formatVND(summary.averageOrderValue)}`, 14, 69);

    // Add top selling items table
    doc.setFontSize(14);
    doc.text('Top Selling Items', 14, 85);

    const itemsTableData = topSellingItems.map(item => [
      item.name,
      item.quantity.toString(),
      formatVND(item.revenue),
    ]);

    (doc as any).autoTable({
      startY: 90,
      head: [['Item Name', 'Quantity', 'Revenue']],
      body: itemsTableData,
      margin: { top: 90 },
    });

    // Save the PDF
    doc.save(`sales_report_${format(dateRange.startDate, 'yyyy-MM-dd')}.pdf`);
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

      {/* Payment Method Summary */}
      <div className="bg-white p-4 rounded-lg shadow">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {formatVND(summary.totalRevenue)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{summary.totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Average Order Value</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {formatVND(summary.averageOrderValue)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Top Payment Method</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{summary.topPaymentMethod}</p>
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
