"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function parseLines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function productFromForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    category: String(formData.get("category") ?? "General").trim(),
    material: String(formData.get("material") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    pros: parseLines(formData.get("pros")),
    benefits: parseLines(formData.get("benefits")),
    price: Number(formData.get("price") ?? 0),
    stock_qty: Number(formData.get("stock_qty") ?? 0),
    target_age_group: String(formData.get("target_age_group") ?? "All ages"),
    image_url: String(formData.get("image_url") ?? "").trim() || null,
  };
}

export async function createProduct(formData: FormData) {
  const product = productFromForm(formData);
  if (!product.name) throw new Error("Product name is required");

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert(product);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/products");
  revalidatePath("/");
  redirect("/dashboard/products");
}

export async function updateProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing product id");

  const product = productFromForm(formData);
  if (!product.name) throw new Error("Product name is required");

  const supabase = await createClient();
  const { error } = await supabase.from("products").update(product).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/products");
  revalidatePath(`/products/${id}`);
  revalidatePath("/");
  redirect("/dashboard/products");
}

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing product id");

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/products");
  revalidatePath("/");
}
