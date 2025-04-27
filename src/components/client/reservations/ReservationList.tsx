import React, { useState, useEffect } from 'react';
import { Booking, ReservationStatus } from '../../../types/reservation';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import ReservationForm from './modal/ReservationForm';
import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';

interface ReservationListProps {
  reservations: Booking[];
  onEdit: (reservation: Booking) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ReservationStatus) => void;
}

const ReservationList: React.FC<ReservationListProps> = ({
  reservations,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedReservation, setSelectedReservation] = useState<string | null>(null);
  const [bookingTypeFilter, setBookingTypeFilter] = useState<'all' | 'dine-in' | 'online'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('today');
  const [currentPage, setCurrentPage] = useState(1);
  const reservationsPerPage = 10;
  const [editingReservation, setEditingReservation] = useState<Booking | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Completed', label: 'Completed' },
  ];

  const dateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedReservation && !(event.target as Element).closest('.status-dropdown')) {
        setSelectedReservation(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedReservation]);

  // Filter reservations based on status, search term, and booking type
  const filteredReservations = reservations
    .filter(reservation => {
      const reservationStatus = reservation.status;
      const matchesStatus = statusFilter === 'all' || reservationStatus === statusFilter;

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        reservation.customerName.toLowerCase().includes(searchLower) ||
        reservation.phoneNumber.includes(searchTerm);

      const matchesBookingType =
        bookingTypeFilter === 'all' || reservation.bookingType === bookingTypeFilter;

      // Date filtering
      const reservationDate = new Date(Number(reservation.reservationDate));
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      let matchesDate = true;
      if (dateFilter !== 'all') {
        switch (dateFilter) {
          case 'today':
            matchesDate = reservationDate.toDateString() === today.toDateString();
            break;
          case 'week':
            matchesDate = reservationDate >= startOfWeek && reservationDate <= today;
            break;
          case 'month':
            matchesDate = reservationDate >= startOfMonth && reservationDate <= today;
            break;
        }
      }

      return matchesStatus && matchesSearch && matchesBookingType && matchesDate;
    })
    .sort((a, b) => {
      // Sort by timestamp (most recent first)
      const dateA = Number(a.reservationDate);
      const dateB = Number(b.reservationDate);

      if (dateB !== dateA) {
        return dateB - dateA; // Most recent date first
      }

      // If dates are equal, sort by startTime
      const timeA = typeof a.startSlot === 'object' ? a.startSlot.startTime : '00:00';
      const timeB = typeof b.startSlot === 'object' ? b.startSlot.startTime : '00:00';

      return timeB.localeCompare(timeA); // Latest time first
    });

  // Calculate total pages
  const totalPages = Math.ceil(filteredReservations.length / reservationsPerPage);

  // Get reservations for current page
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * reservationsPerPage,
    currentPage * reservationsPerPage
  );

  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string): React.ReactElement => {
    switch (status) {
      case 'Pending':
        return (
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'Confirmed':
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'Cancelled':
        return (
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case 'Completed':
        return (
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return <></>;
    }
  };

  // Format date from timestamp or string
  const formatDate = (dateValue: string | number) => {
    try {
      // Check if it's a timestamp (number)
      if (typeof dateValue === 'number' || !isNaN(Number(dateValue))) {
        // Create a date object from the timestamp
        const date = new Date(Number(dateValue));

        // Adjust for timezone offset to ensure the date is displayed correctly
        // This ensures the date shown matches what's in the database
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() + userTimezoneOffset);

        return format(adjustedDate, 'MMM d, yyyy');
      }
      // Otherwise try to parse as ISO string
      return format(parseISO(dateValue), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const handleTableReservationDelete = (reservationId: string) => {
    onDelete(reservationId);
  };

  const handleTableReservationStatusChange = (
    reservationId: string,
    newStatus: ReservationStatus
  ) => {
    onStatusChange(reservationId, newStatus);
    setSelectedReservation(null);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-visible" style={{ height: '100vh' }}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-bold">Reservations</h2>

          <div className="flex flex-col sm:flex-row gap-4 overflow-visible">
            <div className="relative">
              <input
                type="text"
                placeholder="Search reservations..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>

            {/* Status Filter - Headless UI Listbox */}
            <div className="w-full sm:w-auto">
              <Listbox value={statusFilter} onChange={setStatusFilter}>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <span className="block truncate">
                      {statusOptions.find(opt => opt.value === statusFilter)?.label}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-50 mt-1 max-h-60 max-w-100 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {statusOptions.map(option => (
                      <Listbox.Option
                        key={option.value}
                        value={option.value}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                            >
                              {option.label}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>

            {/* Date Filter - Headless UI Listbox */}
            <div className="w-full sm:w-auto">
              <Listbox value={dateFilter} onChange={setDateFilter}>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <span className="block truncate">
                      {dateOptions.find(opt => opt.value === dateFilter)?.label}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-50 mt-1 max-h-60 max-w-150 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {dateOptions.map(option => (
                      <Listbox.Option
                        key={option.value}
                        value={option.value}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                            >
                              {option.label}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="all"
                    checked={bookingTypeFilter === 'all'}
                    onChange={e =>
                      setBookingTypeFilter(e.target.value as 'all' | 'dine-in' | 'online')
                    }
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">All</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="dine-in"
                    checked={bookingTypeFilter === 'dine-in'}
                    onChange={e =>
                      setBookingTypeFilter(e.target.value as 'all' | 'dine-in' | 'online')
                    }
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Dine-in</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="online"
                    checked={bookingTypeFilter === 'online'}
                    onChange={e =>
                      setBookingTypeFilter(e.target.value as 'all' | 'dine-in' | 'online')
                    }
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Online</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filteredReservations.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No reservations found</div>
      ) : (
        <>
          {/* Mobile: Card layout */}
          <div className="sm:hidden p-2 space-y-4">
            {paginatedReservations.map((reservation: Booking) => (
              <div
                key={reservation.id}
                className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-base text-gray-900">
                    {reservation.customerName}
                  </div>
                  {/* Clickable status badge with Listbox */}
                  <Listbox
                    value={reservation.status}
                    onChange={newStatus =>
                      handleTableReservationStatusChange(
                        reservation.id.toString(),
                        newStatus as ReservationStatus
                      )
                    }
                  >
                    <div className="relative">
                      <Listbox.Button
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(reservation.status as string)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        {getStatusIcon(reservation.status as string)}
                        {reservation.status}
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-auto min-w-[140px] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {statusOptions
                          .filter(opt => opt.value !== 'all')
                          .map(option => (
                            <Listbox.Option
                              key={option.value}
                              value={option.value}
                              className={({ active }) =>
                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                }`
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                                  >
                                    {option.label}
                                  </span>
                                  {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  <span>{reservation.phoneNumber}</span>
                  <span>
                    • {formatDate(reservation.reservationDate)}{' '}
                    {typeof reservation.startSlot === 'object'
                      ? reservation.startSlot.startTime
                      : reservation.startSlot}
                  </span>
                  <span>• {reservation.peopleCount} guests</span>
                  <span>• {reservation.bookingType}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      setEditingReservation(reservation);
                      setShowEditForm(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium"
                    aria-label="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleTableReservationDelete(reservation.id.toString())}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium"
                    aria-label="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: Table layout */}
          <div
            className="hidden sm:block overflow-x-auto h-full"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedReservations.map((reservation: Booking) => (
                  <tr key={reservation.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {reservation.customerName}
                      </div>
                      <div className="text-xs text-gray-500">{reservation.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(reservation.reservationDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {typeof reservation.startSlot === 'object'
                          ? reservation.startSlot.startTime
                          : reservation.startSlot}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reservation.peopleCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Clickable status badge with Listbox for desktop */}
                      <Listbox
                        value={reservation.status}
                        onChange={newStatus =>
                          handleTableReservationStatusChange(
                            reservation.id.toString(),
                            newStatus as ReservationStatus
                          )
                        }
                      >
                        <div className="relative">
                          <Listbox.Button
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(reservation.status as string)} focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                          >
                            {getStatusIcon(reservation.status as string)}
                            {reservation.status}
                          </Listbox.Button>
                          <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-auto min-w-[140px] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {statusOptions
                              .filter(opt => opt.value !== 'all')
                              .map(option => (
                                <Listbox.Option
                                  key={option.value}
                                  value={option.value}
                                  className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                      active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                    }`
                                  }
                                >
                                  {({ selected }) => (
                                    <>
                                      <span
                                        className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                                      >
                                        {option.label}
                                      </span>
                                      {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}
                          </Listbox.Options>
                        </div>
                      </Listbox>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reservation.bookingType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingReservation(reservation);
                            setShowEditForm(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-150 cursor-pointer"
                          aria-label="Edit"
                        >
                          <svg
                            className="w-4 h-4 mr-1.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleTableReservationDelete(reservation.id.toString())}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-150 cursor-pointer"
                          aria-label="Delete"
                        >
                          <svg
                            className="w-4 h-4 mr-1.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center py-4 space-x-2">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const page = idx + 1;
                  const isCurrent = page === currentPage;
                  const showPage =
                    page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                  if (
                    !showPage &&
                    ((page === 2 && currentPage > 3) ||
                      (page === totalPages - 1 && currentPage < totalPages - 2))
                  ) {
                    return (
                      <span key={page} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  if (!showPage) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors duration-150 ${isCurrent ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Reservation Edit Modal */}
      {showEditForm && editingReservation && (
        <div className="fixed inset-0 bg-gray-800/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <ReservationForm
              initialData={editingReservation}
              isSubmitting={false}
              onSubmit={async updatedData => {
                if (editingReservation) {
                  await onEdit({ ...editingReservation, ...updatedData });
                }
                setShowEditForm(false);
                setEditingReservation(null);
              }}
              onCancel={() => {
                setShowEditForm(false);
                setEditingReservation(null);
              }}
            />
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => {
                setShowEditForm(false);
                setEditingReservation(null);
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationList;
