import { gql } from '@apollo/client';

export const GET_ORDERS = gql`
  query allOrders {
    allOrders {
      id
      status
      createdAt
      orderItems {
        id
        quantity
        price
        notes
        dish {
          id
          name
        }
      }
      total
      bookingId
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($bookingId: Int!, $orderItems: [OrderItemInput!]!) {
    createOrder(bookingId: $bookingId, orderItems: $orderItems) {
      id
      status
      total
      createdAt
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
