import { useId } from "react";

// 단일 별: fillRatio(0~1)만큼 fullColor, 나머지는 emptyColor
function Star({
  size = 14,
  fillRatio = 0, // 0 ~ 1 (예: 0.5면 반쪽)
  fullColor = "#0063ba",
  emptyColor = "#d1d5db", // Tailwind gray-300
  className = "",
}) {
  const rid = useId(); // React 18+
  const gradId = `star-grad-${rid}`;

  // 0~100% 위치 계산
  const stop = Math.max(0, Math.min(1, fillRatio)) * 100;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset={`${stop}%`} stopColor={fullColor} />
          <stop offset={`${stop}%`} stopColor={emptyColor} />
        </linearGradient>
      </defs>

      {/* 그라디언트로 한 번에 채우기 */}
      <path
        fill={`url(#${gradId})`}
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
      />
    </svg>
  );
}

export default function StarRating({
  score = 4.3,
  size = 16,
  count = 0,
  className = "",
  fullColor = "#0063ba",
  emptyColor = "#d1d5db",
}) {
  const total = 5; // 만점은 별 5개 (score 5점)
  // 각 별의 채움 비율 계산
  const ratios = Array.from({ length: total }, (_, i) => {
    const remain = score - i;
    return Math.max(0, Math.min(1, remain)); // 0~1
  });

  return (
    <div className={`flex space-x-2 items-center ${className}`}>
      <div className="flex space-x-[-2px]">
        {ratios.map((r, i) => (
          <Star
            key={i}
            size={size}
            fillRatio={r}
            fullColor={fullColor}
            emptyColor={emptyColor}
            className="shrink-0"
          />
        ))}
      </div>
      <div className="text-xs text-gray-500">({count})</div>
    </div>
  );
}
