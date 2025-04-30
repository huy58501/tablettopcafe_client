import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_BOOKINGS } from '@/services/bookingServices';
import { Booking } from '@/types/table';

export const useBookingNotifications = () => {
  const [upcomingBookingNotification, setUpcomingBookingNotification] = useState<Booking | null>(
    null
  );
  const [notifiedBookings, setNotifiedBookings] = useState<Set<string>>(new Set());

  const { data } = useQuery(GET_ALL_BOOKINGS, {
    pollInterval: 300000, // Refetch every 5 minutes
  });

  const handleUpcomingBooking = useCallback(
    (booking: Booking) => {
      // Only show notification if we haven't notified about this booking before
      if (!notifiedBookings.has(booking.id.toString())) {
        setUpcomingBookingNotification(booking);

        // Add this booking to notified set
        setNotifiedBookings(prev => new Set([...prev, booking.id.toString()]));

        // Play notification sound using Web Audio API
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.type = 'sine';
          oscillator.frequency.value = 800; // gentle frequency
          gainNode.gain.value = 0.1; // low volume

          oscillator.start();
          setTimeout(() => oscillator.stop(), 200); // short beep
        } catch (e) {
          console.log('Audio play failed:', e);
        }

        // Clear notification after 10 seconds but keep the ID in notifiedBookings
        setTimeout(() => {
          setUpcomingBookingNotification(null);
        }, 10000);
      }
    },
    [notifiedBookings]
  );

  // Check for upcoming bookings
  const checkUpcomingBookings = useCallback(() => {
    if (!data?.allBooking) return;

    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);

    // Get today's date in local YYYY-MM-DD format
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Filter today's online bookings
    const todayBookings = data.allBooking.filter((booking: Booking) => {
      if (booking.bookingType !== 'online') return false;

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

    todayBookings.forEach((booking: Booking) => {
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
        handleUpcomingBooking(booking);
      }
    });
  }, [data, handleUpcomingBooking]);

  // Run check on bookings change and every 5 minutes
  useEffect(() => {
    checkUpcomingBookings();

    // Set up interval for checking
    const interval = setInterval(checkUpcomingBookings, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [checkUpcomingBookings]);

  // Clear notified bookings at midnight
  useEffect(() => {
    const clearNotifiedBookings = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setNotifiedBookings(new Set());
      }
    };

    const interval = setInterval(clearNotifiedBookings, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return {
    upcomingBookingNotification,
    setUpcomingBookingNotification,
  };
};
