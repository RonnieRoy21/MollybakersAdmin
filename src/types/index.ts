// Adjust these to match your actual Supabase schema once you wire up
// the real endpoints — these are reasonable placeholder shapes based
// on a typical auth users table + a cakes table.

export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  is_active?: boolean;
}

export interface Cake {
  cake_id: number;
  cake_name: string;
  cake_description: string;
  cake_flavour: string;
  cake_price: number;
  cake_size: number;
  cake_url: string;
}

export type NewUser = Omit<User, "id" | "created_at">;
export type NewCake = Omit<Cake, "cake_id" | "cake_url">;

export interface CakeOffer {
  expiry_date: string;
  cake_id: number;
  cake_price: number;
  add_ons: string | null;
  cake_name: string | null;
  cake_url: string | null;
}

export interface SpecialOffer {
  id: string;
  cake_id: string;
  cake_name: string;
  offer_price: number;
  original_price?: number;
  description?: string;
  starts_at: string;
  ends_at: string;
  active: boolean;
  created_at: string;
}

export type NewSpecialOffer = Omit<SpecialOffer, "id" | "created_at">;

export interface Feedback {
  reviewId: number;
  reviewReply: string | null;
  review_content: string;
  created_at: string;
}

export interface Order {
  orderId: string;
  orderDescription: unknown;
  orderDate: string | null;
  orderTotalPrice: number;
  orderPaymentStatus: string;
  orderProcessingStatus: string;
}
