import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { fetchProduct } from "@/utils/api";

import clsx from "clsx";
import ProductPrice from "@/components/ProductPrice";
import ProductBadges from "@/components/ProductBadges";
import QuantityButton from "@/components/QuantityButton";

const ColorButtons = ({ colors, curColor, onChangeColor }) => (
  <div className="space-y-3">
    <div className="font-bold">
      {colors.find((c) => c.id === curColor)?.color}
    </div>
    <div className="space-x-1 flex">
      {colors.map((c) => (
        <div key={c.id} onClick={() => onChangeColor(c.id)}>
          <div
            className={clsx(
              "border cursor-pointer",
              c.id === curColor
                ? "border-[#0063ba]"
                : "border-white hover:border-gray-300"
            )}
          >
            <img className="h-[44px]" src={c.image} alt="" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SizeButtons = ({ sizes, curSize, onChangeSize, disabledSizes }) => (
  <div className="space-y-3">
    <div className="font-bold">SIZE</div>
    <div className="flex flex-wrap gap-1">
      {sizes.map((s) => (
        <button
          key={s}
          onClick={() => onChangeSize(s)}
          className={clsx(
            "border border-[#0063ba] font-semibold flex items-center px-4 h-[38px] text-sm",
            disabledSizes.includes(s)
              ? "bg-gray-200 text-white border-gray-200"
              : curSize === s
              ? "bg-[#0063ba] text-white"
              : "text-[#0063ba] bg-white cursor-pointer"
          )}
        >
          {s}
        </button>
      ))}
    </div>
  </div>
);

const TrianglePointer = () => (
  <>
    <div className="absolute z-50 -top-[10px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[11px] border-r-[11px] border-b-[11px] border-l-transparent border-r-transparent border-b-[#203864]"></div>
    <div className="absolute z-50 -top-[9px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[11px] border-r-[11px] border-b-[11px] border-l-transparent border-r-transparent border-b-white"></div>
  </>
);

const Notification = ({ isVisible, onClose }) => {
  if (!isVisible) return null;
  return (
    <div className="absolute w-[200px] bottom-2 left-[25%] transform -translate-x-[50%]">
      <TrianglePointer />
      <div className="absolute w-full bg-white border border-[#203864] p-4 text-center text-sm flex flex-col gap-4">
        <div>
          장바구니에 상품이
          <br />
          추가되었습니다.
        </div>
        <div className="flex justify-between gap-1">
          <Link
            to={"/shopping/cart"}
            className="flex-grow border border-[#203864] bg-[#203864] text-white px-3 py-2 rounded-md text-sm font-semibold block"
          >
            장바구니
          </Link>
          <button
            className="flex-grow cursor-pointer border border-[#203864] bg-white text-[#203864] px-3 py-2 rounded-md text-sm font-semibold block"
            onClick={() => onClose(false)}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  // const product = productData.find((p) => p.productId === id);

  const [image, setImage] = useState(0);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(1);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const loadProduct = async () => {
    try {
      const data = await fetchProduct(id);
      setProduct(data);
    } catch (e) {
      console.error(`Load Product Error: ${e.message}`);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (Array.isArray(product?.sizes) && product.sizes.length) {
      setSize(product.sizes[0]);
    } else {
      setSize(null);
    }
  }, [product?.sizes]);

  useEffect(() => {
    if (isAdded) {
      const timer = setTimeout(() => setIsAdded(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAdded]);

  if (!product) {
    return null;
  }

  const {
    productId,
    keyImage,
    title,
    price,
    badges,
    sizes,
    disabledSizes,
    isSoldOut,
    priceBefore,
    saleRate,
    thumbs,
    titleEn,
  } = product;

  const images = [...(Array.isArray(thumbs) ? thumbs : [])].filter(Boolean);

  const colors = [
    {
      id: 1,
      color: "BLK",
      image:
        "https://cdn.skecherskorea.co.kr/pro_img/SL0WPCFY051_1.jpg?v=250904",
    },
    {
      id: 2,
      color: "NAT",
      image:
        "https://cdn.skecherskorea.co.kr/pro_img/SL0WPCFY052_1.jpg?v=250904",
    },
  ];

  const safeSizes = Array.isArray(sizes) ? sizes : [];
  const safeDisabledSizes = Array.isArray(disabledSizes) ? disabledSizes : [];
  const safeBadges = Array.isArray(badges) ? badges : [];

  // const handleQuantity = (isPlus) => {
  //   setQuantity((q) => (isPlus ? Math.min(q + 1, 10) : Math.max(1, q - 1)));
  // };

  const handleCart = () => {
    addToCart({
      productId,
      size,
      quantity,
      title,
      price,
      priceBefore,
      saleRate,
      keyImage,
    });
    setIsAdded(true);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4">
      <div className="py-8 flex space-x-8">
        <div className="space-y-2 max-w-[600px]">
          <div className="bg-gray-100 aspect-square max-w-[600px]">
            <div className="relative cursor-crosshair bg-gray-100 w-[600px] h-[600px] overflow-hidden">
              <img
                alt=""
                draggable="false"
                className="w-full h-full object-cover pointer-events-none select-none will-change-transform transition-transform duration-600"
                src={images[image]}
              />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {images.map((i, index) => (
              <div
                className={clsx(
                  "border p-2 aspect-square cursor-pointer",
                  index === image ? "border-[#0063ba]" : "border-gray-200"
                )}
                key={index}
                onClick={() => setImage(index)}
              >
                <img src={i} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex-grow space-y-3">
          <div className="font-extrabold text-4xl">{title}</div>
          <div className="font-bold text-gray-500">{titleEn}</div>
          <ProductBadges
            badges={safeBadges}
            containerClass={"pb-4 text-xl flex gap-3"}
          />
          <ProductPrice
            saleRate={saleRate}
            price={price}
            priceBefore={priceBefore}
          />
          <div className="font-bold text-gray-700">
            {productId} {colors.find((c) => c.id === color)?.color}
          </div>
          <ColorButtons
            colors={colors}
            curColor={color}
            onChangeColor={setColor}
          />
          <SizeButtons
            sizes={safeSizes}
            curSize={size}
            onChangeSize={setSize}
            disabledSizes={safeDisabledSizes}
          />
          {!isSoldOut && (
            <QuantityButton
              quantity={quantity}
              onQuantityChange={setQuantity}
              sectionTitle={"QTY"}
            />
          )}
          <div className="space-y-1 pt-8 relative">
            {!isSoldOut && (
              <button className="cursor-pointer border border-[#0063ba] font-semibold items-center bg-[#0063ba] text-white block w-full px-4 h-[60px] text-lg justify-center">
                <div>바로구매</div>
              </button>
            )}

            <div className="flex space-x-1">
              {!isSoldOut ? (
                <button
                  className="relative cursor-pointer border border-[#0063ba] font-semibold items-center text-[#0063ba] bg-white block w-full px-4 h-[60px] text-lg justify-center"
                  onClick={handleCart}
                  disabled={!size}
                >
                  <div>장바구니</div>
                </button>
              ) : (
                <button
                  className="relative border border-[#203864] font-semibold items-center text-[#203864] bg-white block w-full px-4 h-[60px] text-lg justify-center"
                  onClick={handleCart}
                  disabled
                >
                  <div>품절</div>
                </button>
              )}

              <button className="cursor-pointer border border-[#0063ba] font-semibold items-center text-[#0063ba] bg-white block w-full px-4 h-[60px] text-lg justify-center">
                <div>위시리스트</div>
              </button>
            </div>
            <Notification isVisible={isAdded} onClose={setIsAdded} />
          </div>
        </div>
      </div>
    </div>
  );
}
