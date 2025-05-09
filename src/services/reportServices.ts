import { gql } from '@apollo/client';

export const CREATE_REPORT = gql`
  mutation CreateReport(
    $userId: String!
    $date: DateTime!
    $moneyIn: Int!
    $moneyOut: Int
    $totalOrder: Int!
    $totalSale: Int!
    $note: String
  ) {
    createReport(
      userId: $userId
      date: $date
      moneyIn: $moneyIn
      moneyOut: $moneyOut
      totalOrder: $totalOrder
      totalSale: $totalSale
      note: $note
    ) {
      id
      userId
      date
      moneyIn
      moneyOut
      totalOrder
      totalSale
      note
    }
  }
`;

export const GET_REPORT = gql`
  query GetReport {
    allReport {
      id
      userId
      date
      moneyIn
      moneyOut
      totalOrder
      totalSale
      note
    }
  }
`;

export const GET_ALL_USERS_WITH_EMPLOYMENT = gql`
  query GetAllUsersWithEmployment {
    allUser {
      id
      username
      role
      created_at
      employee {
        id
        fullName
        position
        phoneNumber
        email
        hourlyRate
        clockIns {
          id
          clockIn
          clockOut
          status
          notes
          moneyIn
          moneyOut
        }
        salaries {
          id
          periodStart
          periodEnd
          totalHours
          totalPay
          paid
        }
      }
    }
  }
`;

export const GET_ALL_EMPLOYEES = gql`
  query GetAllEmployees {
    allEmployee {
      id
      fullName
      position
      phoneNumber
      email
      hourlyRate @include(if: false)
      user {
        id
        username
        role
      }
      clockIns @include(if: false) {
        id
        clockIn
        clockOut
        status
        notes
        moneyIn
        moneyOut
      }
      salaries @include(if: false) {
        id
        periodStart
        periodEnd
        totalHours
        totalPay
        paid
      }
    }
  }
`;
