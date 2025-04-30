import { useState, useEffect } from 'react';
import { Table, Booking, ReservationStatus } from '../types/reservation';
import { useMutation, useQuery } from '@apollo/client';
import {
  GET_ALL_BOOKINGS,
  CREATE_BOOKING,
  UPDATE_BOOKING_STATUS,
  DELETE_BOOKING,
  UPDATE_BOOKING,
} from '@/services/bookingServices';

export const useReservations = () => {
  const [reservations, setReservations] = useState<Booking[]>([]);
  const [tables, _setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const {
    data: bookings,
    loading: bookingLoading,
    error: bookingError,
    refetch,
  } = useQuery(GET_ALL_BOOKINGS);
  const [createBooking] = useMutation(CREATE_BOOKING);
  const [updateBookingStatus, { loading: updateLoading, error: updateError }] =
    useMutation(UPDATE_BOOKING_STATUS);
  const [deleteBooking] = useMutation(DELETE_BOOKING);
  const [updateBooking] = useMutation(UPDATE_BOOKING);

  useEffect(() => {
    if (bookings) {
      const newBooking = bookings.allBooking.map((booking: Booking) => ({
        ...booking,
        startSlot: booking.startSlot.startTime,
      }));
      setReservations(newBooking);
    }
    setLoading(bookingLoading);
    // Update error state if there's an error
    if (bookingError) {
      setError(bookingError.message);
    }
  }, [bookings]);

  const handleSubmit = async (formData: Booking) => {
    try {
      const result = await createBooking({
        variables: {
          customerName: formData.customerName!,
          phoneNumber: formData.phoneNumber!,
          reservationDate: formData.reservationDate!,
          startSlotId: formData.startSlotId!,
          durationSlots: 6,
          peopleCount: Number(formData.peopleCount!),
          bookingType: formData.bookingType || 'online',
          customerEmail: formData.customerEmail || '',
          customerNote: formData.customerNote || '',
          tableId: formData.tableId || 0,
        },
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleUpdate = async (id: string, formData: Booking) => {
    try {
      await updateBooking({
        variables: {
          bookingId: parseInt(id),
          ...formData,
        },
      });
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: ReservationStatus) => {
    try {
      await updateBookingStatus({ variables: { id: parseInt(id), status: status } });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleReservationDelete = async (id: string) => {
    try {
      await deleteBooking({ variables: { id: parseInt(id) } });
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  return {
    reservations,
    tables,
    loading,
    error,
    handleSubmit,
    isLoading: false,
    refetch,
    handleUpdateStatus,
    handleReservationDelete,
    handleUpdate,
    updateLoading,
    updateError,
  };
};
