import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { submitInquiry } from "@/lib/actions/inquiries";
import { AGE_GROUPS, type Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { id } = await params;
  const { submitted } = await searchParams;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle<Product>();

  if (!product) notFound();

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <Link href="/" className="text-sm text-brand-700 hover:underline">
        ← Back to catalog
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div>
          <span className="text-xs rounded-full bg-brand-50 text-brand-700 px-2 py-1">
            {product.category}
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            {product.name}
          </h1>
          <p className="mt-3 text-neutral-700">{product.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-neutral-500">Price</dt>
              <dd className="font-semibold text-lg text-brand-700">
                ${Number(product.price).toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Availability</dt>
              <dd
                className={
                  product.stock_qty > 0
                    ? "font-semibold text-green-700"
                    : "font-semibold text-red-600"
                }
              >
                {product.stock_qty > 0
                  ? `${product.stock_qty} in stock`
                  : "Out of stock"}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Material</dt>
              <dd className="font-medium">{product.material || "—"}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Best for age group</dt>
              <dd className="font-medium">{product.target_age_group}</dd>
            </div>
          </dl>

          {product.pros.length > 0 && (
            <div className="mt-6">
              <h2 className="font-semibold text-neutral-900">Pros</h2>
              <ul className="mt-2 list-disc list-inside text-sm text-neutral-700 space-y-1">
                {product.pros.map((pro) => (
                  <li key={pro}>{pro}</li>
                ))}
              </ul>
            </div>
          )}

          {product.benefits.length > 0 && (
            <div className="mt-6">
              <h2 className="font-semibold text-neutral-900">Benefits</h2>
              <ul className="mt-2 list-disc list-inside text-sm text-neutral-700 space-y-1">
                {product.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 h-fit">
          <h2 className="font-semibold text-lg">Ask about this product</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Questions, sizing concerns, or a problem with an order — our
            sales team replies personally.
          </p>

          {submitted === "1" && (
            <p className="mt-4 rounded-lg bg-green-50 text-green-800 text-sm px-3 py-2">
              Thanks — your message was sent to our sales team.
            </p>
          )}

          <form action={submitInquiry} className="mt-4 space-y-3">
            <input type="hidden" name="product_id" value={product.id} />

            <div>
              <label className="text-sm font-medium block mb-1">
                Your name
              </label>
              <input
                name="customer_name"
                required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                placeholder="Jane Dela Cruz"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                name="customer_email"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                placeholder="jane@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Age group
                </label>
                <select
                  name="customer_age_group"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  defaultValue="Unknown"
                >
                  {AGE_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Type
                </label>
                <select
                  name="kind"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  defaultValue="inquiry"
                >
                  <option value="inquiry">Question</option>
                  <option value="problem">Problem</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Message
              </label>
              <textarea
                name="message"
                required
                rows={4}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                placeholder="Tell us what you'd like to know..."
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-brand-600 text-white font-medium py-2 hover:bg-brand-700"
            >
              Send to sales team
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
