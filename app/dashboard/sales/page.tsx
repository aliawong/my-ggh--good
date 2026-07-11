import { createClient } from "@/lib/supabase/server";
import { logSale } from "@/lib/actions/sales";
import { AGE_GROUPS, type Product, type Sale } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ sale?: string }>;
}) {
  const { sale } = await searchParams;
  const supabase = await createClient();
  const [{ data: products }, { data: sales }] = await Promise.all([
    supabase.from("products").select("*").order("name"),
    supabase
      .from("sales")
      .select("*, products(id, name)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-neutral-200 bg-white p-5 max-w-xl">
        <h2 className="font-semibold text-lg">Log a walk-in sale</h2>
        {sale === "1" && (
          <p className="mt-2 rounded-lg bg-green-50 text-green-800 text-sm px-3 py-2">
            Sale logged — stock updated.
          </p>
        )}
        <form action={logSale} className="mt-3 space-y-3">
          <input type="hidden" name="redirect_to" value="/dashboard/sales" />
          <div>
            <label className="text-sm font-medium block mb-1">Product</label>
            <select
              name="product_id"
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              {((products as Product[]) ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (
                  {p.price != null ? `$${Number(p.price).toFixed(2)}` : "price TBD"},{" "}
                  {p.stock_qty != null ? `${p.stock_qty} in stock` : "stock TBD"})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                min={1}
                defaultValue={1}
                required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">
                Unit price ($)
              </label>
              <input
                type="number"
                name="unit_price"
                min={0}
                step="0.01"
                required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">
              Customer age group
            </label>
            <select
              name="customer_age_group"
              defaultValue="Unknown"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              {AGE_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand-600 text-white font-medium px-4 py-2 hover:bg-brand-700"
          >
            Log sale
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold text-lg mb-3">Recent sales</h2>
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Product</th>
                <th className="px-4 py-2 font-medium">Qty</th>
                <th className="px-4 py-2 font-medium">Unit price</th>
                <th className="px-4 py-2 font-medium">Total</th>
                <th className="px-4 py-2 font-medium">Age group</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {((sales as Sale[]) ?? []).map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-2 text-neutral-600">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {s.products?.name ?? "Deleted product"}
                  </td>
                  <td className="px-4 py-2">{s.quantity}</td>
                  <td className="px-4 py-2">
                    ${Number(s.unit_price).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 font-semibold text-brand-700">
                    ${Number(s.total_amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-neutral-600">
                    {s.customer_age_group}
                  </td>
                </tr>
              ))}
              {(sales ?? []).length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-neutral-500"
                  >
                    No sales logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
