export default function Select({ children, defaultValue, ...rest }) {
  return (
    <div className="relative inline-block">
      <select
        defaultValue={defaultValue || ""}
        className="min-w-[150px] text-sm rounded border border-gray-200 bg-white px-4 py-2 pr-8 appearance-none"
        {...rest}
      >
        {children}
      </select>

      {/* 오른쪽 화살표 */}
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
        <svg
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
