"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { InquiryKind, InquiryStatus } from "@/lib/types";

export async function submitInquiry(formData: FormData) {
  const productId = String(formData.get("product_id") ?? "");
  const customerName = String(formData.get("customer_name") ?? "").trim();
  const customerEmail = String(formData.get("customer_email") ?? "").trim();
  const customerAgeGroup = String(formData.get("customer_age_group") ?? "Unknown");
  const kind = String(formData.get("kind") ?? "inquiry") as InquiryKind;
  const message = String(formData.get("message") ?? "").trim();

  if (!customerName || !message) {
    throw new Error("Name and message are required");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").insert({
    product_id: productId || null,
    customer_name: customerName,
    customer_email: customerEmail || null,
    customer_age_group: customerAgeGroup,
    kind,
    message,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/inquiries");
  redirect(`/products/${productId}?submitted=1`);
}

export async function updateInquiryStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "new") as InquiryStatus;
  const repNotes = String(formData.get("rep_notes") ?? "");

  if (!id) throw new Error("Missing inquiry id");

  const supabase = await createClient();
  const { error } = await supabase
    .from("inquiries")
    .update({
      status,
      rep_notes: repNotes,
      resolved_at: status === "resolved" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/inquiries");
  revalidatePath("/dashboard");
}

export async function deleteInquiry(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing inquiry id");

  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/inquiries");
  revalidatePath("/dashboard");
}
