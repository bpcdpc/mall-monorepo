import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatComma = (value) => {
  if (value === null || value === undefined || value === "") return "";
  // 문자열에 이미 콤마가 있으면 제거 후 숫자화
  const num =
    typeof value === "string"
      ? Number(value.replaceAll(",", ""))
      : Number(value);
  if (!Number.isFinite(num)) return String(value); // 숫자 변환 불가 시 원본 반환
  return num.toLocaleString("ko-KR");
};
