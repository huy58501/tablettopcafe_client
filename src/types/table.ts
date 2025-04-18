export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  notes?: string;
  dish: {
    id: number;
    name: string;
    price: number;
    category?: string;
    isActive: boolean;
  };
}

export interface Order {
  id: number;
  bookingId: number;
  status: string;
  total: number;
  createdAt: string;
  orderItems: OrderItem[];
  tableId: number;
}

export interface Table {
  id: number;
  number: string;
  capacity: number;
  status: string;
  createdAt: string;
  bookings: Booking[];
}

export interface Booking {
  id: number;
  customerName: string;
  phoneNumber: string;
  customerEmail?: string;
  customerNote?: string;
  status: string;
  reservationDate: string;
  durationSlots: number;
  peopleCount: number;
  bookingType: string;
  table: Table;
  startSlot: TimeSlot;
  order?: Order;
  createdAt: string;
}

export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
}

export interface Dish {
  id: number;
  name: string;
  price: number;
  category?: string;
  isActive: boolean;
}
