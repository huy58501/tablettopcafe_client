import React from 'react';
import { Booking } from '../../../../types/reservation';
import { format } from 'date-fns';

interface ReservationModalProps {
  reservation: Booking;
  onClose: () => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ reservation, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">Reservation Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 cursor-pointer">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Customer Name</p>
            <p className="font-medium">{reservation.customerName}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Phone Number</p>
            <p className="font-medium">{reservation.phoneNumber}</p>
          </div>

          {reservation.customerEmail && (
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{reservation.customerEmail}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">
              {format(new Date(parseInt(reservation.reservationDate)), 'MMMM d, yyyy')}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-medium">{reservation.startSlot.startTime}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Number of Guests</p>
            <p className="font-medium">{reservation.peopleCount} guests</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">{reservation.durationSlots} slots</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">{reservation.status}</p>
          </div>

          {reservation.customerNote && (
            <div>
              <p className="text-sm text-gray-500">Notes</p>
              <p className="font-medium">{reservation.customerNote}</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
