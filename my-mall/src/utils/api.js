const BASE_URL = "http://localhost:4000/api";

// 모든 상품 목록을 가져옴
export const fetchProducts = async () => {
  try {
    const res = await fetch(`${BASE_URL}/products`);
    if (!res.ok) throw new Error(`Server Response Error: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(`Fetch Products Error: ${e.message}`);
    throw e;
  }
};

// 특정 상품 정보를 가져옴
export const fetchProduct = async (productId) => {
  try {
    const res = await fetch(`${BASE_URL}/products/${productId}`);
    if (!res.ok) throw new Error(`Server Response Error: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(`Fetch Product Error: ${e.message}`);
    throw e;
  }
};

// 매장 목록을 가져옴
export const fetchStores = async () => {
  try {
    const res = await fetch(`${BASE_URL}/stores`);
    if (!res.ok) throw new Error(`Server Response Error: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(`Fetch Stores Error: ${e.message}`);
    throw e;
  }
};
