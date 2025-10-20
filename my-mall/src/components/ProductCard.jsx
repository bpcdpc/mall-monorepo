import { Link } from "react-router-dom";
import StarRating from "@/components/StarRating";
import clsx from "clsx";
import ProductPrice from "@/components/ProductPrice";
import ProductBadges from "@/components/ProductBadges";

export default function ProductCard({
  productId,
  title,
  price,
  priceBefore,
  saleRate,
  badges,
  reviewRating,
  reviewCount,
  sizes,
  disabledSizes,
  keyImage,
  isSoldOut,
}) {
  return (
    <Link to={`/products/detail/${productId}`} data-discover="true">
      <div className="py-2 space-y-2 h-[500px] group">
        <div className="bg-stone-100 w-[200px] h-[200px] relative">
          {isSoldOut && (
            <div className="absolute w-full h-full bg-black/20 flex items-center justify-center text-white font-bold text-xl">
              SOLD OUT
            </div>
          )}
          <img src={keyImage} className="w-full aspect-square" />
        </div>
        <div className="hidden space-x-2 group-hover:flex">
          <div className="py-1 hover:border-b border-[#0063ba]">
            <img className="h-[44px]" src={keyImage} />
          </div>
          <div className="py-1 border-b border-[#0063ba]">
            <img
              className="h-[44px]"
              src="https://cdn.skecherskorea.co.kr/pro_img/SL0WPCFY052_1.jpg?v=250904"
            />
          </div>
        </div>
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
    </Link>
  );
}
