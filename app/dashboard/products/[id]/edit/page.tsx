import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "../../ProductForm";
import { updateProduct } from "@/lib/actions/products";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle<Product>();

  if (!product) notFound();

  return (
    <div>
      <h2 className="font-semibold text-lg mb-4">Edit {product.name}</h2>
      <ProductForm action={updateProduct} product={product} />
    </div>
  );
}
