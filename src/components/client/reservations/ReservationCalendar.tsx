import React, { useState } from 'react';
import { Booking } from '../../../types/reservation';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  startOfDay,
} from 'date-fns';

interface ReservationCalendarProps {
  reservations: Booking[];
  onSelectReservation: (reservation: Booking) => void;
  viewMode: 'day' | 'week' | 'month';
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
  reservations,
  onSelectReservation,
  viewMode,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // Get the date range based on the view mode
  const getDateRange = () => {
    switch (viewMode) {
      case 'day':
        return {
          start: startOfDay(selectedDate),
          end: startOfDay(selectedDate),
        };
      case 'week':
        return {
          start: startOfWeek(selectedDate, { weekStartsOn: 1 }), // Start from Monday
          end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
        };
      case 'month':
        return {
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate),
        };
      default:
        return {
          start: startOfDay(selectedDate),
          end: startOfDay(selectedDate),
        };
    }
  };

  const dateRange = getDateRange();
  const days = eachDayOfInterval(dateRange);

  // Group reservations by date
  const reservationsByDate = days.reduce(
    (acc: Record<string, Booking[]>, day: Date) => {
      const dateKey = format(startOfDay(day), 'yyyy-MM-dd');
      acc[dateKey] = reservations.filter(reservation => {
        // Convert timestamp string to Date object
        const reservationDay = startOfDay(new Date(parseInt(reservation.reservationDate)));
        return isSameDay(reservationDay, day);
      });
      return acc;
    },
    {} as Record<string, Booking[]>
  );

  // Navigation functions
  const goToPrevious = () => {
    switch (viewMode) {
      case 'day':
        setSelectedDate(prev => new Date(prev.setDate(prev.getDate() - 1)));
        break;
      case 'week':
        setSelectedDate(prev => new Date(prev.setDate(prev.getDate() - 7)));
        break;
      case 'month':
        setSelectedDate(
          prev => new Date(prev.setFullYear(prev.getFullYear(), prev.getMonth() - 1))
        );
        break;
    }
  };

  const goToNext = () => {
    switch (viewMode) {
      case 'day':
        setSelectedDate(prev => new Date(prev.setDate(prev.getDate() + 1)));
        break;
      case 'week':
        setSelectedDate(prev => new Date(prev.setDate(prev.getDate() + 7)));
        break;
      case 'month':
        setSelectedDate(
          prev => new Date(prev.setFullYear(prev.getFullYear(), prev.getMonth() + 1))
        );
        break;
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleDateExpansion = (dateKey: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey);
      } else {
        newSet.add(dateKey);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPrevious}
              className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <h2 className="text-xl font-bold">
              {viewMode === 'day' && format(selectedDate, 'MMMM d, yyyy')}
              {viewMode === 'week' &&
                `${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`}
              {viewMode === 'month' && format(selectedDate, 'MMMM yyyy')}
            </h2>

            <button
              onClick={goToNext}
              className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <button
            onClick={goToToday}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Today
          </button>
        </div>
      </div>

      <div className="p-4">
        {viewMode === 'day' ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>

            {reservationsByDate[format(startOfDay(selectedDate), 'yyyy-MM-dd')]?.length ? (
              <div className="space-y-2">
                {reservationsByDate[format(startOfDay(selectedDate), 'yyyy-MM-dd')].map(
                  (reservation: Booking) => (
                    <div
                      key={reservation.id}
                      onClick={() => onSelectReservation(reservation)}
                      className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{reservation.customerName}</div>
                          <div className="text-sm text-gray-500">
                            {reservation.startSlot.startTime}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reservation.peopleCount} guests
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}
                        >
                          {reservation.status}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No reservations for this day</div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((day: Date) => {
              const dateKey = format(startOfDay(day), 'yyyy-MM-dd');
              const dayReservations = reservationsByDate[dateKey] || [];
              const isToday = isSameDay(day, new Date());
              const isExpanded = expandedDates.has(dateKey);
              const displayReservations = isExpanded
                ? dayReservations
                : dayReservations.slice(0, 3);

              return (
                <div
                  key={dateKey}
                  className={`min-h-[100px] p-1 border ${isToday ? 'bg-blue-50' : 'bg-white'}`}
                >
                  <div
                    className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}
                  >
                    {format(day, 'd')}
                  </div>

                  {dayReservations.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {displayReservations.map((reservation: Booking) => (
                        <div
                          key={reservation.id}
                          onClick={() => onSelectReservation(reservation)}
                          className="text-xs p-1 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer truncate"
                          title={`${reservation.customerName} - ${reservation.startSlot.startTime}`}
                        >
                          {reservation.customerName} - {reservation.startSlot.startTime}
                        </div>
                      ))}

                      {!isExpanded && dayReservations.length > 3 && (
                        <div
                          className="text-xs text-gray-500 text-center cursor-pointer hover:text-gray-700"
                          onClick={e => {
                            e.stopPropagation();
                            toggleDateExpansion(dateKey);
                          }}
                        >
                          +{dayReservations.length - 3} more
                        </div>
                      )}
                      {isExpanded && dayReservations.length > 3 && (
                        <div
                          className="text-xs text-gray-500 text-center cursor-pointer hover:text-gray-700"
                          onClick={e => {
                            e.stopPropagation();
                            toggleDateExpansion(dateKey);
                          }}
                        >
                          Show less
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationCalendar;
