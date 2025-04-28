import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaClipboardCheck, FaReceipt, FaSpinner, FaCalendarAlt } from 'react-icons/fa';
import ShiftChecklist from './ShiftChecklist';
import ShiftReport from './ShiftReport';
import { useCreateClockIn } from '@/hooks/useClockInRecord';
import { User } from '@/services/userServices';
import { useReport } from '@/hooks/useReport';

interface ClockInRecord {
  id: number;
  clockIn: string;
  clockOut: string | null;
  status: string;
  notes: string | null;
  userId: string;
  moneyIn: number;
  moneyOut: number;
}

interface UserWithClockIns extends User {
  clockIns: ClockInRecord[];
}

const ShiftManager: React.FC = () => {
  const [showChecklist, setShowChecklist] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [checklistCompleted, setChecklistCompleted] = useState(false);
  const { handleCreateClockIn, handleUpdateClockIn } = useCreateClockIn();
  const [user, setUser] = useState<UserWithClockIns | null>(null);
  const [activeClockIn, setActiveClockIn] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEndingShift, setIsEndingShift] = useState(false);
  const [clockOut, setClockOut] = useState('');
  const { handleCreateReport } = useReport();
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const [timeStats, setTimeStats] = useState({
    today: { totalTime: 0, cashIn: 0, cashOut: 0 },
    week: { totalTime: 0, cashIn: 0, cashOut: 0 },
    month: { totalTime: 0, cashIn: 0, cashOut: 0 },
    selected: { totalTime: 0, cashIn: 0, cashOut: 0, shifts: [] as any[] },
    range: { totalTime: 0, cashIn: 0, cashOut: 0 },
  });

  // Fetch user data utility
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/get-me', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      setUser(data.user);

      // Check if there's an active clock-in record
      if (data.user.clockIns && data.user.clockIns.length > 0) {
        const activeRecord = data.user.clockIns.find((record: any) => record.status === 'active');
        if (activeRecord) {
          setActiveClockIn(activeRecord);
        } else {
          setActiveClockIn(null);
        }
      } else {
        setActiveClockIn(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleStartShift = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await handleCreateClockIn(user.id);
      await fetchUserData(); // reload state after starting shift
    } catch (error) {
      console.error('Error starting shift:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('activeClockIn', activeClockIn);
  }, [activeClockIn]);

  const handleEndShift = async () => {
    if (!checklistCompleted) {
      setShowChecklist(true);
      return;
    }
    setIsEndingShift(true);
    try {
      setShowReport(true);
      setClockOut(new Date().toISOString());
      setActiveClockIn({
        ...activeClockIn,
        clockOut: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error ending shift:', error);
    } finally {
      setIsEndingShift(false);
    }
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Determine if user has an active shift
  const hasActiveShift =
    user?.clockIns?.some((record: any) => record.clockIn !== null && record.clockOut === null) ||
    false;

  function handleClose(): void {
    setShowReport(false);
  }

  const handleSaveReport = async (reportData: any) => {
    console.log('Report data saved:', reportData);
    const { notes, moneyIn, moneyOut } = reportData;
    const status = activeClockIn?.status;
    const userId = user?.id;
    if (!userId) {
      console.error('User ID is undefined');
      return;
    }

    try {
      await handleUpdateClockIn(userId, notes, status, moneyIn, moneyOut);
      await handleCreateReport(reportData, userId);
      await fetchUserData(); // reload state after ending shift
      setShowReport(false);
      setChecklistCompleted(false);
      setActiveClockIn(null);
      // Recalculate stats with new data (handled by useEffect)
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const calculateTimeStats = (clockIns: any[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const stats = {
      today: { totalTime: 0, cashIn: 0, cashOut: 0 },
      week: { totalTime: 0, cashIn: 0, cashOut: 0 },
      month: { totalTime: 0, cashIn: 0, cashOut: 0 },
      selected: { totalTime: 0, cashIn: 0, cashOut: 0, shifts: [] as any[] },
      range: { totalTime: 0, cashIn: 0, cashOut: 0 },
    };

    // Calculate selected range stats
    const rangeStart = new Date(selectedStartDate);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(selectedEndDate);
    rangeEnd.setHours(23, 59, 59, 999);

    clockIns.forEach(record => {
      if (!record.clockIn || !record.clockOut) return;
      const clockInDate = new Date(record.clockIn);
      const clockOutDate = new Date(record.clockOut);
      const timeDiff = (clockOutDate.getTime() - clockInDate.getTime()) / (1000 * 60 * 60); // in hours

      // Range stats
      if (clockInDate >= rangeStart && clockInDate <= rangeEnd) {
        stats.range.totalTime += timeDiff;
        stats.range.cashIn += record.moneyIn || 0;
        stats.range.cashOut += record.moneyOut || 0;
      }

      // Selected date stats
      if (clockInDate >= rangeStart && clockInDate <= rangeEnd) {
        stats.selected.totalTime += timeDiff;
        stats.selected.cashIn += record.moneyIn || 0;
        stats.selected.cashOut += record.moneyOut || 0;
        stats.selected.shifts.push(record);
      }

      if (clockInDate >= today) {
        stats.today.totalTime += timeDiff;
        stats.today.cashIn += record.moneyIn || 0;
        stats.today.cashOut += record.moneyOut || 0;
      }
      if (clockInDate >= weekAgo) {
        stats.week.totalTime += timeDiff;
        stats.week.cashIn += record.moneyIn || 0;
        stats.week.cashOut += record.moneyOut || 0;
      }
      if (clockInDate >= monthAgo) {
        stats.month.totalTime += timeDiff;
        stats.month.cashIn += record.moneyIn || 0;
        stats.month.cashOut += record.moneyOut || 0;
      }
    });

    setTimeStats(stats);
  };

  useEffect(() => {
    if (user?.clockIns) {
      calculateTimeStats(user.clockIns);
    }
  }, [user, selectedStartDate, selectedEndDate]);

  const formatTimeDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Loading Spinner Modal */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4 shadow-xl">
            <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      )}
      <h1 className="text-2xl font-bold text-gray-800 py-4">Welcome {user?.username}</h1>

      {/* Ending Shift Spinner Modal */}
      {isEndingShift && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4 shadow-xl">
            <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-gray-700 font-medium">Ending Shift...</p>
          </div>
        </div>
      )}

      {/* Current Shift Status and Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Current Shift</h2>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                hasActiveShift ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {hasActiveShift ? 'Active' : 'Inactive'}
            </span>
          </div>
          <button
            onClick={hasActiveShift ? handleEndShift : handleStartShift}
            disabled={isLoading || isEndingShift}
            className={`w-full md:w-auto py-3 px-6 rounded-xl text-white font-medium flex items-center justify-center gap-2 
                       transition-colors cursor-pointer ${
                         hasActiveShift
                           ? 'bg-red-600 hover:bg-red-700'
                           : 'bg-green-600 hover:bg-green-700'
                       } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <FaClock className="w-4 h-4" />
            {hasActiveShift ? 'End Shift' : 'Start Shift'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <FaClock className="text-gray-400 w-4 h-4" />
              <span className="text-sm text-gray-600">Start Time:</span>
            </div>
            <span className="text-sm font-medium text-gray-800">
              {activeClockIn ? formatTime(activeClockIn.clockIn) : '-'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <FaClock className="text-gray-400 w-4 h-4" />
              <span className="text-sm text-gray-600">End Time:</span>
            </div>
            <span className="text-sm font-medium text-gray-800">
              {activeClockIn?.clockOut ? formatTime(activeClockIn.clockOut) : '-'}
            </span>
          </div>
        </div>

        {hasActiveShift && (
          <button
            onClick={() => setShowChecklist(true)}
            disabled={isLoading || isEndingShift}
            className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                     transition-colors flex items-center justify-center gap-2 cursor-pointer
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaClipboardCheck className="w-4 h-4" />
            View Checklist
          </button>
        )}
      </div>

      {/* Date Range Picker */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400 w-5 h-5" />
            <span className="text-gray-600 text-sm">From</span>
            <input
              type="date"
              value={selectedStartDate.toISOString().split('T')[0]}
              onChange={e => setSelectedStartDate(new Date(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            />
            <span className="text-gray-600 text-sm">to</span>
            <input
              type="date"
              value={selectedEndDate.toISOString().split('T')[0]}
              onChange={e => setSelectedEndDate(new Date(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            />
          </div>
        </div>
      </div>

      {/* Selected Range Stats */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Stats for Range</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-600">Total Time</p>
            <p className="text-lg font-semibold text-blue-800">
              {formatTimeDuration(timeStats.range.totalTime)}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-sm text-green-600">Cash In</p>
            <p className="text-lg font-semibold text-green-800">
              {formatMoney(timeStats.range.cashIn)}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-sm text-red-600">Cash Out</p>
            <p className="text-lg font-semibold text-red-800">
              {formatMoney(timeStats.range.cashOut)}
            </p>
          </div>
        </div>
      </div>

      {/* Time Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Today</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Time: {formatTimeDuration(timeStats.today.totalTime)}
            </p>
            <p className="text-sm text-gray-600">Cash In: {formatMoney(timeStats.today.cashIn)}</p>
            <p className="text-sm text-gray-600">
              Cash Out: {formatMoney(timeStats.today.cashOut)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">This Week</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Time: {formatTimeDuration(timeStats.week.totalTime)}
            </p>
            <p className="text-sm text-gray-600">Cash In: {formatMoney(timeStats.week.cashIn)}</p>
            <p className="text-sm text-gray-600">Cash Out: {formatMoney(timeStats.week.cashOut)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">This Month</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Time: {formatTimeDuration(timeStats.month.totalTime)}
            </p>
            <p className="text-sm text-gray-600">Cash In: {formatMoney(timeStats.month.cashIn)}</p>
            <p className="text-sm text-gray-600">
              Cash Out: {formatMoney(timeStats.month.cashOut)}
            </p>
          </div>
        </div>
      </div>

      {/* All Clock-In Records */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6 overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Clock-In Records</h3>
        <div className="min-w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clock In
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clock Out
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cash In
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cash Out
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {user?.clockIns
                ?.sort((a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime())
                .map(record => {
                  const clockInDate = new Date(record.clockIn);
                  const clockOutDate = record.clockOut ? new Date(record.clockOut) : null;
                  const duration = clockOutDate
                    ? (clockOutDate.getTime() - clockInDate.getTime()) / (1000 * 60 * 60)
                    : null;

                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(clockInDate)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(record.clockIn)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.clockOut ? formatTime(record.clockOut) : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {duration ? formatTimeDuration(duration) : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatMoney(record.moneyIn)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatMoney(record.moneyOut)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Checklist Modal */}
      <ShiftChecklist
        isOpen={showChecklist}
        onClose={() => setShowChecklist(false)}
        onComplete={() => {
          setChecklistCompleted(true);
          setShowChecklist(false);
          handleEndShift();
        }}
      />

      {/* Report Modal - Only shown when ending shift */}
      {showReport && (
        <ShiftReport
          isOpen={showReport}
          onClose={handleClose}
          userData={activeClockIn}
          onSaveReport={handleSaveReport}
        />
      )}
    </div>
  );
};

export default ShiftManager;
