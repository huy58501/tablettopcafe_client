// client/src/components/client/dishes/DishFormModal.tsx
import React from 'react';

export default function DishFormModal({ open, onClose, onSave, initialData }: any) {
  // ...form state and handlers (implement as needed)
  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 w-full max-w-xs mx-2">
        <h2 className="text-lg font-bold mb-4">{initialData ? 'Edit Dish' : 'Add Dish'}</h2>
        {/* Form fields: name, price, category */}
        {/* ... */}
        <div className="flex gap-2 mt-4">
          <button className="flex-1 py-2 rounded bg-blue-600 text-white" onClick={() => onSave({})}>
            Save
          </button>
          <button className="flex-1 py-2 rounded bg-gray-200" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  ) : null;
}
