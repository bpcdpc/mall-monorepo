// ScrollToTop.jsx
import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop({ containerId, top = 0, left = 0 }) {
  const { key } = useLocation();

  useLayoutEffect(() => {
    const el = containerId ? document.getElementById(containerId) : null;
    if (el) el.scrollTo({ top, left, behavior: "auto" });
    else window.scrollTo({ top, left, behavior: "auto" });
  }, [key]); // 라우트 전환마다 실행

  return null;
}
