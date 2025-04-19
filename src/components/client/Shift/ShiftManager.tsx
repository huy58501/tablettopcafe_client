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
} from 'react-icons/fa';
import ShiftChecklist from './ShiftChecklist';
import ShiftReport from './ShiftReport';

interface ShiftState {
  isActive: boolean;
  startTime: string | null;
  endTime: string | null;
}

const ShiftManager: React.FC = () => {
  const [shift, setShift] = useState<ShiftState>({
    isActive: false,
    startTime: null,
    endTime: null,
  });
  const [showChecklist, setShowChecklist] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [checklistCompleted, setChecklistCompleted] = useState(false);

  const handleStartShift = () => {
    setShift({
      isActive: true,
      startTime: new Date().toISOString(),
      endTime: null,
    });
  };

  const handleEndShift = () => {
    if (!checklistCompleted) {
      setShowChecklist(true);
      return;
    }
    setShift(prev => ({
      ...prev,
      isActive: false,
      endTime: new Date().toISOString(),
    }));
    setShowReport(true);
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Shift Status Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Current Shift</h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              shift.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {shift.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaClock className="text-gray-400 w-4 h-4" />
              <span className="text-sm text-gray-600">Start Time:</span>
            </div>
            <span className="text-sm font-medium text-gray-800">
              {shift.startTime ? formatTime(shift.startTime) : '-'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaClock className="text-gray-400 w-4 h-4" />
              <span className="text-sm text-gray-600">End Time:</span>
            </div>
            <span className="text-sm font-medium text-gray-800">
              {shift.endTime ? formatTime(shift.endTime) : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <button
          onClick={shift.isActive ? handleEndShift : handleStartShift}
          className={`w-full py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 
                     transition-colors ${
                       shift.isActive
                         ? 'bg-red-600 hover:bg-red-700'
                         : 'bg-green-600 hover:bg-green-700'
                     }`}
        >
          <FaClock className="w-4 h-4" />
          {shift.isActive ? 'End Shift' : 'Start Shift'}
        </button>

        {shift.isActive && (
          <>
            <button
              onClick={() => setShowChecklist(true)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                       transition-colors flex items-center justify-center gap-2"
            >
              <FaClipboardCheck className="w-4 h-4" />
              View Checklist
            </button>

            <button
              onClick={() => setShowReport(true)}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 
                       transition-colors flex items-center justify-center gap-2"
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
          startTime: shift.startTime || '',
          endTime: shift.endTime || '',
        }}
      />
    </div>
  );
};

export default ShiftManager;
