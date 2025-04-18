import React, { useState } from 'react';
import { Table, Order } from '../../../types/table';

interface ChangeTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fromTableId: string, toTableId: string, orderId: string) => void;
  currentTable: Table;
  order: Order;
  availableTables: Table[];
}

const ChangeTableModal: React.FC<ChangeTableModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentTable,
  order,
  availableTables,
}) => {
  const [selectedTableId, setSelectedTableId] = useState<string>('');

  const handleChangeTable = () => {
    if (selectedTableId) {
      onSave(currentTable.id, selectedTableId, order.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Change Table</h2>

        <div className="mb-4">
          <h3 className="font-medium mb-2">Current Table</h3>
          <p>
            {currentTable.number} (Capacity: {currentTable.capacity})
          </p>
        </div>

        <div className="mb-4">
          <h3 className="font-medium mb-2">Order Details</h3>
          <p>Order #{order.id}</p>
          <p>Total: ${order.total.toFixed(2)}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-medium mb-2">Select New Table</h3>
          <select
            value={selectedTableId}
            onChange={e => setSelectedTableId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Select a table</option>
            {availableTables
              .filter(table => table.id !== currentTable.id && table.status === 'available')
              .map(table => (
                <option key={table.id} value={table.id}>
                  {table.number} (Capacity: {table.capacity})
                </option>
              ))}
          </select>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleChangeTable}
            disabled={!selectedTableId}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Change Table
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeTableModal;
