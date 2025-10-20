import Table from "@/components/Table";

export default function ShorppingOrderTable() {
  const heads = [
    {
      title: "상품명",
      isFull: true,
    },
    {
      title: "정가",
    },
    {
      title: "상품가격",
    },
    {
      title: "수량",
    },
    {
      title: "합계",
    },
    {
      title: "삭제",
    },
  ];
  return (
    <div className="space-y-8">
      <Table title="주문상품" heads={heads} />
      <div className="flex items-center space-x-8 justify-center py-8 border-4 border-gray-200">
        <div>
          상품금액 : <strong>0</strong>원
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        <div>
          배송비 <strong>0</strong>원
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.499 8.248h15m-15 7.501h15"
          />
        </svg>
        <div className="text-[#0063ba]">
          결제예정금액 <strong>0</strong>원
        </div>
      </div>
    </div>
  );
}
