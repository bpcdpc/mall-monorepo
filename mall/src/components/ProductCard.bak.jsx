import StarRating from "@/components/StarRating";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ProductCard({ soldout = false }) {
  const thumb =
    "https://cdn.skecherskorea.co.kr/pro_img/SL0WPCFY052_1.jpg?v=250904";
  const thumbHover =
    "https://cdn.skecherskorea.co.kr/pro_img/SL0WPCFY052_6.jpg?v=250904";
  const [src, setSrc] = useState(thumb);

  useEffect(() => {
    const img = new Image();
    img.src = thumbHover;
  }, [thumbHover]);

  return (
    <Link to="/products/detail/1">
      <div className="py-2 space-y-2 group min-h-[500px]">
        <div className="bg-stone-100 w-[200px] h-[200px] relative">
          {/* <img src="https://cdn.skecherskorea.co.kr/pro_img/SL0WPCFY052_1.jpg?v=250904" data-onover="https://cdn.skecherskorea.co.kr/pro_img/SL0WPCFY052_6.jpg?v=250904" data-onout="https://cdn.skecherskorea.co.kr/pro_img/SL0WPCFY052_1.jpg?v=250904" name="7278"></img> */}
          <img
            src={src}
            onMouseEnter={() => setSrc(thumbHover)}
            onMouseLeave={() => setSrc(thumb)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {soldout && (
            <div className="absolute top-0 left-0 bottom-0 right-0 bg-black/20 flex items-center justify-center">
              <div className="text-white font-extrabold text-2xl">SOLD OUT</div>
            </div>
          )}
        </div>
        <div className="hidden space-x-2 group-hover:flex">
          <div className="py-1 hover:border-b border-[#0063ba]">
            <img
              className="h-[44px]"
              src="https://cdn.skecherskorea.co.kr/pro_img/SL0WPCFY051_1.jpg?v=250904"
            />
          </div>
          <div className="py-1 border-b border-[#0063ba]">
            <img
              className="h-[44px]"
              src="https://cdn.skecherskorea.co.kr/pro_img/SL0WPCFY052_1.jpg?v=250904"
            />
          </div>
        </div>
        <div className="font-bold">
          고런 맥스쿠셔닝 아치핏 (와이드 슬립인스)
        </div>
        <StarRating score={2.4} count={101} />
        <div className="text-gray-500">
          <span className="font-bold mr-0.5 text-black">159,000</span>원
        </div>
        <div className="block w-fit text-white text-[8pt] font-bold px-2 py-0.5 bg-[#203864]">
          NEW
        </div>
        <div className="block w-fit text-white text-[8pt] font-bold px-2 py-0.5 bg-[#0063ba]">
          BEST
        </div>
        <div className="text-gray-400 py-1 relative">
          <div className="font-bold text-[8pt] pb-2">SIZE</div>
          <div className="absolute hidden group-hover:block z-10 border-t-2 w-full border-gray-200">
            <div className="grid grid-cols-7 text-[8pt] gap-2 py-2 bg-white">
              <div>225</div>
              <div>230</div>
              <div className="text-gray-300">235</div>
              <div>240</div>
              <div>245</div>
              <div>250</div>
              <div className="text-gray-300">255</div>
              <div>260</div>
              <div className="text-gray-300">265</div>
              <div>270</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
