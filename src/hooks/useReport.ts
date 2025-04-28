import { useMutation, useQuery } from '@apollo/client';
import { CREATE_REPORT, GET_REPORT } from '../services/reportServices';
import { useState } from 'react';

export const useReport = () => {
  const [createReport, { loading, error }] = useMutation(CREATE_REPORT);
  const { data: reportData } = useQuery(GET_REPORT);

  const handleCreateReport = async (reportData: any, userId: string) => {
    const { moneyIn, moneyOut, totalOrders, totalSales, expenses } = reportData;
    const note = expenses.map((expense: any) => expense.name).join(', ');
    const totalOrder = totalOrders;
    const totalSale = totalSales;
    const date = new Date().toISOString();
    try {
      await createReport({
        variables: { userId, date, moneyIn, moneyOut, totalOrder, totalSale, note },
      });
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };
  return { loading, error, handleCreateReport, reportData };
};
