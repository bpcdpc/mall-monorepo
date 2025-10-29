import ProductTable from "@/components/ProductTable";
import useProductModel from "@/hooks/useProductModel";

export default function MgrProduct() {
  const { products, isLoading, error } = useProductModel();

  return (
    <div className="p-8">
      <div>상품 관리</div>
      <ProductTable products={products} />
    </div>
  );
}
