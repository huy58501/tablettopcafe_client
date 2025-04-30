import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_TABLES, UPDATE_TABLE_STATUS } from '../services/tableServices';
import { UPDATE_BOOKING_TABLE_CHANGE } from '../services/bookingServices';

export const useTables = () => {
  const {
    data: tablesData,
    loading: tablesLoading,
    refetch: refetchTables,
  } = useQuery(GET_ALL_TABLES);
  const [updateTableStatus, { loading: updateTableStatusLoading, error: updateTableStatusError }] =
    useMutation(UPDATE_TABLE_STATUS);
  const [updateBookingTableChange] = useMutation(UPDATE_BOOKING_TABLE_CHANGE);

  const handleUpdateTableStatus = async (tableId: number, status: string) => {
    try {
      await updateTableStatus({ variables: { tableId, status } });
      await refetchTables();
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  };

  const handleUpdateBookingTableChange = async (id: number, tableId: number) => {
    try {
      await updateBookingTableChange({ variables: { id, tableId } });
      await refetchTables();
    } catch (error) {
      console.error('Error updating booking table change:', error);
    }
  };

  return {
    handleUpdateTableStatus,
    handleUpdateBookingTableChange,
    tablesData,
    tablesLoading,
    updateTableStatusLoading,
    updateTableStatusError,
    refetchTables,
  };
};
