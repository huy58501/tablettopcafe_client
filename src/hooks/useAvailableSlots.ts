import { gql, useQuery } from '@apollo/client';

const GET_AVAILABLE_SLOTS = gql`
  query GetAvailableSlots($date: String!, $peopleCount: Int!) {
    availableTimeSlots(date: $date, peopleCount: $peopleCount) {
      id
      startTime
      endTime
    }
  }
`;

export const GET_ALL_SLOTS = gql`
  query GetAllTimeSlots {
    allTimeSlots {
      id
      startTime
    }
  }
`;

export const useAvailableSlots = (date: string, peopleCount: number) => {
  return useQuery(GET_AVAILABLE_SLOTS, {
    variables: { date, peopleCount },
    skip: !date || !peopleCount,
  });
};
