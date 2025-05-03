import { useState, useEffect } from 'react';
import { useDishes } from '@/hooks/useDishes';
import { Dish } from '@/types/dish';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import DishFormModal from './Modal/DishFormModal';
import ConfirmDialog from './Modal/ConfirmDialog';
import SpinningModal from '@/components/UI/SpinningModal';
import { UPDATE_DISH_STATUS, ALL_DISHES } from '@/services/dishServices';
import { useMutation, useQuery } from '@apollo/client';

export default function Dishes() {
  const {
    allDishes,
    allDishesLoading,
    allDishesError,
    refetchAllDishes,
    createDish,
    updateDish,
    deleteDish,
  } = useDishes();
  const [updateDishStatus, { loading: updateDishStatusLoading, error: updateDishStatusError }] =
    useMutation(UPDATE_DISH_STATUS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingDish, setDeletingDish] = useState<Dish | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Group dishes by category
  const dishesByCategory: { [category: string]: Dish[] } = {};
  if (allDishes && allDishes.allDishes) {
    // Sort dishes by id ascending
    const sortedDishes = [...allDishes.allDishes].sort(
      (a: Dish, b: Dish) => Number(a.id) - Number(b.id)
    );
    sortedDishes.forEach((dish: Dish) => {
      const cat = dish.category || 'Uncategorized';
      if (!dishesByCategory[cat]) dishesByCategory[cat] = [];
      dishesByCategory[cat].push(dish);
    });
  }

  // Calculate totals for summary
  const allDishesFlat = allDishes?.allDishes || [];
  const totalDishes = allDishesFlat.length;
  const activeDishes = allDishesFlat.filter((d: Dish) => d.isActive);
  const inactiveDishes = allDishesFlat.filter((d: Dish) => !d.isActive);
  const totalActive = activeDishes.length;
  const totalInactive = inactiveDishes.length;
  const sumActive = activeDishes.reduce((sum: number, d: Dish) => sum + (d.price || 0), 0);
  const sumInactive = inactiveDishes.reduce((sum: number, d: Dish) => sum + (d.price || 0), 0);
  const sumAll = allDishesFlat.reduce((sum: number, d: Dish) => sum + (d.price || 0), 0);

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
  const handleSave = async (dish: Partial<Dish>) => {
    setActionLoading(true);
    setActionError(null);
    try {
      if (editingDish) {
        // Update
        await updateDish({
          variables: {
            id: Number(editingDish.id),
            name: dish.name,
            price: dish.price,
            category: dish.category,
          },
        });
      } else {
        // Create
        await createDish({
          variables: { name: dish.name, price: dish.price, category: dish.category },
        });
      }
      setModalOpen(false);
      await refetchAllDishes();
    } catch (err) {
      setActionError('Failed to save dish.');
    } finally {
      setActionLoading(false);
    }
  };
  const handleConfirmDelete = async () => {
    if (!deletingDish) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await deleteDish({ variables: { id: Number(deletingDish.id) } });
      setConfirmOpen(false);
      await refetchAllDishes();
    } catch (err) {
      setActionError('Failed to delete dish.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-2 sm:px-4">
      <SpinningModal isOpen={allDishesLoading} message="Loading..." />
      <SpinningModal isOpen={updateDishStatusLoading} message="Updating status..." />
      {allDishesError && <div className="text-center text-red-500">Error loading dishes.</div>}
      {actionError && <div className="text-center text-red-500">{actionError}</div>}

      {/* Summary Section */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-200">
          <span className="text-lg font-semibold text-gray-700">Total Dishes</span>
          <span className="text-2xl font-bold text-blue-700 mt-1">{totalDishes}</span>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-green-200">
          <span className="text-lg font-semibold text-green-700">Active</span>
          <span className="text-2xl font-bold text-green-600 mt-1">{totalActive}</span>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-300">
          <span className="text-lg font-semibold text-gray-500">Inactive</span>
          <span className="text-2xl font-bold text-gray-400 mt-1">{totalInactive}</span>
        </div>
      </div>

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
                    className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-600 cursor-pointer"
                    onClick={() => handleEdit(dish)}
                    aria-label="Edit"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-full bg-gray-100 hover:bg-red-100 text-red-600 cursor-pointer"
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
                {/* Status display */}
                <span
                  className={`mt-2 px-2 py-1 rounded text-xs font-bold ${dish.isActive ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-400 border border-gray-300'}`}
                >
                  {dish.isActive ? 'Active' : 'Inactive'}
                </span>
                {/* Toggle status button */}
                <button
                  className={`mt-3 px-4 py-2 rounded-lg text-sm font-semibold focus:outline-none transition-all duration-150 shadow-sm ${
                    dish.isActive
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300'
                      : 'bg-green-500 text-white hover:bg-green-600 border border-green-600'
                  }`}
                  onClick={async () => {
                    setActionLoading(true);
                    setActionError(null);
                    try {
                      await updateDishStatus({
                        variables: {
                          id: Number(dish.id),
                          isActive: !dish.isActive,
                        },
                      });
                      await refetchAllDishes();
                    } catch (err) {
                      setActionError('Failed to update status.');
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading}
                >
                  {dish.isActive ? 'Set Inactive' : 'Set Active'}
                </button>
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
