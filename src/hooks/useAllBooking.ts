import { gql, useQuery } from '@apollo/client';

const GET_ALL_BOOKINGS = gql`
  query GetAllBookings {
    allBooking {
      id
      customerName
      phoneNumber
      peopleCount
      reservationDate
      durationSlots
      startSlot {
        startTime
      }
      bookingType
    }
  }
`;

export const useAllBookings = () => {
  return useQuery(GET_ALL_BOOKINGS);
};
