import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaCheck, FaChevronRight } from 'react-icons/fa';

interface ShiftChecklistProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface ChecklistItem {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
}

const ShiftChecklist: React.FC<ShiftChecklistProps> = ({ isOpen, onClose, onComplete }) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 1,
      title: 'Clean Tables',
      description: 'Wipe down all tables and chairs, ensure they are properly arranged',
      isCompleted: false,
    },
    {
      id: 2,
      title: 'Check Inventory',
      description: 'Update inventory counts and note any items that need to be restocked',
      isCompleted: false,
    },
    {
      id: 3,
      title: 'Clean Equipment',
      description: 'Clean and sanitize all kitchen equipment and coffee machines',
      isCompleted: false,
    },
    {
      id: 4,
      title: 'Cash Count',
      description: 'Count cash drawer and reconcile with system sales',
      isCompleted: false,
    },
    {
      id: 5,
      title: 'Waste Log',
      description: 'Record any food waste and update the waste log',
      isCompleted: false,
    },
    {
      id: 6,
      title: 'Security Check',
      description: 'Check all doors, windows, and ensure security system is ready',
      isCompleted: false,
    },
  ]);

  const handleToggleItem = (itemId: number) => {
    setChecklist(prev =>
      prev.map(item => (item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item))
    );
  };

  const isAllCompleted = checklist.every(item => item.isCompleted);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">End of Shift Checklist</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500 w-4 h-4" />
          </button>
        </div>

        {/* Checklist */}
        <div className="p-4">
          <div className="space-y-3 mb-4">
            {checklist.map(item => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border ${
                  item.isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
              >
                <button
                  onClick={() => handleToggleItem(item.id)}
                  className="w-full flex items-start gap-3"
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.isCompleted ? 'bg-green-500' : 'border-2 border-gray-300'
                    }`}
                  >
                    {item.isCompleted && <FaCheck className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 text-left">
                    <h3
                      className={`text-sm font-medium ${
                        item.isCompleted ? 'text-green-800' : 'text-gray-800'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`text-xs mt-0.5 ${
                        item.isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                  <FaChevronRight
                    className={`w-4 h-4 mt-1 ${
                      item.isCompleted ? 'text-green-500' : 'text-gray-400'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={onComplete}
            disabled={!isAllCompleted}
            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                     transition-colors flex items-center justify-center gap-2
                     disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
          >
            <FaCheck className="w-4 h-4" />
            Complete Shift
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShiftChecklist;
