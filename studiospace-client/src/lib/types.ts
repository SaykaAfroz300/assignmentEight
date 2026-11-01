export type StudioCategoryValue =
  | "Photo Studio"
  | "Film Stage"
  | "Podcast Lounge"
  | "Music Suite"
  | "Art Workshop";

export interface Studio {
  _id: string;
  title: string;
  category: StudioCategoryValue;
  hourlyRate: number;
  securityDeposit: number;
  maxCapacity: number;
  location: string;
  imageUrl: string;
  gallery?: string[];
  amenities: string[];
  overview: string;
  areaSqFt?: number;
  openingHour?: number;
  closingHour?: number;
  rating: number;
  reviewCount: number;
  ownerEmail: string;
  ownerName: string;
  ownerAvatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface Booking {
  _id: string;
  invoiceNumber: string;
  studioId: string;
  studioTitle: string;
  studioCategory: string;
  studioImage: string;
  studioLocation: string;
  hourlyRate: number;
  securityDeposit: number;
  hostName: string;
  hostEmail: string;
  userId: string;
  userEmail: string;
  userName: string;
  date: string;
  startHour: number;
  endHour: number;
  hours: number;
  projectType: string;
  guestCount: number;
  notes: string;
  subtotal: number;
  serviceFee: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BookedSlot {
  _id: string;
  date: string;
  startHour: number;
  endHour: number;
  status: BookingStatus;
}

export interface Review {
  _id: string;
  studioId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string | null;
  rating: number;
  comment: string;
  projectType: string;
  createdAt: string;
}

export function formatHourLabel(hour: number): string {
  const h = hour % 24;
  const suffix = h >= 12 ? "PM" : "AM";
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve}:00 ${suffix}`;
}

