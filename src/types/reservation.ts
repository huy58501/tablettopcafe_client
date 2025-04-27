export type ReservationStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
}

export interface Table {
  id: number;
  number: string;
  capacity: number;
  createdAt: string;
}

export interface Booking {
  id: number;
  customerName: string;
  customerEmail: string;
  customerNote: string;
  phoneNumber: string;
  reservationDate: string;
  durationSlots: number;
  peopleCount: number;
  bookingType: string;
  startSlotId: number;
  tableId: number;
  status: string;
  createdAt: string;
  table: Table;
  startSlot: TimeSlot;
}
