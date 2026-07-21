// Hand-written types matching supabase/schema.sql.
// Once the project is running, regenerate with:
//   npx supabase gen types typescript --project-id <ref> > lib/types/database.ts

export type Role = 'buyer' | 'seller' | 'admin';
export type SellerStatus = 'pending' | 'approved' | 'on_hold' | 'rejected';
export type ProductStatus = 'draft' | 'pending_review' | 'approved' | 'on_hold' | 'rejected';
export type ProductTier = 'approved' | 'club_selection' | 'founders_pick';

export interface Profile {
  id: string;
  role: Role;
  full_name: string | null;
  email: string | null;
  created_at: string;
}

export interface Seller {
  id: string;
  profile_id: string;
  business_name: string;
  abn: string;
  licence_number: string | null;
  licence_expiry: string | null;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  insurance_expiry: string | null;
  stripe_account_id: string | null;
  status: SellerStatus;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price_cents: number;
  images: string[];
  animal_raising_standard: string | null;
  ingredients_list: string | null;
  cold_chain_method: string | null;
  shelf_life: string | null;
  status: ProductStatus;
  tier: ProductTier | null;
  created_at: string;
}

export interface ApprovalReview {
  id: string;
  target_type: 'seller' | 'product' | 'recipe';
  target_id: string;
  reviewer_id: string;
  pillar_scores: Record<string, boolean>;
  decision: 'approved' | 'on_hold' | 'rejected';
  notes: string | null;
  created_at: string;
}
