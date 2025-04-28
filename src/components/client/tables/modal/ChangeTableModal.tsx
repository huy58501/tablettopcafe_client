import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@apollo/client';
import { GET_ALL_TABLES } from '@/services/tableServices';
import { FaTimes, FaChair, FaSearch, FaFilter } from 'react-icons/fa';

interface Table {
  id: number;
  number: number;
  room?: string;
  capacity?: number;
}

interface ChangeTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newTableId: number) => void;
  currentTableId: number;
}

const ChangeTableModal: React.FC<ChangeTableModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentTableId,
}) => {
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { data: tablesData } = useQuery(GET_ALL_TABLES);

  const handleConfirm = () => {
    if (selectedTableId) {
      onConfirm(selectedTableId);
      onClose();
    }
  };

  // Get unique categories from tables
  const categories = useMemo(() => {
    if (!tablesData?.allTable) return [];
    const uniqueCategories = new Set<string>();
    tablesData.allTable.forEach((table: Table) => {
      if (table.room) uniqueCategories.add(table.room);
    });
    return ['all', ...Array.from(uniqueCategories)];
  }, [tablesData]);

  // Filter and group tables
  const filteredAndGroupedTables = useMemo(() => {
    if (!tablesData?.allTable) return {} as Record<string, Table[]>;

    const filtered = tablesData.allTable
      .filter((table: Table) => {
        const matchesSearch =
          searchQuery === '' ||
          table.number.toString().includes(searchQuery) ||
          (table.room && table.room.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || table.room === selectedCategory;
        return (
          table.id !== currentTableId &&
          matchesSearch &&
          matchesCategory &&
          (table as any).status === 'available'
        );
      })
      .sort((a: Table, b: Table) => a.id - b.id);

    // Group by room
    const grouped = filtered.reduce((acc: Record<string, Table[]>, table: Table) => {
      const category = table.room || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(table);
      return acc;
    }, {});

    return grouped;
  }, [tablesData, searchQuery, selectedCategory, currentTableId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="bg-white rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Change Table</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <FaTimes className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Table Grid */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {(Object.entries(filteredAndGroupedTables) as [string, Table[]][]).map(
              ([category, tables]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h4 className="text-sm font-medium text-gray-500 mb-3 px-1">
                    {category === 'Uncategorized' ? 'Other Tables' : category}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {tables.map((table: Table) => (
                      <motion.button
                        key={table.id}
                        onClick={() => setSelectedTableId(table.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          selectedTableId === table.id
                            ? 'border-purple-600 bg-purple-50 shadow-lg'
                            : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <FaChair
                            className={`w-6 h-6 ${
                              selectedTableId === table.id ? 'text-purple-600' : 'text-gray-400'
                            }`}
                          />
                          <span
                            className={`font-medium ${
                              selectedTableId === table.id ? 'text-purple-700' : 'text-gray-700'
                            }`}
                          >
                            Table {table.number}
                          </span>
                          {table.capacity && (
                            <span className="text-xs text-gray-500">{table.capacity} seats</span>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 font-medium rounded-xl 
                         hover:bg-gray-100 transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedTableId}
                className={`flex-1 py-2.5 px-4 text-white font-medium rounded-xl transition-all text-sm cursor-pointer
                  ${
                    selectedTableId
                      ? 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
              >
                Confirm Change
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChangeTableModal;
