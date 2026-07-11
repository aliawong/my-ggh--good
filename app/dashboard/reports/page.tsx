import { createClient } from "@/lib/supabase/server";
import type { AgeGroupPerformance, ProductPerformance } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = await createClient();
  const [{ data: byProduct }, { data: byAgeGroup }] = await Promise.all([
    supabase
      .from("product_performance")
      .select("*")
      .order("revenue", { ascending: false }),
    supabase
      .from("age_group_performance")
      .select("*")
      .order("revenue", { ascending: false }),
  ]);

  const maxProductRevenue = Math.max(
    1,
    ...((byProduct as ProductPerformance[]) ?? []).map((p) => Number(p.revenue)),
  );
  const maxAgeRevenue = Math.max(
    1,
    ...((byAgeGroup as AgeGroupPerformance[]) ?? []).map((a) =>
      Number(a.revenue),
    ),
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-semibold text-lg mb-3">
          Which products sell better
        </h2>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3">
          {((byProduct as ProductPerformance[]) ?? []).map((p) => (
            <div key={p.product_id}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">{p.name}</span>
                <span className="text-neutral-500">
                  {p.units_sold} sold · ${Number(p.revenue).toFixed(2)} ·{" "}
                  {p.stock_qty != null ? `${p.stock_qty} in stock` : "stock TBD"}
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100">
                <div
                  className="h-2 rounded-full bg-brand-500"
                  style={{
                    width: `${(Number(p.revenue) / maxProductRevenue) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
          {(byProduct ?? []).length === 0 && (
            <p className="text-sm text-neutral-500">
              No sales recorded yet.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-lg mb-3">
          Which age group buys the most
        </h2>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3">
          {((byAgeGroup as AgeGroupPerformance[]) ?? []).map((a) => (
            <div key={a.age_group}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">{a.age_group}</span>
                <span className="text-neutral-500">
                  {a.units_sold} units · {a.sale_count} sales · $
                  {Number(a.revenue).toFixed(2)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100">
                <div
                  className="h-2 rounded-full bg-brand-700"
                  style={{
                    width: `${(Number(a.revenue) / maxAgeRevenue) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
          {(byAgeGroup ?? []).length === 0 && (
            <p className="text-sm text-neutral-500">
              No sales recorded yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
