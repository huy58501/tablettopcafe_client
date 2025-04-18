import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_TABLES, UPDATE_TABLE_STATUS } from '../services/tableServices';

export const useTables = () => {
  return useQuery(GET_ALL_TABLES);
};

export const useUpdateTableStatus = () => {
  return useMutation(UPDATE_TABLE_STATUS);
};
