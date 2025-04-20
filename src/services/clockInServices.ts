import { gql } from '@apollo/client';

export const GET_ALL_CLOCK_INS = gql`
  query GetAllClockIns {
    allClockIns {
      id
      userId
      notes
      status
      clockIn
      clockOut
    }
  }
`;

export const CREATE_CLOCK_IN = gql`
  mutation CreateClockIn($userId: String!) {
    createClockIn(userId: $userId) {
      userId
    }
  }
`;

export const UPDATE_CLOCK_IN = gql`
  mutation UpdateClockIn($userId: String!, $notes: String!, $status: String!) {
    updateClockIn(userId: $userId, notes: $notes, status: $status) {
      userId
      notes
      status
    }
  }
`;
