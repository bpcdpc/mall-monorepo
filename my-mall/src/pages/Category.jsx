import { useParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { fetchProducts } from "@/utils/api";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

export default function Category() {
  const { category } = useParams();

  const [products, setProducts] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [isDesc, setIsDesc] = useState({});

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

  useEffect(() => {
    setSelectedSizes([]);
    setSortBy("default");
    setIsDesc({});
  }, [category]);

  const categorizedProducts = products.filter((p) =>
    category === "new"
      ? p.isNew
      : category === "best"
      ? p.isBest
      : category === p.category
  );

  const sizes = [
    ...new Set(
      categorizedProducts.reduce((allSizes, p) => [...allSizes, ...p.sizes], [])
    ),
  ].sort();

  const filteredProducts =
    selectedSizes.length > 0
      ? categorizedProducts.filter((product) =>
          selectedSizes.some((size) => {
            const hasSize = product.sizes?.includes(size) || false;
            const isDisabled = product.disabledSizes?.includes(size) || false;
            return hasSize && !isDisabled;
          })
        )
      : categorizedProducts;

  const sortedProducts = useMemo(() => {
    if (sortBy === "title") {
      return [...filteredProducts].sort((a, b) =>
        isDesc.title
          ? b.title.localeCompare(a.title)
          : a.title.localeCompare(b.title)
      );
    }
    if (sortBy === "price") {
      return [...filteredProducts].sort((a, b) =>
        isDesc.price ? b.price - a.price : a.price - b.price
      );
    }
    return filteredProducts;
  }, [filteredProducts, sortBy, isDesc]);

  const toggleSelectedSizes = (curSize) =>
    setSelectedSizes((prev) =>
      prev.includes(curSize)
        ? prev.filter((sizes) => sizes !== curSize)
        : [...prev, curSize]
    );

  const handleSortAndOrder = (s) => {
    setSortBy(s);
    // 다른 정렬로 전환 시 해당 키만 남기고 초기값(ASC)으로 시작
    if (s !== "default") {
      setIsDesc((prev) => {
        // 새 키로 바뀌면 해당 키만 남기고 false(ASC)로 초기화
        if (s !== sortBy) return { [s]: false };
        // 같은 키면 토글
        return { [s]: !(prev[s] ?? false) };
      });
    } else {
      // 기본 정렬은 화살표 모두 제거
      setIsDesc({});
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4">
      <div className="py-8 grid grid-cols-5 gap-8">
        <div>
          <div className="font-bold text-3xl mb-2">신상품</div>
          <div className="font-bold text-xl mb-8 text-gray-500">
            {sortedProducts.length} Results
          </div>
          <div className="border-t py-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold">사이즈</div>
              {/* <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1"
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  ></path>
                </svg>
              </div> */}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {sizes.map((s) => (
                <button
                  onClick={() => toggleSelectedSizes(s)}
                  className={clsx(
                    "cursor-pointer border rounded text-center py-2 font-semibold text-xs",
                    selectedSizes.includes(s)
                      ? "text-white border-[#0063ba] bg-[#0063ba]"
                      : "text-gray-600 border-gray-300"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="flex h-[100px] justify-end items-center space-x-8">
            <div className="flex gap-4">
              <button
                className={clsx("cursor-pointer", {
                  "font-bold": sortBy === "default",
                })}
                onClick={() => handleSortAndOrder("default")}
              >
                신상품순
              </button>
              <button
                className={clsx("cursor-pointer", {
                  "font-bold": sortBy === "title",
                })}
                onClick={() => handleSortAndOrder("title")}
              >
                상품명순
                {isDesc.title === undefined ? (
                  ""
                ) : (
                  <span className="text-sm font-normal">
                    {isDesc.title ? "↑" : "↓"}
                  </span>
                )}
              </button>
              <button
                className={clsx("cursor-pointer", {
                  "font-bold": sortBy === "price",
                })}
                onClick={() => handleSortAndOrder("price")}
              >
                가격순
                {isDesc.price === undefined ? (
                  ""
                ) : (
                  <span className="text-sm font-normal">
                    {isDesc.price ? "↑" : "↓"}
                  </span>
                )}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span>필터닫기</span>
              <button
                type="button"
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 bg-[#0063ba]"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 translate-x-6"></span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...sortedProducts].map((p) => (
              <ProductCard key={p.productId} {...p} />
            ))}
          </div>
          <div className="flex justify-center mt-16">
            <div className="flex items-center space-x-4 w-fit px-10 py-3 rounded hover:text-[#203864] hover:border-[#203864] text-[#3382c8] border-2 border-[#3382c8] cursor-pointer">
              <div className="font-bold">LOAD MORE</div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
