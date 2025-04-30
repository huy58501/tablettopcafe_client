import { gql } from '@apollo/client';

export const GET_ALL_BOOKINGS = gql`
  query GetAllBookings {
    allBooking {
      id
      customerName
      phoneNumber
      customerEmail
      customerNote
      status
      reservationDate
      durationSlots
      peopleCount
      bookingType
      createdAt
      table {
        id
        number
        room
      }
      startSlot {
        id
        startTime
        endTime
      }
      order {
        id
        status
        total
      }
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

export const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus($id: Int!, $status: String!) {
    updateBookingStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const DELETE_BOOKING = gql`
  mutation DeleteBooking($id: Int!) {
    deleteBooking(id: $id) {
      id
    }
  }
`;

export const UPDATE_BOOKING_TABLE_CHANGE = gql`
  mutation UpdateBookingTableChange($id: Int!, $tableId: Int!) {
    updateBookingTableChange(id: $id, tableId: $tableId) {
      id
      table {
        id
        number
        status
        room
      }
      order {
        id
        total
        status
        orderItems {
          id
          quantity
          price
          dish {
            id
            name
            price
          }
        }
      }
    }
  }
`;
