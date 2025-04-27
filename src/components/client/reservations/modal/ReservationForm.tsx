import React, { useState, useEffect } from 'react';
import { Booking, TimeSlot } from '../../../../types/reservation';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import LoadingModal from '@/components/UI/LoadingModal';
import { FaCheckCircle } from 'react-icons/fa';

interface ReservationFormProps {
  onSubmit: (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: Partial<Booking>;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<Partial<Booking> & { startTime?: string }>(
    initialData || {
      customerName: '',
      phoneNumber: '',
      customerEmail: '',
      customerNote: '',
      reservationDate: new Date().toISOString().split('T')[0],
      durationSlots: 6,
      peopleCount: 1,
      startSlotId: 0,
      tableId: 0,
      bookingType: 'online',
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const {
    data: slotsData,
    loading: slotsLoading,
    error: slotsError,
  } = useAvailableSlots(formData.reservationDate?.toString() || '', formData.peopleCount || 0);

  useEffect(() => {
    if (initialData) {
      console.log('initialData', initialData);
      setFormData(prev => {
        let dateValue = initialData.reservationDate;
        // Convert timestamp or ISO string to 'YYYY-MM-DD'
        if (dateValue) {
          if (typeof dateValue === 'number' || !isNaN(Number(dateValue))) {
            const d = new Date(Number(dateValue));
            dateValue = d.toISOString().split('T')[0];
          } else if (typeof dateValue === 'string' && dateValue.includes('T')) {
            dateValue = dateValue.split('T')[0];
          }
        }
        return { ...initialData, reservationDate: dateValue };
      });
    }
  }, [initialData]);

  useEffect(() => {
    console.log('formData', formData);
  }, [formData, formData.reservationDate]);

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName?.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!formData.reservationDate) {
      newErrors.reservationDate = 'Date is required';
    }

    if (formData.peopleCount && formData.peopleCount < 1) {
      newErrors.peopleCount = 'Number of guests must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'peopleCount' ? Number(value) : value }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData as Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>);
      setShowSuccess(true);

      // Close the modal after showing success message for 2 seconds
      setTimeout(() => {
        onCancel();
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Format time for display
  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return time;
    }
  };

  const getNoSlotsMessage = () => {
    return `No available time slots for ${formData.reservationDate ? formatDisplayDate(formData.reservationDate) : ''} with ${formData.peopleCount} guests. Please try a different date or adjust the number of guests.`;
  };

  // Add this function near the top with other utility functions
  const formatDisplayDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Display LoadingModal when form is being submitted
  if (isSubmitting) {
    return <LoadingModal />;
  }

  // Display success message
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-lg shadow-lg">
          <FaCheckCircle className="text-6xl text-green-500" />
          <p className="text-xl font-medium text-gray-800">Reservation Added Successfully!</p>
          <p className="text-gray-600">Your reservation has been confirmed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Step indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            1
          </div>
          <div className="w-16 h-1 bg-gray-200">
            <div className={`h-full bg-blue-600 transition-all ${step === 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            2
          </div>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {step === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side - Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                  Customer Name *
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName || ''}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.customerName ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm p-2`}
                />
                {errors.customerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm p-2`}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                )}
              </div>

              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  value={formData.customerEmail || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                />
              </div>
            </div>

            {/* Right side - Reservation Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Reservation Details</h3>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date *
                </label>
                <input
                  type="date"
                  id="reservationDate"
                  name="reservationDate"
                  value={formData.reservationDate || ''}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.reservationDate ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm p-2`}
                />
                {errors.reservationDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.reservationDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="numberOfGuests" className="block text-sm font-medium text-gray-700">
                  Number of Guests *
                </label>
                <input
                  type="number"
                  id="peopleCount"
                  name="peopleCount"
                  value={formData.peopleCount}
                  onChange={handleChange}
                  min="1"
                  className={`mt-1 block w-full rounded-md border ${
                    errors.peopleCount ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm p-2`}
                />
                {errors.peopleCount && (
                  <p className="mt-1 text-sm text-red-600">{errors.peopleCount}</p>
                )}
              </div>
              <div>
                <label htmlFor="customerNote" className="block text-sm font-medium text-gray-700">
                  Notes (Optional)
                </label>
                <textarea
                  id="customerNote"
                  name="customerNote"
                  rows={3}
                  value={formData.customerNote || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                  placeholder="Any special requests or notes for your reservation"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Step 2 - Time Slot Selection */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Select Time Slot</h3>
              <div className="text-sm text-gray-500">
                {formData.reservationDate ? formatDisplayDate(formData.reservationDate) : ''} •{' '}
                {formData.peopleCount} guests
              </div>
            </div>

            {slotsLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : slotsError ? (
              <div className="text-center text-red-600 py-8">
                Error loading time slots. Please try again.
              </div>
            ) : !slotsData?.availableTimeSlots?.length ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">{getNoSlotsMessage()}</div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  ← Change date or number of guests
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {slotsData.availableTimeSlots.map((slot: TimeSlot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        startSlotId: slot.id,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                      }));
                    }}
                    className={`p-4 rounded-lg text-center transition-colors cursor-pointer ${
                      formData.startSlotId === slot.id ||
                      (typeof initialData?.startSlot === 'string' &&
                        initialData.startSlot === slot.startTime)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    <div>{formatTime(slot.startTime)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          {step === 1 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              disabled={!formData.startSlotId}
            >
              Confirm Reservation
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;
