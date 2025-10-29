import { useCart } from "@/contexts/CartContext";
import { formatCurrency, formatPrice } from "@/utils/formatters";
import { Link } from "react-router-dom";
import QuantityButton from "@/components/QuantityButton";
import { useState } from "react";
import Button from "@/components/Button";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart } = useCart();

  const [selectedItems, setSelectedItems] = useState(
    cart.map((item) => item.cartItemId)
  );

  const toggleItems = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleItemAll = () => {
    setSelectedItems((prev) =>
      prev.length === cart.length && cart.length !== 0
        ? []
        : cart.map((item) => item.cartItemId)
    );
  };

  const totalPrice = cart
    .filter((item) => selectedItems.includes(item.cartItemId))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const FREE_SHIPPING_THRESHOLD = 100000;
  const SHIPPING_FEE = 3000;
  const shippingCost =
    totalPrice >= FREE_SHIPPING_THRESHOLD || totalPrice == 0 ? 0 : SHIPPING_FEE;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4">
      <div className="py-8 space-y-4">
        <div className="font-bold text-3xl pb-4">장바구니</div>
        <div className="space-y-8">
          <div>
            <div className="font-bold mb-2">주문상품</div>
            <table className="w-full border-t border-t-gray-600">
              <thead className="border-b border-b-gray-300 text-gray-600">
                <tr>
                  <th className="px-4 font-normal text-sm py-4 text-center w-[80px]">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.length === cart.length &&
                        cart.length !== 0
                      }
                      onClick={toggleItemAll}
                    />
                  </th>
                  <th className="px-4 font-normal text-sm py-4 text-center w-[160px]">
                    상품이미지
                  </th>
                  <th className="px-4 font-normal text-sm py-4 text-center">
                    상품정보
                  </th>
                  <th className="px-4 font-normal text-sm py-4 text-right w-[170px]">
                    상품가격
                  </th>
                  <th className="px-4 font-normal text-sm py-4 pl-16 text-center w-[220px]">
                    수량
                  </th>
                  <th className="px-4 font-normal text-sm py-4 text-right w-[170px]">
                    합계
                  </th>
                  <th className="px-4 font-normal text-sm py-4 text-center w-[70px]">
                    삭제
                  </th>
                </tr>
              </thead>
              <tbody>
                {cart.length > 0 ? (
                  cart.map((i) => (
                    <tr key={i.cartItemId}>
                      <td className="px-4 py-4 font-normal text-sm text-center w-[80px]">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(i.cartItemId)}
                          onChange={() => toggleItems(i.cartItemId)}
                        />
                      </td>
                      <td className="px-4 font-normal text-sm py-4 w-[160px]">
                        <Link to={`/products/detail/${i.productId}`}>
                          <img src={i.keyImage} alt={i.title} />
                        </Link>
                      </td>
                      <td className="px-4 font-normal text-sm py-4">
                        <div>
                          <Link
                            to={`/products/detail/${i.productId}`}
                            className="text-xl font-semibold"
                          >
                            {i.title}
                          </Link>
                        </div>
                        {i.size && (
                          <div className="text-xs text-gray-500">
                            사이즈: {i.size}
                          </div>
                        )}
                      </td>
                      <td className="px-4 font-normal text-lg py-4 text-right space-x-1 w-[170px]">
                        {i.saleRate !== 0 && (
                          <div className="text-sm text-[#b91515]">
                            <span className="line-through">
                              {formatCurrency(i.priceBefore)}
                            </span>
                            <span>({i.saleRate}%)</span>
                          </div>
                        )}
                        <span>{formatCurrency(i.price)}</span>
                      </td>
                      <td className="px-4 font-normal text-lg py-4 pl-16 text-center w-[220px]">
                        <QuantityButton
                          quantity={i.quantity}
                          onQuantityChange={(newQuantity) =>
                            updateQuantity(i.cartItemId, newQuantity)
                          }
                        />
                      </td>
                      <td className="px-4 font-normal text-lg py-4 text-right w-[170px]">
                        {formatCurrency(i.price * i.quantity)}
                      </td>
                      <td className="px-4 font-normal text-lg py-4 text-center w-[70px]">
                        <button
                          className="cursor-pointer"
                          onClick={() => removeFromCart(i.cartItemId)}
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">
                      <div className="text-xs text-gray-400 flex flex-col items-center py-16">
                        <img width="75" src="/images/cart_empty.png" />
                        <div>장바구니에 담긴 상품이 없습니다.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center space-x-8 justify-center py-8 border-4 border-gray-200">
            <div>
              상품금액 <strong>{formatPrice(totalPrice)}</strong>원
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              ></path>
            </svg>
            <div>
              배송비 <strong>{formatPrice(shippingCost)}</strong>원
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.499 8.248h15m-15 7.501h15"
              ></path>
            </svg>
            <div className="text-[#0063ba]">
              결제예정금액{" "}
              <strong>{formatPrice(totalPrice + shippingCost)}</strong>원
            </div>
          </div>
          <div className="text-xs text-gray-500 text-center">
            {formatPrice(FREE_SHIPPING_THRESHOLD)}원 이상 구매시 배송비 무료.
            배송지에 따라 배송비가 추가될 수 있습니다.
          </div>
          <div className="flex gap-6 items-center justify-center">
            <Button primary={true} size={"lg"}>
              선택한 상품 결제
            </Button>
            <Button size={"lg"}>전체 상품 결제</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
