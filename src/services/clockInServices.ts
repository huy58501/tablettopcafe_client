import { gql } from '@apollo/client';

export const GET_ALL_CLOCK_INS = gql`
  query GetAllClockIns {
    allClockIns {
      id
      userId
      clockIn
      clockOut
      notes
      status
      moneyIn
      moneyOut
      user {
        id
        username
      }
    }
  }
`;

export const CREATE_CLOCK_IN = gql`
  mutation CreateClockIn($userId: String!, $moneyIn: Int!, $moneyOut: Int!) {
    createClockIn(userId: $userId, moneyIn: $moneyIn, moneyOut: $moneyOut) {
      id
      userId
      clockIn
      moneyIn
      moneyOut
    }
  }
`;

export const UPDATE_CLOCK_IN = gql`
  mutation UpdateClockIn(
    $userId: String!
    $clockOut: DateTime!
    $notes: String
    $status: String!
    $moneyIn: Int!
    $moneyOut: Int!
  ) {
    updateClockIn(
      userId: $userId
      clockOut: $clockOut
      notes: $notes
      status: $status
      moneyIn: $moneyIn
      moneyOut: $moneyOut
    ) {
      userId
      notes
      status
      clockOut
      moneyIn
      moneyOut
    }
  }
`;
