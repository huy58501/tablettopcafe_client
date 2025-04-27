import { useState } from 'react';
import { useDishes } from '@/hooks/useDishes';
import { Dish } from '@/types/dish';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import DishFormModal from './Modal/DishFormModal';
import ConfirmDialog from './Modal/ConfirmDialog';

export default function Dishes() {
  const { dishesData, dishesLoading, dishesError } = useDishes();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingDish, setDeletingDish] = useState<Dish | null>(null);

  // Group dishes by category
  const dishesByCategory: { [category: string]: Dish[] } = {};
  if (dishesData && dishesData.allDishes) {
    dishesData.allDishes.forEach((dish: Dish) => {
      const cat = dish.category || 'Uncategorized';
      if (!dishesByCategory[cat]) dishesByCategory[cat] = [];
      dishesByCategory[cat].push(dish);
    });
  }

  // Handlers for CRUD
  const handleAdd = () => {
    setEditingDish(null);
    setModalOpen(true);
  };
  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setModalOpen(true);
  };
  const handleDelete = (dish: Dish) => {
    setDeletingDish(dish);
    setConfirmOpen(true);
  };
  const handleSave = (dish: Partial<Dish>) => {
    // Call your API to add or update
    setModalOpen(false);
  };
  const handleConfirmDelete = () => {
    // Call your API to delete
    setConfirmOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-2 sm:px-4 pt-[60px]">
      {dishesLoading && <div className="text-center text-gray-500">Loading...</div>}
      {dishesError && <div className="text-center text-red-500">Error loading dishes.</div>}

      {/* Add Dish Floating Button */}
      <button
        className="fixed bottom-6 right-6 z-40 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition cursor-pointer"
        onClick={handleAdd}
        aria-label="Add Dish"
      >
        <FiPlus className="w-6 h-6" />
      </button>

      {Object.keys(dishesByCategory).map(category => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">{category}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {dishesByCategory[category].map((dish: Dish) => (
              <div
                key={dish.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow p-4 flex flex-col items-center relative"
              >
                {/* Edit/Delete Buttons */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-600"
                    onClick={() => handleEdit(dish)}
                    aria-label="Edit"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-full bg-gray-100 hover:bg-red-100 text-red-600"
                    onClick={() => handleDelete(dish)}
                    aria-label="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                {/* Optional: Dish image or icon */}
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl text-gray-300">🍽️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 text-center">{dish.name}</h3>
                <p className="text-blue-600 font-bold text-lg mt-2">
                  {dish.price.toLocaleString()} ₫
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modals */}
      <DishFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingDish}
      />
      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
        message={`Delete dish "${deletingDish?.name}"?`}
      />
    </div>
  );
}
