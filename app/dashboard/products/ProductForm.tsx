import { AGE_GROUPS, type Product } from "@/lib/types";

export default function ProductForm({
  action,
  product,
}: {
  action: (formData: FormData) => void;
  product?: Product;
}) {
  return (
    <form action={action} className="space-y-4 max-w-xl">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div>
        <label className="text-sm font-medium block mb-1">Name</label>
        <input
          name="name"
          required
          defaultValue={product?.name}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Category</label>
          <input
            name="category"
            defaultValue={product?.category ?? "General"}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Material</label>
          <input
            name="material"
            defaultValue={product?.material}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">
            Pros (one per line)
          </label>
          <textarea
            name="pros"
            rows={4}
            defaultValue={product?.pros.join("\n")}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">
            Benefits (one per line)
          </label>
          <textarea
            name="benefits"
            rows={4}
            defaultValue={product?.benefits.join("\n")}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Price ($)</label>
          <input
            type="number"
            name="price"
            min={0}
            step="0.01"
            required
            defaultValue={product?.price ?? 0}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Stock qty</label>
          <input
            type="number"
            name="stock_qty"
            min={0}
            required
            defaultValue={product?.stock_qty ?? 0}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">
            Target age group
          </label>
          <select
            name="target_age_group"
            defaultValue={product?.target_age_group ?? "All ages"}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="All ages">All ages</option>
            {AGE_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">
          Image URL (optional)
        </label>
        <input
          name="image_url"
          defaultValue={product?.image_url ?? ""}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="https://..."
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-brand-600 text-white font-medium px-4 py-2 hover:bg-brand-700"
      >
        {product ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
