// client/src/components/client/dishes/ConfirmDialog.tsx
import React from 'react';

export default function ConfirmDialog({ open, onConfirm, onCancel, message }: any) {
  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 w-full max-w-xs mx-2 text-center">
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
  ) : null;
}
