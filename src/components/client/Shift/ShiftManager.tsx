import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaClock,
  FaClipboardCheck,
  FaMoneyBill,
  FaReceipt,
  FaChevronRight,
  FaTimes,
  FaCheck,
  FaSpinner,
} from 'react-icons/fa';
import ShiftChecklist from './ShiftChecklist';
import ShiftReport from './ShiftReport';
import { useCreateClockIn } from '@/hooks/useClockInRecord';
import { User } from '@/services/userServices';

const ShiftManager: React.FC = () => {
  const [showChecklist, setShowChecklist] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [checklistCompleted, setChecklistCompleted] = useState(false);
  const { handleCreateClockIn, handleUpdateClockIn } = useCreateClockIn();
  const [user, setUser] = useState<User | null>(null);
  const [activeClockIn, setActiveClockIn] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEndingShift, setIsEndingShift] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
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
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleStartShift = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await handleCreateClockIn(user.id);
      // Refresh user data after creating clock in
      const response = await fetch('/api/get-me', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      setUser(data.user);

      // Update active clock in
      if (data.user.clockIns && data.user.clockIns.length > 0) {
        const activeRecord = data.user.clockIns.find((record: any) => record.status === 'active');
        if (activeRecord) {
          setActiveClockIn(activeRecord);
        }
      }
    } catch (error) {
      console.error('Error starting shift:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndShift = async () => {
    if (!checklistCompleted) {
      setShowChecklist(true);
      return;
    }

    setIsEndingShift(true);
    try {
      if (user) {
        await handleUpdateClockIn(user.id, '', 'inactive');
        // Refresh user data after updating clock in
        const response = await fetch('/api/get-me', {
          method: 'POST',
          credentials: 'include',
        });
        const data = await response.json();
        setUser(data.user);

        // Update active clock in
        if (data.user.clockIns && data.user.clockIns.length > 0) {
          const activeRecord = data.user.clockIns.find((record: any) => record.status === 'active');
          if (activeRecord) {
            setActiveClockIn(activeRecord);
          } else {
            setActiveClockIn(null);
          }
        }
      }
      setShowReport(true);
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
  const hasActiveShift = user?.clockIns?.some((record: any) => record.status === 'active') || false;

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-[60px]">
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

      {/* Shift Status Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Current Shift</h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              hasActiveShift ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {hasActiveShift ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaClock className="text-gray-400 w-4 h-4" />
              <span className="text-sm text-gray-600">Start Time:</span>
            </div>
            <span className="text-sm font-medium text-gray-800">
              {activeClockIn ? formatTime(activeClockIn.clockIn) : '-'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaClock className="text-gray-400 w-4 h-4" />
              <span className="text-sm text-gray-600">End Time:</span>
            </div>
            <span className="text-sm font-medium text-gray-800">
              {activeClockIn?.clockOut ? formatTime(activeClockIn.clockOut) : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <button
          onClick={hasActiveShift ? handleEndShift : handleStartShift}
          disabled={isLoading || isEndingShift}
          className={`w-full py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 
                     transition-colors cursor-pointer ${
                       hasActiveShift
                         ? 'bg-red-600 hover:bg-red-700'
                         : 'bg-green-600 hover:bg-green-700'
                     } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <FaClock className="w-4 h-4" />
          {hasActiveShift ? 'End Shift' : 'Start Shift'}
        </button>

        {hasActiveShift && (
          <>
            <button
              onClick={() => setShowChecklist(true)}
              disabled={isLoading || isEndingShift}
              className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                       transition-colors flex items-center justify-center gap-2 cursor-pointer
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaClipboardCheck className="w-4 h-4" />
              View Checklist
            </button>

            <button
              onClick={() => setShowReport(true)}
              disabled={isLoading || isEndingShift}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 
                       transition-colors flex items-center justify-center gap-2 cursor-pointer
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaReceipt className="w-4 h-4" />
              View Report
            </button>
          </>
        )}
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

      {/* Report Modal */}
      <ShiftReport
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        shift={{
          startTime: activeClockIn?.clockIn || '',
          endTime: activeClockIn?.clockOut || '',
        }}
      />
    </div>
  );
};

export default ShiftManager;
