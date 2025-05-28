import { ProductForm } from "@/components/product-form"

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto p-6">
      <ProductForm productId={params.id} />
    </div>
  )
}