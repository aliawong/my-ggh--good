import ProductForm from "../ProductForm";
import { createProduct } from "@/lib/actions/products";

export default function NewProductPage() {
  return (
    <div>
      <h2 className="font-semibold text-lg mb-4">Add a product</h2>
      <ProductForm action={createProduct} />
    </div>
  );
}
