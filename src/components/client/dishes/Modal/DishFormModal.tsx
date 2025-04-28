// client/src/components/client/dishes/DishFormModal.tsx
import React, { useState, useEffect } from 'react';

export default function DishFormModal({ open, onClose, onSave, initialData }: any) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPrice(initialData.price?.toString() || '');
      setCategory(initialData.category || '');
    } else {
      setName('');
      setPrice('');
      setCategory('');
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, price: Number(price), category });
  };

  return open ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-xs mx-2">
        <h2 className="text-lg font-bold mb-4">{initialData ? 'Edit Dish' : 'Add Dish'}</h2>
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
            <label className="block text-sm font-medium mb-1">Price (₫)</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="number"
              min="0"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="flex-1 py-2 rounded bg-blue-600 text-white cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              className="flex-1 py-2 rounded bg-gray-200 cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
}
