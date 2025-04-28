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

export const CREATE_DISH = gql`
  mutation CreateDish($name: String!, $price: Float!, $category: String!) {
    createDish(name: $name, price: $price, category: $category) {
      id
      name
      price
      category
    }
  }
`;

export const UPDATE_DISH = gql`
  mutation UpdateDish($id: Int!, $name: String, $price: Float, $category: String) {
    updateDish(id: $id, name: $name, price: $price, category: $category) {
      id
      name
      price
      category
    }
  }
`;

export const DELETE_DISH = gql`
  mutation DeleteDish($id: Int!) {
    deleteDish(id: $id)
  }
`;
