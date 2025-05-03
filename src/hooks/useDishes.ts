import { useQuery, useMutation } from '@apollo/client';
import {
  ALL_ACTIVE_DISHES,
  CREATE_DISH,
  UPDATE_DISH,
  DELETE_DISH,
  ALL_DISHES,
} from '../services/dishServices';

export const useDishes = () => {
  const {
    data: dishesData,
    loading: dishesLoading,
    error: dishesError,
    refetch,
  } = useQuery(ALL_ACTIVE_DISHES);
  const {
    data: allDishes,
    loading: allDishesLoading,
    error: allDishesError,
    refetch: refetchAllDishes,
  } = useQuery(ALL_DISHES);
  const [createDish, { loading: createDishLoading, error: createDishError }] =
    useMutation(CREATE_DISH);
  const [updateDish, { loading: updateDishLoading, error: updateDishError }] =
    useMutation(UPDATE_DISH);
  const [deleteDish, { loading: deleteDishLoading, error: deleteDishError }] =
    useMutation(DELETE_DISH);

  return {
    dishesData,
    dishesLoading,
    dishesError,
    allDishes,
    allDishesLoading,
    allDishesError,
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
    refetchAllDishes,
  };
};
