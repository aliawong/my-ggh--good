"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logSale(formData: FormData) {
  const productId = String(formData.get("product_id") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);
  const unitPrice = Number(formData.get("unit_price") ?? 0);
  const customerAgeGroup = String(formData.get("customer_age_group") ?? "Unknown");
  const inquiryId = formData.get("inquiry_id")
    ? String(formData.get("inquiry_id"))
    : null;
  const redirectTo = formData.get("redirect_to")
    ? String(formData.get("redirect_to"))
    : "/dashboard/sales";

  if (!productId || quantity <= 0) {
    throw new Error("Product and a positive quantity are required");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("log_sale", {
    p_product_id: productId,
    p_quantity: quantity,
    p_unit_price: unitPrice,
    p_customer_age_group: customerAgeGroup,
    p_inquiry_id: inquiryId,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/sales");
  revalidatePath("/dashboard/inquiries");
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/reports");
  revalidatePath("/dashboard");
  redirect(redirectTo + "?sale=1");
}
