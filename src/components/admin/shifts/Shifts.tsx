import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_CLOCK_INS } from '../../../services/clockInServices';
import { GET_ALL_USERS_WITH_EMPLOYMENT, GET_ALL_EMPLOYEES } from '../../../services/reportServices';
import { GET_REPORT } from '../../../services/reportServices';
import {
  format,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  differenceInMinutes,
} from 'date-fns';

const Shifts = () => {
  const { data: clockInData, loading: loadingClockIns } = useQuery(GET_ALL_CLOCK_INS);
  const { data: reportData, loading: loadingReports } = useQuery(GET_REPORT);

  const [dateRange, setDateRange] = useState({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });
  const { data: usersData } = useQuery(GET_ALL_USERS_WITH_EMPLOYMENT);
  console.log(usersData);
  if (loadingClockIns || loadingReports)
    return <div className="p-6 text-center text-lg">Loading shifts...</div>;

  // Get all users from clockIns
  const users: Record<string, any> = {};
  (clockInData?.allClockIns || []).forEach((shift: any) => {
    users[shift.userId] = shift.user;
  });

  // Filter reports by date range, guard against invalid interval
  let filteredReports: any[] = [];
  if (
    dateRange.start &&
    dateRange.end &&
    !isNaN(dateRange.start.getTime()) &&
    !isNaN(dateRange.end.getTime())
  ) {
    filteredReports = (reportData?.allReport || []).filter((report: any) => {
      const reportDate = parseISO(report.date);
      return isWithinInterval(reportDate, { start: dateRange.start, end: dateRange.end });
    });
  }

  // Group and sum by userId
  const userSummaries: Record<string, any> = {};
  filteredReports.forEach((report: any) => {
    if (!userSummaries[report.userId]) {
      userSummaries[report.userId] = {
        moneyIn: 0,
        moneyOut: 0,
        totalOrder: 0,
        totalSale: 0,
        notes: [],
      };
    }
    userSummaries[report.userId].moneyIn += report.moneyIn;
    userSummaries[report.userId].moneyOut += report.moneyOut;
    userSummaries[report.userId].totalOrder += report.totalOrder;
    userSummaries[report.userId].totalSale += report.totalSale;
    if (report.note) userSummaries[report.userId].notes.push(report.note);
  });

  // Group shifts by date and user, and track clock in/out times (use filteredShifts)
  const filteredShifts = (clockInData?.allClockIns || []).filter((shift: any) => {
    const clockIn = parseISO(shift.clockIn);
    return isWithinInterval(clockIn, { start: dateRange.start, end: dateRange.end });
  });
  const shiftReportByDate: Record<
    string,
    Record<
      string,
      { hours: number; isWorking: boolean; clockIns: Date[]; clockOuts: (Date | null)[] }
    >
  > = {};
  (filteredShifts || []).forEach((shift: any) => {
    const clockIn = parseISO(shift.clockIn);
    const clockOut = shift.clockOut ? parseISO(shift.clockOut) : null;
    const dateKey = format(clockIn, 'yyyy-MM-dd');
    const userId = shift.userId;
    const hours = clockOut
      ? differenceInMinutes(clockOut, clockIn) / 60
      : differenceInMinutes(new Date(), clockIn) / 60;
    if (!shiftReportByDate[dateKey]) shiftReportByDate[dateKey] = {};
    if (!shiftReportByDate[dateKey][userId]) {
      shiftReportByDate[dateKey][userId] = {
        hours: 0,
        isWorking: false,
        clockIns: [],
        clockOuts: [],
      };
    }
    shiftReportByDate[dateKey][userId].hours += hours;
    shiftReportByDate[dateKey][userId].clockIns.push(clockIn);
    shiftReportByDate[dateKey][userId].clockOuts.push(clockOut);
    if (!clockOut) shiftReportByDate[dateKey][userId].isWorking = true;
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span className="inline-block w-2 h-6 bg-blue-500 rounded-full mr-2"></span>
        User Shift Summary
      </h2>
      {/* Date Range Picker */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center">
        <label className="text-sm font-medium text-gray-600">
          From
          <input
            type="date"
            value={format(dateRange.start, 'yyyy-MM-dd')}
            onChange={e => setDateRange(r => ({ ...r, start: parseISO(e.target.value) }))}
            className="ml-2 border rounded px-2 py-1 focus:ring focus:ring-blue-200"
          />
        </label>
        <label className="text-sm font-medium text-gray-600">
          To
          <input
            type="date"
            value={format(dateRange.end, 'yyyy-MM-dd')}
            onChange={e => setDateRange(r => ({ ...r, end: parseISO(e.target.value) }))}
            className="ml-2 border rounded px-2 py-1 focus:ring focus:ring-blue-200"
          />
        </label>
      </div>
      {/* User Summary Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg bg-white mt-10">
        <h3 className="text-lg font-bold px-4 pt-4 pb-2 text-gray-700">User Shift Summary</h3>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Username</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Money In</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Money Out</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Total Orders</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Total Sale</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Notes</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(userSummaries).length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  No data for this range.
                </td>
              </tr>
            )}
            {Object.entries(userSummaries).map(([userId, summary]: any) => (
              <tr key={userId} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 whitespace-nowrap text-blue-700 font-semibold">
                  {users[userId]?.username || userId}
                </td>
                <td className="px-4 py-3 text-center">{summary.moneyIn}</td>
                <td className="px-4 py-3 text-center">{summary.moneyOut}</td>
                <td className="px-4 py-3 text-center">{summary.totalOrder}</td>
                <td className="px-4 py-3 text-center">{summary.totalSale}</td>
                <td className="px-4 py-3">{summary.notes.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Shift Report By Date Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg bg-white mb-10 mt-10">
        <h3 className="text-lg font-bold px-4 pt-4 pb-2 text-gray-700">Shift Report By Date</h3>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Username</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Clock In</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Clock Out</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Total Hours</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(shiftReportByDate).length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  No shift data for this range.
                </td>
              </tr>
            )}
            {Object.entries(shiftReportByDate)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, usersByDate]) =>
                Object.entries(usersByDate).map(([userId, info]) => {
                  const earliestIn =
                    info.clockIns.length > 0
                      ? info.clockIns.reduce((a, b) => (a < b ? a : b))
                      : null;
                  const latestOut =
                    info.clockOuts.filter(Boolean).length > 0
                      ? info.clockOuts.filter(Boolean).reduce((a, b) => (a && b && a > b ? a : b))
                      : null;
                  return (
                    <tr
                      key={date + userId}
                      className={
                        info.isWorking
                          ? 'bg-green-50/60 font-semibold'
                          : 'hover:bg-gray-50 transition'
                      }
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {format(parseISO(date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-blue-700 font-semibold">
                        {users[userId]?.username || userId}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {earliestIn ? format(earliestIn, 'HH:mm') : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {latestOut ? (
                          format(latestOut, 'HH:mm')
                        ) : (
                          <span className="text-green-600 font-bold">Working...</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">{info.hours.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        {info.isWorking ? (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            Working
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Shifts;
