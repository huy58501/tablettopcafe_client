import React, { useState, useEffect, ReactNode } from 'react';
import { useReservations } from '../../../hooks/useReservations';
import ReservationList from './ReservationList';
import ReservationCalendar from './ReservationCalendar';
import ReservationForm from './modal/ReservationForm';
import ReservationModal from './modal/ReservationModal';
import { Booking, ReservationStatus, Table } from '../../../types/reservation';
import {
  FaList,
  FaCalendarAlt,
  FaPlus,
  FaSpinner,
  FaExclamationCircle,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendar,
} from 'react-icons/fa';
import SpinningModal from '@/components/UI/SpinningModal';

// Custom button component for consistent styling
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
}: ButtonProps) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline:
      'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-5 py-2.5 text-base rounded-md',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default function TableReservations() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarViewMode, setCalendarViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedReservation, setSelectedReservation] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const {
    reservations,
    tables,
    loading,
    error,
    handleSubmit: submitReservation,
    isLoading,
    refetch,
  } = useReservations();

  // Handle reservation edit
  const handleEdit = (reservation: Booking) => {
    setSelectedReservation(reservation);
    setShowForm(true);
    setShowModal(false);
  };

  // Handle reservation delete
  const handleDelete = async (id: string) => {};

  // Handle status change
  const handleStatusChange = async (id: string, status: ReservationStatus) => {};

  // Handle calendar reservation selection
  const handleSelectReservation = (reservation: Booking) => {
    setSelectedReservation(reservation);
    setShowModal(true);
  };

  // Handle form cancel
  const handleCancel = () => {
    setShowForm(false);
    setSelectedReservation(null);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Handle form submission
  const handleSubmit = async (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true);
    try {
      setShowForm(false);
      await submitReservation(data as Booking);
      // Refresh the reservations data after successful booking
      await refetch();
      setIsSubmitting(false);
      // The form will handle closing itself after showing success message
    } catch (error) {
      console.error('Error submitting reservation:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SpinningModal isOpen={isLoading} message="Loading reservations..." />
      <SpinningModal isOpen={isSubmitting} message="Submitting reservation..." />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Table Reservations</h1>
              <p className="text-gray-600 mt-1">Manage your restaurant reservations</p>
            </div>

            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
              <Button
                onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
              >
                <FaList className="mr-2" />
                <span>List View</span>
              </Button>

              <Button
                onClick={() => setViewMode('calendar')}
                variant={viewMode === 'calendar' ? 'primary' : 'secondary'}
              >
                <FaCalendarAlt className="mr-2" />
                <span>Calendar View</span>
              </Button>

              <Button
                onClick={() => {
                  setSelectedReservation(null);
                  setShowForm(true);
                }}
                variant="success"
              >
                <FaPlus className="mr-2" />
                <span>New Reservation</span>
              </Button>
            </div>
          </div>

          {viewMode === 'calendar' && (
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <Button
                onClick={() => setCalendarViewMode('day')}
                variant={calendarViewMode === 'day' ? 'primary' : 'secondary'}
                size="sm"
              >
                <FaCalendarDay className="mr-2" />
                <span>Day</span>
              </Button>

              <Button
                onClick={() => setCalendarViewMode('week')}
                variant={calendarViewMode === 'week' ? 'primary' : 'secondary'}
                size="sm"
              >
                <FaCalendarWeek className="mr-2" />
                <span>Week</span>
              </Button>

              <Button
                onClick={() => setCalendarViewMode('month')}
                variant={calendarViewMode === 'month' ? 'primary' : 'secondary'}
                size="sm"
              >
                <FaCalendar className="mr-2" />
                <span>Month</span>
              </Button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <FaExclamationCircle className="text-red-500 text-xl mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center space-y-4">
                <FaSpinner className="text-4xl text-blue-500 animate-spin" />
                <p className="text-gray-600">Loading reservations...</p>
              </div>
            </div>
          ) : (
            <div>
              {viewMode === 'list' ? (
                <ReservationList
                  reservations={reservations}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ) : (
                <ReservationCalendar
                  reservations={reservations}
                  onSelectReservation={handleSelectReservation}
                  viewMode={calendarViewMode}
                />
              )}
            </div>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-gray-800/80 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <ReservationForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={loading}
              />
            </div>
          </div>
        )}

        {showModal && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
              <ReservationModal reservation={selectedReservation} onClose={handleCloseModal} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
