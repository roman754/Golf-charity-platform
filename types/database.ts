// Database types
export type UserRole = 'user' | 'admin';
export type PlanType = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due';
export type DrawStatus = 'pending' | 'published' | 'completed';
export type DrawType = 'random' | 'algorithmic';
export type MatchType = '3-match' | '4-match' | '5-match';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type PaymentStatus = 'pending' | 'paid';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  website_url: string | null;
  is_featured: boolean;
  upcoming_events: string[];
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  charity_id: string | null;
  plan_type: PlanType;
  status: SubscriptionStatus;
  charity_percentage: number;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
  charity?: Charity;
}

export interface GolfScore {
  id: string;
  user_id: string;
  score: number;
  score_date: string;
  created_at: string;
  updated_at: string;
}

export interface Draw {
  id: string;
  draw_date: string;
  draw_month: number;
  draw_year: number;
  status: DrawStatus;
  draw_type: DrawType;
  total_pool_amount: number;
  jackpot_amount: number;
  winning_numbers: number[];
  total_participants: number;
  created_at: string;
  published_at: string | null;
  completed_at: string | null;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  entry_numbers: number[];
  matches_count: number;
  created_at: string;
  draw?: Draw;
}

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  entry_id: string;
  match_type: MatchType;
  prize_amount: number;
  verification_status: VerificationStatus;
  payment_status: PaymentStatus;
  proof_image_url: string | null;
  admin_notes: string | null;
  verified_at: string | null;
  paid_at: string | null;
  created_at: string;
  draw?: Draw;
  user?: Profile;
}

export interface CharityContribution {
  id: string;
  user_id: string;
  charity_id: string;
  subscription_id: string | null;
  amount: number;
  contribution_date: string;
  created_at: string;
  charity?: Charity;
}

// Extended types with relations
export interface SubscriptionWithCharity extends Subscription {
  charity: Charity;
}

export interface WinnerWithDetails extends Winner {
  draw: Draw;
  user: Profile;
}
