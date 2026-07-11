import { createClient } from "@/lib/supabase/server";
import { updateInquiryStatus, deleteInquiry } from "@/lib/actions/inquiries";
import { logSale } from "@/lib/actions/sales";
import type { Inquiry } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const supabase = await createClient();
  const { data: inquiries, error } = await supabase
    .from("inquiries")
    .select("*, products(id, name, price, stock_qty)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Customer inquiries</h2>
      {error && <p className="text-red-600 text-sm">{error.message}</p>}
      {!error && (inquiries ?? []).length === 0 && (
        <p className="text-neutral-500 text-sm">No inquiries yet.</p>
      )}

      <div className="space-y-4">
        {((inquiries as Inquiry[]) ?? []).map((inq) => (
          <div
            key={inq.id}
            className="rounded-xl border border-neutral-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {inq.customer_name}{" "}
                  <span className="font-normal text-neutral-500 text-sm">
                    {inq.customer_email ? `· ${inq.customer_email}` : ""} ·{" "}
                    {inq.customer_age_group}
                  </span>
                </p>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {inq.products?.name ?? "General inquiry"} ·{" "}
                  {inq.kind === "problem" ? "Problem" : "Question"} ·{" "}
                  {new Date(inq.created_at).toLocaleString()}
                </p>
              </div>
              <span
                className={
                  inq.status === "new"
                    ? "text-xs rounded-full bg-amber-100 text-amber-800 px-2 py-1 h-fit"
                    : inq.status === "in_progress"
                      ? "text-xs rounded-full bg-blue-100 text-blue-800 px-2 py-1 h-fit"
                      : "text-xs rounded-full bg-green-100 text-green-800 px-2 py-1 h-fit"
                }
              >
                {inq.status.replace("_", " ")}
              </span>
            </div>

            <p className="mt-3 text-sm text-neutral-800 bg-neutral-50 rounded-lg p-3">
              {inq.message}
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <form
                action={updateInquiryStatus}
                className="space-y-2 rounded-lg border border-neutral-100 p-3"
              >
                <input type="hidden" name="id" value={inq.id} />
                <p className="text-xs font-semibold text-neutral-500 uppercase">
                  Respond
                </p>
                <select
                  name="status"
                  defaultValue={inq.status}
                  className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <textarea
                  name="rep_notes"
                  defaultValue={inq.rep_notes}
                  placeholder="Notes for the team..."
                  rows={2}
                  className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-neutral-900 text-white text-sm px-3 py-1.5 hover:bg-neutral-700"
                  >
                    Save
                  </button>
                </div>
              </form>

              {inq.product_id && (
                <form
                  action={logSale}
                  className="space-y-2 rounded-lg border border-brand-100 bg-brand-50/40 p-3"
                >
                  <input type="hidden" name="product_id" value={inq.product_id} />
                  <input type="hidden" name="inquiry_id" value={inq.id} />
                  <input
                    type="hidden"
                    name="customer_age_group"
                    value={inq.customer_age_group}
                  />
                  <input
                    type="hidden"
                    name="redirect_to"
                    value="/dashboard/inquiries"
                  />
                  <p className="text-xs font-semibold text-brand-700 uppercase">
                    Convert to sale
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="quantity"
                      min={1}
                      defaultValue={1}
                      required
                      className="w-1/2 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
                      placeholder="Qty"
                    />
                    <input
                      type="number"
                      name="unit_price"
                      min={0}
                      step="0.01"
                      defaultValue={inq.products?.price ?? ""}
                      required
                      className="w-1/2 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
                      placeholder="Unit price"
                    />
                  </div>
                  <p className="text-xs text-neutral-500">
                    {inq.products?.stock_qty != null
                      ? `${inq.products.stock_qty} in stock`
                      : "stock TBD"}
                  </p>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-brand-600 text-white text-sm px-3 py-1.5 hover:bg-brand-700"
                  >
                    Log sale &amp; resolve
                  </button>
                </form>
              )}
            </div>

            <form action={deleteInquiry} className="mt-2">
              <input type="hidden" name="id" value={inq.id} />
              <button
                type="submit"
                className="text-xs text-red-500 hover:underline"
              >
                Delete inquiry
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
