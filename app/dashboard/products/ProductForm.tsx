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

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">
            Item number
          </label>
          <input
            name="item_number"
            defaultValue={product?.item_number ?? ""}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Barcode</label>
          <input
            name="barcode"
            defaultValue={product?.barcode ?? ""}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Pack size</label>
          <input
            name="pack_size"
            defaultValue={product?.pack_size ?? ""}
            placeholder="e.g. 1 box, 20 pieces"
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
          <label className="text-sm font-medium block mb-1">
            Price ($) — leave blank if not set yet
          </label>
          <input
            type="number"
            name="price"
            min={0}
            step="0.01"
            defaultValue={product?.price ?? ""}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">
            Stock qty — leave blank if not set yet
          </label>
          <input
            type="number"
            name="stock_qty"
            min={0}
            defaultValue={product?.stock_qty ?? ""}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">
            Target age group
          </label>
          <select
            name="target_age_group"
            defaultValue={product?.target_age_group ?? ""}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">Not set</option>
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
