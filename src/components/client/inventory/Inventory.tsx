import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import SpinningModal from '@/components/UI/SpinningModal';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  updatedAt: string;
}

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Rice',
    quantity: 100,
    unit: 'kg',
    category: 'Food',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Beef',
    quantity: 20,
    unit: 'kg',
    category: 'Meat',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Coke',
    quantity: 50,
    unit: 'bottle',
    category: 'Drink',
    updatedAt: new Date().toISOString(),
  },
];

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  // CRUD handlers (mock)
  const handleAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };
  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };
  const handleDelete = (item: InventoryItem) => {
    setDeletingItem(item);
    setConfirmOpen(true);
  };
  const handleSave = (item: Partial<InventoryItem>) => {
    setLoading(true);
    setTimeout(() => {
      if (editingItem) {
        setInventory(inv =>
          inv.map(i =>
            i.id === editingItem.id
              ? ({ ...i, ...item, updatedAt: new Date().toISOString() } as InventoryItem)
              : i
          )
        );
      } else {
        setInventory(inv => [
          ...inv,
          {
            ...item,
            id: Date.now().toString(),
            updatedAt: new Date().toISOString(),
          } as InventoryItem,
        ]);
      }
      setModalOpen(false);
      setLoading(false);
    }, 500);
  };
  const handleConfirmDelete = () => {
    setLoading(true);
    setTimeout(() => {
      setInventory(inv => inv.filter(i => i.id !== deletingItem?.id));
      setConfirmOpen(false);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-2 sm:px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Inventory</h1>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="px-2 py-2 text-left">Name</th>
              <th className="px-2 py-2 text-left">Quantity</th>
              <th className="px-2 py-2 text-left">Unit</th>
              <th className="px-2 py-2 text-left">Category</th>
              <th className="px-2 py-2 text-left">Last Updated</th>
              <th className="px-2 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-2 py-2 font-medium text-gray-900">{item.name}</td>
                <td className="px-2 py-2">{item.quantity}</td>
                <td className="px-2 py-2">{item.unit}</td>
                <td className="px-2 py-2">{item.category || '-'}</td>
                <td className="px-2 py-2">{new Date(item.updatedAt).toLocaleString()}</td>
                <td className="px-2 py-2 flex gap-2">
                  <button
                    className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-600 cursor-pointer"
                    onClick={() => handleEdit(item)}
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-full bg-gray-100 hover:bg-red-100 text-red-600 cursor-pointer"
                    onClick={() => handleDelete(item)}
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modals */}
      {modalOpen && (
        <InventoryFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          initialData={editingItem}
        />
      )}
      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
          message={`Delete item "${deletingItem?.name}"?`}
        />
      )}
      <SpinningModal isOpen={loading} message="Processing..." />
      {/* Floating Add Button */}
      <button
        className="fixed bottom-6 right-6 z-40 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition cursor-pointer"
        onClick={handleAdd}
        aria-label="Add Inventory Item"
      >
        <FiPlus className="w-6 h-6" />
      </button>
    </div>
  );
}

// Inline InventoryFormModal
function InventoryFormModal({ open, onClose, onSave, initialData }: any) {
  const [name, setName] = React.useState(initialData?.name || '');
  const [quantity, setQuantity] = React.useState(initialData?.quantity || '');
  const [unit, setUnit] = React.useState(initialData?.unit || '');
  const [category, setCategory] = React.useState(initialData?.category || '');

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setQuantity(initialData.quantity || '');
      setUnit(initialData.unit || '');
      setCategory(initialData.category || '');
    } else {
      setName('');
      setQuantity('');
      setUnit('');
      setCategory('');
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, quantity: Number(quantity), unit, category });
  };

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-xs mx-2">
        <h2 className="text-lg font-bold mb-4">{initialData ? 'Edit Item' : 'Add Item'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="number"
              min="0"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={unit}
              onChange={e => setUnit(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="flex-1 py-2 rounded bg-blue-600 text-white">
              Save
            </button>
            <button type="button" className="flex-1 py-2 rounded bg-gray-200" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Inline ConfirmDialog
function ConfirmDialog({ open, onConfirm, onCancel, message }: any) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={e => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-xs mx-2">
        <h2 className="text-lg font-bold mb-4">Confirm</h2>
        <p className="mb-4">{message}</p>
        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded bg-red-600 text-white" onClick={onConfirm}>
            Delete
          </button>
          <button className="flex-1 py-2 rounded bg-gray-200" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
