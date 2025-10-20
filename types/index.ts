export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  user_type: 'customer' | 'admin' | 'technician';
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface District {
  id: number;
  name: string;
  delivery_fee: string;
  is_active: boolean;
  order_priority: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string | null;
  pricing_type: 'per_sqm' | 'per_item' | 'per_seat';
  is_active: boolean;
  subtypes: SubType[];
}

export interface SubType {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  current_price: Pricing | null;
}

export interface Pricing {
  id: number;
  base_price: string;
  final_price: string;
  currency: string;
  discount_percentage: string;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
}

export interface Address {
  id: number;
  title: string;
  district: number;
  district_name: string;
  full_address: string;
  postal_code: string;
  building_no: string;
  apartment_no: string;
  floor: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingItem {
  id: number;
  subtype: number;
  subtype_details: SubType;
  quantity: string;
  unit_price: string;
  line_total: string;
  notes: string;
}

export interface Booking {
  id: string;
  booking_number: string;
  user: string;
  status: 'pending' | 'confirmed' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  status_display: string;
  pickup_address: number;
  pickup_address_details: Address;
  delivery_address: number | null;
  delivery_address_details: Address | null;
  pickup_date: string;
  pickup_time_slot: number;
  delivery_date: string | null;
  delivery_time_slot: number | null;
  assigned_technician: string | null;
  assigned_technician_name: string | null;
  subtotal: string;
  delivery_fee: string;
  discount: string;
  total: string;
  currency: string;
  customer_notes: string;
  admin_notes: string;
  cancellation_reason: string;
  items: BookingItem[];
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  can_cancel: boolean;
  can_reschedule: boolean;
  cancellation_info: {
    can_cancel: boolean;
    message: string;
    min_notice_hours: number;
    cancellation_fee_percentage: number;
  };
}

export interface TimeSlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_bookings: number;
  is_available: boolean;
  is_available_now: boolean;
}

export interface PaymentMethod {
  id: number;
  payment_type: 'card';
  card_brand: string;
  last_four_digits: string;
  cardholder_name: string;
  expiry_month: string;
  expiry_year: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  transaction_id: string;
  booking: string;
  payment_gateway: 'iyzico' | 'stripe';
  amount: string;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  error_message: string;
  created_at: string;
  completed_at: string | null;
}

export interface BookingSettings {
  min_cancellation_notice_hours: number;
  min_reschedule_notice_hours: number;
  cancellation_fee_percentage: string;
  late_cancellation_fee_percentage: string;
  default_service_start_time: string;
  default_service_end_time: string;
}

export interface NotificationPreference {
  email_booking_confirmation: boolean;
  email_booking_reminder: boolean;
  email_marketing: boolean;
  sms_booking_confirmation: boolean;
  sms_booking_reminder: boolean;
  sms_marketing: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
