import { gql } from '@apollo/client';

export const GET_ALL_BOOKINGS = gql`
  query GetAllBookings {
    allBooking {
      id
      customerName
      phoneNumber
      bookingType
      peopleCount
      reservationDate
      durationSlots
      startSlot {
        startTime
      }
      customerEmail
      customerNote
      status
    }
  }
`;

export const CREATE_BOOKING = gql`
  mutation CreateBooking(
    $customerName: String!
    $phoneNumber: String!
    $reservationDate: String!
    $startSlotId: Int!
    $durationSlots: Int!
    $peopleCount: Int!
    $customerEmail: String
    $customerNote: String
    $bookingType: String!
    $tableId: Int
  ) {
    createBooking(
      customerName: $customerName
      phoneNumber: $phoneNumber
      reservationDate: $reservationDate
      startSlotId: $startSlotId
      durationSlots: $durationSlots
      peopleCount: $peopleCount
      customerEmail: $customerEmail
      customerNote: $customerNote
      bookingType: $bookingType
      tableId: $tableId
    ) {
      id
      table {
        number
      }
    }
  }
`;

export const UPDATE_BOOKING = gql`
  mutation UpdateBooking(
    $id: Int!
    $customerName: String
    $phoneNumber: String
    $customerEmail: String
    $customerNote: String
    $reservationDate: String
    $startSlotId: Int
    $durationSlots: Int
    $peopleCount: Int
    $bookingType: String
    $status: String
  ) {
    updateBooking(
      id: $id
      customerName: $customerName
      phoneNumber: $phoneNumber
      customerEmail: $customerEmail
      customerNote: $customerNote
      reservationDate: $reservationDate
      startSlotId: $startSlotId
      durationSlots: $durationSlots
      peopleCount: $peopleCount
      bookingType: $bookingType
      status: $status
    ) {
      id
      table {
        number
      }
    }
  }
`;
