import { useQuery, useMutation } from '@apollo/client';
import { ALL_DISHES, CREATE_DISH, UPDATE_DISH, DELETE_DISH } from '../services/dishServices';

export const useDishes = () => {
  const {
    data: dishesData,
    loading: dishesLoading,
    error: dishesError,
    refetch,
  } = useQuery(ALL_DISHES);
  const [createDish, { loading: createDishLoading, error: createDishError }] =
    useMutation(CREATE_DISH);
  const [updateDish, { loading: updateDishLoading, error: updateDishError }] =
    useMutation(UPDATE_DISH);
  const [deleteDish, { loading: deleteDishLoading, error: deleteDishError }] =
    useMutation(DELETE_DISH);

  const handleCreateDish = async (name: string, price: number, category: string) => {
    try {
      await createDish({ variables: { name, price, category } });
    } catch (error) {
      console.error('Error creating dish:', error);
    }
  };

  const handleUpdateDish = async (id: string, name: string, price: number, category: string) => {
    try {
      await updateDish({ variables: { id, name, price, category } });
    } catch (error) {
      console.error('Error updating dish:', error);
    }
  };

  const handleDeleteDish = async (id: string) => {
    try {
      await deleteDish({ variables: { id } });
    } catch (error) {
      console.error('Error deleting dish:', error);
    }
  };

  return {
    dishesData,
    dishesLoading,
    dishesError,
    createDish,
    updateDish,
    deleteDish,
    createDishLoading,
    createDishError,
    updateDishLoading,
    updateDishError,
    deleteDishLoading,
    deleteDishError,
    refetch,
  };
};
