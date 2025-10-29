export default function QuantityButton({
  quantity,
  onQuantityChange,
  sectionTitle = "",
  min = 1,
  max = 10,
}) {
  const handleQuantity = (isPlus) => {
    const newQuantity = isPlus ? quantity + 1 : quantity - 1;
    const clampedQuantity = Math.max(min, Math.min(max, newQuantity));
    onQuantityChange(clampedQuantity);
  };

  return (
    <>
      {sectionTitle && <div className="font-bold">QTY</div>}
      <div className="flex h-[38px] w-full max-w-[280px] border border-gray-300 overflow-hidden">
        <button
          type="button"
          disabled={quantity <= min}
          aria-label="수량 감소"
          className="w-10 cursor-pointer shrink-0 grid place-items-center text-lg disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-gray-50"
          onClick={() => handleQuantity(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14"
            ></path>
          </svg>
        </button>
        <div className="flex-1 grid place-items-center text-lg select-none">
          {quantity}
        </div>
        <button
          type="button"
          disabled={quantity >= max}
          aria-label="수량 증가"
          className="w-10 cursor-pointer shrink-0 grid place-items-center text-lg disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-gray-50"
          onClick={() => handleQuantity(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            ></path>
          </svg>
        </button>
      </div>
    </>
  );
}
