import { useMutation } from '@apollo/client';
import { CREATE_CLOCK_IN, UPDATE_CLOCK_IN } from '../services/clockInServices';

export const useCreateClockIn = () => {
  const [createClockIn, { loading, error }] = useMutation(CREATE_CLOCK_IN);
  const [updateClockIn, { loading: updateLoading, error: updateError }] =
    useMutation(UPDATE_CLOCK_IN);

  const handleCreateClockIn = async (userId: string) => {
    try {
      await createClockIn({ variables: { userId, moneyIn: 0, moneyOut: 0 } });
    } catch (error) {
      console.error('Error creating clock in:', error);
      throw error;
    }
  };

  const handleUpdateClockIn = async (
    userId: string,
    notes: string,
    status: string,
    moneyIn: number,
    moneyOut: number
  ) => {
    const clockOut = new Date().toISOString();
    try {
      await updateClockIn({
        variables: {
          userId,
          clockOut,
          notes,
          status,
          moneyIn,
          moneyOut,
        },
      });
    } catch (error) {
      console.error('Error updating clock in:', error);
      throw error;
    }
  };

  return { loading, error, handleCreateClockIn, handleUpdateClockIn, updateLoading, updateError };
};
