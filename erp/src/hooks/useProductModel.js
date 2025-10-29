import { useQuery } from "@tanstack/react-query";
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export default function useProductModel() {
  const query = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/products`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    // 옵션은 필요 시 조절
    // staleTime: 60_000, // 1분 동안 신선
    // gcTime: 5 * 60_000, // 5분 후 가비지 컬렉션
    // refetchOnWindowFocus: false,
  });

  // 사용 편의 리턴
  return {
    products: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
