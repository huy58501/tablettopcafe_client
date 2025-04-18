import { gql } from '@apollo/client';

export const ALL_DISHES = gql`
  query AllDishes {
    allDishes {
      id
      name
      price
      category
      isActive
    }
  }
`;
