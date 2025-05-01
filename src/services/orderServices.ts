import { gql } from '@apollo/client';

export const GET_ORDERS = gql`
  query GetOrders {
    allOrders {
      id
      bookingId
      status
      total
      payment
      reference
      createdBy
      createdAt
      closedAt
      orderItems {
        id
        quantity
        price
        notes
        dish {
          id
          name
          price
        }
      }
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($bookingId: Int!, $orderItems: [OrderItemInput!]!, $createdBy: String!) {
    createOrder(bookingId: $bookingId, orderItems: $orderItems, createdBy: $createdBy) {
      id
      status
      total
      createdAt
      createdBy
      orderItems {
        id
        quantity
        price
        notes
        dish {
          id
          name
          price
        }
      }
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation updateOrderStatus($orderId: Int!, $status: String!) {
    updateOrderStatus(orderId: $orderId, status: $status) {
      id
      status
    }
  }
`;

export const UPDATE_ORDER_PAYMENT = gql`
  mutation updateOrderPayment($orderId: Int!, $payment: String!, $reference: String!) {
    updateOrderPayment(orderId: $orderId, payment: $payment, reference: $reference) {
      id
      payment
      reference
    }
  }
`;

export const UPDATE_ORDER = gql`
  mutation updateOrder($id: Int!, $orderItems: [OrderItemInput!]!) {
    updateOrder(id: $id, orderItems: $orderItems) {
      id
      orderItems {
        id
        quantity
        price
        notes
        dish {
          id
          name
          price
        }
      }
    }
  }
`;
