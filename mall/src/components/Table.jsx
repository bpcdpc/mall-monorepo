export default function Table({ title, heads, rows }) {
  return (
    <div>
      <div className="font-bold mb-2">{title}</div>
      <table className="w-full border border-t-0 border-gray-200">
        <thead className="bg-stone-50">
          <tr className="flex border-t ">
            {heads?.map((head, idx) => (
              <th
                key={`head-${idx}`}
                className={`px-4 font-normal text-sm py-4 ${
                  head?.isFull ? "flex-grow" : ""
                }`}
              >
                {head?.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={heads.length}>
                <div className="text-xs text-gray-400 flex flex-col items-center py-16">
                  <img src="/images/cart_empty.png" width="75" />
                  <div>장바구니에 담긴 상품이 없습니다.</div>
                </div>
              </td>
            </tr>
          ) : (
            rows?.map((r) => (
              <tr key={r}>
                <td colSpan={heads.length}>{r}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
