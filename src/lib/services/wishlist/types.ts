export type WishlistItem = {
  id: number;
  item: string;
  description: string;
  link: string;
  status: 'available' | 'reserved' | 'bought';
  reserved_by: string | null;
  reserved_at: string | null;
  bought_at: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ReservationStatus = {
  bought: boolean;
  boughtAt: string | null;
  reservedBy: string | null;
};