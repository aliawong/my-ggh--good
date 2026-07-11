export type Product = {
  id: string;
  name: string;
  category: string;
  material: string;
  description: string;
  pros: string[];
  benefits: string[];
  price: number;
  stock_qty: number;
  target_age_group: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type InquiryStatus = "new" | "in_progress" | "resolved";
export type InquiryKind = "inquiry" | "problem";

export type Inquiry = {
  id: string;
  product_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_age_group: string;
  kind: InquiryKind;
  message: string;
  status: InquiryStatus;
  rep_notes: string;
  created_at: string;
  resolved_at: string | null;
  products?: Pick<Product, "id" | "name" | "price" | "stock_qty"> | null;
};

export type Sale = {
  id: string;
  product_id: string | null;
  inquiry_id: string | null;
  customer_age_group: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  created_at: string;
  products?: Pick<Product, "id" | "name"> | null;
};

export type ProductPerformance = {
  product_id: string;
  name: string;
  category: string;
  stock_qty: number;
  units_sold: number;
  revenue: number;
};

export type AgeGroupPerformance = {
  age_group: string;
  sale_count: number;
  units_sold: number;
  revenue: number;
};

export const AGE_GROUPS = [
  "Under 18",
  "18-25",
  "26-35",
  "36-45",
  "46-60",
  "60+",
  "Unknown",
] as const;
