// 전역 유틸리티 함수들

/**
 * 가격 포맷팅
 */
export const formatPrice = (price) => {
  return price?.toLocaleString() || "0";
};

/**
 * 통화 포맷팅
 */
export const formatCurrency = (price, currency = "KRW") => {
  if (!price) return "0원";
  const formatted = price.toLocaleString();
  return currency === "KRW" ? `${formatted}원` : `${currency} ${formatted}`;
};

/**
 * 할인율 계산
 */
export const calculateDiscountRate = (originalPrice, salePrice) => {
  if (!originalPrice || !salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

/**
 * 날짜 포맷팅
 */
export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ko-KR");
};

/**
 * 문자열 자르기
 */
export const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};
