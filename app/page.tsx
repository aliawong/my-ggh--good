import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <section className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-brand-800">
          Comfy Foot Product Catalog
        </h1>
        <p className="mt-2 text-neutral-600 max-w-2xl">
          Everything our customers need to know before they buy — materials,
          pros, and real benefits. Have a question about a product? Ask us
          directly from the product page.
        </p>
      </section>

      {error && (
        <p className="text-red-600 text-sm">
          Could not load products: {error.message}
        </p>
      )}

      {!error && (!products || products.length === 0) && (
        <p className="text-neutral-500">
          No products yet.{" "}
          <Link href="/dashboard/products/new" className="underline">
            Add the first one
          </Link>
          .
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(products as Product[] | null)?.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group rounded-xl border border-neutral-200 bg-white p-5 hover:border-brand-400 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold text-lg text-neutral-900 group-hover:text-brand-700">
                {product.name}
              </h2>
              <span className="shrink-0 text-xs rounded-full bg-brand-50 text-brand-700 px-2 py-1">
                {product.category}
              </span>
            </div>
            <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
              {product.description}
            </p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="font-semibold text-brand-700">
                ${Number(product.price).toFixed(2)}
              </span>
              <span
                className={
                  product.stock_qty > 0
                    ? "text-green-700"
                    : "text-red-600 font-medium"
                }
              >
                {product.stock_qty > 0
                  ? `${product.stock_qty} in stock`
                  : "Out of stock"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
