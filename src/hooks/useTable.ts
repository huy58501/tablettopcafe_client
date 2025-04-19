import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_TABLES, UPDATE_TABLE_STATUS } from '../services/tableServices';

export const useTables = () => {
  const { data: tablesData, loading: tablesLoading } = useQuery(GET_ALL_TABLES);
  const [updateTableStatus, { loading: updateTableStatusLoading, error: updateTableStatusError }] =
    useMutation(UPDATE_TABLE_STATUS);

  const handleUpdateTableStatus = async (tableId: number, status: string) => {
    try {
      await updateTableStatus({ variables: { tableId, status } });
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  };

  return {
    handleUpdateTableStatus,
    tablesData,
    tablesLoading,
    updateTableStatusLoading,
    updateTableStatusError,
  };
};
