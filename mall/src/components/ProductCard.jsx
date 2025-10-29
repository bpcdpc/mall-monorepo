import { Link } from "react-router-dom";
import StarRating from "@/components/StarRating";
import clsx from "clsx";
import ProductPrice from "@/components/ProductPrice";
import ProductBadges from "@/components/ProductBadges";
import { useState, useMemo, useEffect, useCallback } from "react";

export default function ProductCard({
  productId,
  title,
  price,
  priceBefore,
  saleRate,
  badges,
  reviewRating,
  reviewCount,
  sizes = [],
  disabledSizes = [],
  keyImage,
  isSoldOut,
  colorVariantImages = [],
  colorVariantIds = [],
}) {
  // 1) 파생 데이터는 useMemo로 계산
  const colors = useMemo(() => {
    return colorVariantImages
      .map((image, i) => ({ image, id: colorVariantIds[i] ?? null }))
      .filter((c) => c.id !== null);
  }, [colorVariantImages, colorVariantIds]);

  // 2) 초기/기준 색상은 props 기반 파생값으로 결정
  const baseColorId = useMemo(() => {
    if (colorVariantIds.length === 0) return null;
    return colorVariantIds.includes(productId) ? productId : colorVariantIds[0];
  }, [colorVariantIds, productId]);

  // 3) UI 상호작용 상태는 state로 보유 (호버 시 교체)
  const [curColorId, setCurColorId] = useState(baseColorId);

  // 4) 기준 값이 바뀌면 상태를 동기화 (리스트 → 상세 이동 등 props 변화 대응)
  useEffect(() => {
    setCurColorId(baseColorId);
  }, [baseColorId]);

  // 5) 현재 보여줄 이미지/링크 파생
  const currentImage = useMemo(() => {
    if (!curColorId || curColorId === productId) return keyImage;
    return colors.find((c) => c.id === curColorId)?.image ?? keyImage;
  }, [curColorId, productId, keyImage, colors]);

  const currentLinkId =
    curColorId && curColorId !== productId ? curColorId : productId;

  const handleMouseLeave = useCallback(() => {
    setCurColorId(baseColorId);
  }, [baseColorId]);

  return (
    <div data-discover="true" onMouseLeave={handleMouseLeave}>
      <div className="py-2 space-y-2 h-[500px] group">
        <div className="bg-stone-100 w-[200px] h-[200px] relative">
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white font-bold text-xl">
              SOLD OUT
            </div>
          )}
          <Link to={`/products/detail/${currentLinkId}`}>
            <img
              src={currentImage}
              alt={title}
              className="w-full aspect-square"
            />
          </Link>
        </div>

        {colors.length > 0 && (
          <div className="hidden space-x-2 group-hover:flex">
            {colors.map((c) => (
              <Link to={`/products/detail/${c.id}`} key={c.id}>
                <div
                  className="py-1 border-b border-white hover:border-[#0063ba]"
                  onMouseEnter={() => setCurColorId(c.id)}
                >
                  <img
                    className="h-[44px]"
                    src={c.image}
                    alt={`${title} color`}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="font-bold">{title}</div>
        <StarRating score={reviewRating} count={reviewCount} />

        <ProductPrice
          saleRate={saleRate}
          price={price}
          priceBefore={priceBefore}
        />

        <ProductBadges badges={badges} />

        <div className="text-gray-500 py-1 relative">
          <div className="font-bold text-[8pt] pb-2">SIZE</div>
          <div className="absolute hidden group-hover:block z-10 border-t-2 w-full border-gray-200">
            <div className="grid grid-cols-7 text-[8pt] gap-2 py-2 bg-white">
              {sizes.map((s) => (
                <div
                  key={s}
                  className={clsx({
                    "text-gray-300 line-through": disabledSizes.includes(s),
                  })}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
