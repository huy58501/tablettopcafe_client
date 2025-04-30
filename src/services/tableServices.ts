import { gql } from '@apollo/client';

export const GET_ALL_TABLES = gql`
  query GetAllTables {
    allTable {
      id
      number
      capacity
      status
      room
      bookings {
        id
        customerName
        status
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
      }
    }
  }
`;

export const UPDATE_TABLE_STATUS = gql`
  mutation UpdateTableStatus($tableId: Int!, $status: String!) {
    updateTableStatus(tableId: $tableId, status: $status) {
      id
      status
    }
  }
`;
