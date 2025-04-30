'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_BOOKINGS } from '@/services/bookingServices';
import { format, isThisWeek, isThisMonth } from 'date-fns';
import SpinningModal from '@/components/UI/SpinningModal';

interface Booking {
  id: string;
  customerName: string;
  phoneNumber: string;
  bookingType: string;
  peopleCount: number;
  reservationDate: string;
  startSlot: {
    startTime: string;
  };
  customerEmail: string | null;
  customerNote: string;
  status: string;
  tableId: number;
}

const IncomingBookings = () => {
  const { loading, error, data } = useQuery(GET_ALL_BOOKINGS, {
    pollInterval: 300000, // Refetch every 5 minutes
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [bookings, setBookings] = useState<{
    today: Booking[];
    week: Booking[];
    month: Booking[];
  }>({
    today: [],
    week: [],
    month: [],
  });

  useEffect(() => {
    if (data?.allBooking) {
      const onlineBookings = data.allBooking.filter(
        (booking: any) => booking.bookingType === 'online'
      );

      // Get today's date in local YYYY-MM-DD format
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      // Filter today's bookings
      const todayBookings = onlineBookings.filter((booking: any) => {
        // Convert timestamp to local date
        const timestamp = Number(booking.reservationDate);
        const bookingDate = new Date(timestamp);
        // Adjust for timezone offset
        const localBookingDate = new Date(
          bookingDate.getTime() + bookingDate.getTimezoneOffset() * 60000
        );
        const bookingDateStr = `${localBookingDate.getFullYear()}-${String(localBookingDate.getMonth() + 1).padStart(2, '0')}-${String(localBookingDate.getDate()).padStart(2, '0')}`;
        return bookingDateStr === todayStr;
      });

      setBookings({
        today: todayBookings,
        week: onlineBookings.filter((booking: any) => {
          const timestamp = Number(booking.reservationDate);
          const bookingDate = new Date(timestamp);
          const localBookingDate = new Date(
            bookingDate.getTime() + bookingDate.getTimezoneOffset() * 60000
          );
          return isThisWeek(localBookingDate);
        }),
        month: onlineBookings.filter((booking: any) => {
          const timestamp = Number(booking.reservationDate);
          const bookingDate = new Date(timestamp);
          const localBookingDate = new Date(
            bookingDate.getTime() + bookingDate.getTimezoneOffset() * 60000
          );
          return isThisMonth(localBookingDate);
        }),
      });
    }
  }, [data]);

  // Check for upcoming bookings
  const checkUpcomingBookings = useCallback(() => {
    if (!bookings.today.length) return;

    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);

    bookings.today.forEach(booking => {
      const timestamp = Number(booking.reservationDate);
      const bookingDate = new Date(timestamp);
      const localBookingDate = new Date(
        bookingDate.getTime() + bookingDate.getTimezoneOffset() * 60000
      );

      // Get booking time from startSlot.startTime (assuming format "HH:mm")
      const [hours, minutes] = booking.startSlot.startTime.split(':').map(Number);
      localBookingDate.setHours(hours, minutes);

      // Check if booking is within next 30 minutes
      if (localBookingDate > now && localBookingDate <= thirtyMinutesFromNow) {
        // This logic is now handled by the hook
      }
    });
  }, [bookings.today]);

  // Run check on bookings change and every 5 minutes
  useEffect(() => {
    checkUpcomingBookings();

    // Set up interval for checking
    const interval = setInterval(checkUpcomingBookings, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [checkUpcomingBookings]);

  if (loading) return <SpinningModal isOpen={true} message="Loading bookings..." />;
  if (error) return <div>Error loading bookings: {error.message}</div>;

  const displayBookings = bookings[selectedPeriod];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Online Bookings</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPeriod('today')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === 'today'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setSelectedPeriod('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === 'week'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === 'month'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                This Month
              </button>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Table & Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No online bookings found for this period
                    </td>
                  </tr>
                ) : (
                  displayBookings.map((booking: Booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">
                          {(() => {
                            const timestamp = Number(booking.reservationDate);
                            const bookingDate = new Date(timestamp);
                            const localBookingDate = new Date(
                              bookingDate.getTime() + bookingDate.getTimezoneOffset() * 60000
                            );
                            return format(localBookingDate, 'MMM dd, yyyy');
                          })()}
                        </div>
                        <div className="text-gray-500">{booking.startSlot.startTime}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{booking.phoneNumber}</div>
                        {booking.customerEmail && (
                          <div className="text-xs">{booking.customerEmail}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>Table {booking.tableId}</div>
                        <div className="text-gray-500">{booking.peopleCount} guests</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.customerNote || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingBookings;
