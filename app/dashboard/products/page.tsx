import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/lib/actions/products";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Products &amp; stock</h2>
        <Link
          href="/dashboard/products/new"
          className="rounded-lg bg-brand-600 text-white text-sm px-3 py-1.5 hover:bg-brand-700"
        >
          + Add product
        </Link>
      </div>

      {error && <p className="text-red-600 text-sm">{error.message}</p>}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Category</th>
              <th className="px-4 py-2 font-medium">Price</th>
              <th className="px-4 py-2 font-medium">Stock</th>
              <th className="px-4 py-2 font-medium">Age group</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {((products as Product[]) ?? []).map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2 font-medium">{p.name}</td>
                <td className="px-4 py-2 text-neutral-600">{p.category}</td>
                <td className="px-4 py-2">
                  {p.price != null ? `$${Number(p.price).toFixed(2)}` : "TBD"}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={
                      p.stock_qty == null
                        ? "text-neutral-400"
                        : p.stock_qty === 0
                          ? "text-red-600 font-medium"
                          : p.stock_qty <= 20
                            ? "text-amber-700 font-medium"
                            : "text-green-700"
                    }
                  >
                    {p.stock_qty ?? "TBD"}
                  </span>
                </td>
                <td className="px-4 py-2 text-neutral-600">
                  {p.target_age_group || "—"}
                </td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  <Link
                    href={`/dashboard/products/${p.id}/edit`}
                    className="text-brand-700 hover:underline mr-3"
                  >
                    Edit
                  </Link>
                  <form action={deleteProduct} className="inline">
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {(products ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-neutral-500">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
