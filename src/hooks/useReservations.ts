import { useState, useEffect } from 'react';
import { Table, Booking } from '../types/reservation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_BOOKINGS, CREATE_BOOKING } from '@/services/bookingServices';

export const useReservations = () => {
  const [reservations, setReservations] = useState<Booking[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const {
    data: bookings,
    loading: bookingLoading,
    error: bookingError,
    refetch,
  } = useQuery(GET_ALL_BOOKINGS);
  const [createBooking, { loading: mutationLoading, error: mutationError }] =
    useMutation(CREATE_BOOKING);

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

  // For debugging
  useEffect(() => {
    console.log('reservations hook data', reservations);
  }, [reservations]);

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
      console.log('Booking created:', result);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Display LoadingModal when data is being processed
  // if (loading || mutationLoading) {
  //   return {
  //     reservations: [],
  //     tables: [],
  //     loading: true,
  //     error: null,
  //     handleSubmit,
  //     isLoading: true,
  //     refetch,
  //   };
  // }

  return {
    reservations,
    tables,
    loading,
    error,
    handleSubmit,
    isLoading: false,
    refetch,
  };
};
