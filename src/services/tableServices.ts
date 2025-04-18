import { gql } from '@apollo/client';

export const GET_ALL_TABLES = gql`
  query GetAllTables {
    allTable {
      id
      number
      capacity
      status
      room
      createdAt
      bookings {
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
        order {
          id
          status
          total
          createdAt
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
        customerEmail
        customerNote
        status
      }
    }
  }
`;

// export const CREATE_ORDER = gql`
//   mutation CreateOrder($bookingId: Int!, $orderItems: [OrderItemInput!]!) {
//     createOrder(bookingId: $bookingId, orderItems: $orderItems) {
//       id
//       status
//       total
//       createdAt
//       orderItems {
//         id
//         quantity
//         price
//         dish {
//           id
//           name
//           price
//         }
//       }
//     }
//   }
// `;

export const UPDATE_TABLE_STATUS = gql`
  mutation UpdateTableStatus($tableId: Int!, $status: String!) {
    updateTableStatus(tableId: $tableId, status: $status) {
      id
      status
    }
  }
`;
