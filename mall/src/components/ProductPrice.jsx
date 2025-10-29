import { formatPrice } from "@/utils/formatters";

export default function ProductPrice({ saleRate, price, priceBefore }) {
  return (
    <div className="text-gray-500 flex gap-3">
      {saleRate !== 0 && (
        <div>
          <span className="font-bold text-[#b91515]">{saleRate}%</span>
        </div>
      )}
      <div>
        <span className="font-bold text-black">{formatPrice(price)}</span>원
      </div>
      {priceBefore !== price && (
        <div>
          <span className="font-bold text-gray-500 text-[90%] line-through">
            {formatPrice(priceBefore)}
          </span>
        </div>
      )}
    </div>
  );
}
