import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { fetchProducts } from "@/utils/api";
import clsx from "clsx";

const CATEGORIES = ["women", "men", "kids"];

const CategoryButtons = ({ selectedCategory, onSelectCategory }) =>
  CATEGORIES.map((cat) => (
    <button
      key={cat}
      onClick={() => onSelectCategory(cat)}
      className={clsx("cursor-pointer", {
        "text-gray-200": selectedCategory !== cat,
      })}
    >
      {cat.toUpperCase()}
    </button>
  ));

const ProductSection = ({
  title,
  products,
  selectedCategory,
  onSelectCategory,
}) => (
  <>
    <div className="pt-16 pb-8 font-extrabold text-4xl text-center">
      {title}
    </div>
    <div className="flex font-extrabold text-xl pb-16 space-x-16 justify-center">
      <CategoryButtons
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />
    </div>
    <div className="grid grid-cols-5 gap-8">
      {products.map((p) => (
        <ProductCard key={p.productId} {...p} />
      ))}
    </div>
  </>
);

export default function Home() {
  const [bestCategory, setBestCategory] = useState(CATEGORIES[0]);
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [products, setProducts] = useState([]);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e) {
      console.error(`Load Products Error: ${e.message}`);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const getProducts = (feature, category) =>
    products.filter((p) => p[feature] && p.category === category).slice(0, 10);

  const bestProducts = getProducts("isBest", bestCategory);
  const newProducts = getProducts("isNew", newCategory);

  return (
    <div>
      <div className="h-[300px] w-full bg-stone-200"></div>
      <div className="mx-auto w-full max-w-[1200px] px-4">
        <ProductSection
          title="WEEKLY BEST"
          products={bestProducts}
          selectedCategory={bestCategory}
          onSelectCategory={setBestCategory}
        />
        <ProductSection
          title="NEW ARRIVALS"
          products={newProducts}
          selectedCategory={newCategory}
          onSelectCategory={setNewCategory}
        />
      </div>
    </div>
  );
}
