import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/product-form";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to Products
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Product</h1>
        <p className="text-gray-500 mt-1">Add a new product to your catalog</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <ProductForm />
      </div>
    </div>
  );
}
