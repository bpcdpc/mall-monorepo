import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.svg";
import Container from "@/components/Container";
import ScrollToTop from "@/components/ScrollToTop";
import clsx from "clsx";
import { useState, useEffect } from "react";
import iconLogin from "@/assets/ico_login.svg";
import iconJoin from "@/assets/ico_join.svg";
import iconCart from "@/assets/ico_cart.svg";
import iconSearch from "@/assets/ico_search.svg";
import { useCart } from "@/contexts/CartContext";

function useShowWhenScrolled(threshold = 120) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisible(y > threshold);
          ticking = false;
        });
        ticking = true;
      }
    };

    onScroll(); // 초기 상태 반영
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return visible;
}

function ToTheTop() {
  const visible = useShowWhenScrolled(120);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <button
      onClick={scrollToTop}
      aria-label="맨 위로 이동"
      className={clsx(
        `cursor-pointer border-white border-2 rounded-full h-[60px] w-[60px] 
        flex flex-col items-center justify-center
        bg-[#0063ba] hover:bg-[#203864] text-white 
        transition-colors duration-200 
      `,
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3 pointer-events-none"
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m4.5 15.75 7.5-7.5 7.5 7.5"
        />
      </svg>
      <div className="text-xs font-bold">TOP</div>
    </button>
  );
}

function GlobalHeader() {
  const { cart } = useCart();

  return (
    <header className="border-b border-gray-200">
      <div className="bg-[#203864] text-white font-semibold h-[40px] text-sm flex justify-center items-center">
        <span>회원가입 시 즉시 사용가능한 10,000원 쿠폰 증정</span>
      </div>
      <Container>
        <div className="h-[30px] space-x-4 flex justify-end items-center text-gray-500 text-xs">
          <Link to="/" className="hover:text-black hover:underline">
            홈
          </Link>
          <Link to="/store" className="hover:text-black hover:underline">
            매장찾기
          </Link>
        </div>
        <div className="flex space-x-16 items-center h-[60px]">
          <Link to="/" className="h-[14px] shrink-0">
            <img src={logo} className="h-full" alt="logo" />
          </Link>
          <nav className="flex-grow flex items-center space-x-8 font-bold text-base">
            <Link to="/products/women">WOMEN</Link>
            <Link to="/products/men">MEN</Link>
            <Link to="/products/kids">KIDS</Link>
            <Link to="/products/best">BEST</Link>
            <Link to="/products/new">NEW</Link>
          </nav>
          <div className="flex space-x-5 items-center mr-4">
            <div className="flex text-sm font-bold rounded-lg text-white bg-[#203864]">
              <Link
                to="/login"
                className="flex space-x-1 items-center px-3 py-2 border-r border-white/30"
              >
                <img
                  src={iconLogin}
                  alt="cart"
                  className="text-white w-5 h-5"
                />
                <span>로그인</span>
              </Link>
              <Link
                to="/join"
                className="flex space-x-1 items-center px-3 py-2"
              >
                <img src={iconJoin} alt="cart" className="text-white w-5 h-5" />
                <span>회원가입</span>
              </Link>
            </div>
            <Link to="/shopping/cart" className="relative cursor-pointer">
              <img src={iconCart} alt="cart" className="w-5 h-5" />
              <div className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-[#0063ba] flex items-center justify-center">
                <div className="text-white text-[8pt] font-bold">
                  {cart.length}
                </div>
              </div>
            </Link>
            <div className="cursor-pointer">
              <img src={iconSearch} alt="search" className="w-5 h-5" />
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}

function GlobalFooter() {
  return (
    <footer className="mt-16 py-8 bg-gray-50 border-gray-200 flex items-center px-4 border-t">
      <Container>
        <div className="flex space-x-16">
          <div className="flex-grow space-y-8">
            <div className="flex space-x-16 items-center">
              <Link to="/" className="h-[14px] shrink-0">
                <img src={logo} className="h-full" alt="logo" />
              </Link>
              <nav className="flex-grow flex items-center space-x-8 font-bold text-base">
                <Link to="/">홈</Link>
                <Link to="/store">매장찾기</Link>
                <Link to="/shopping/cart">장바구니</Link>
              </nav>
            </div>
            <div className="text-xs">
              <div className="text-[8pt] text-gray-500">
                COPYRIGHT &copy; 2020 SKECHERS KOREA. ALL RIGHTS RESERVED.
              </div>
              <div className="pt-4 flex space-x-4 text-gray-600">
                <div>멤버쉽 이용약관</div>
                <div>
                  <strong>개인정보처리방침</strong>
                </div>
                <div>직영몰 구매 이용 약관</div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs">CS Center</div>
            <div className="font-bold text-lg">1899-5214</div>
            <ul className="text-[8pt] text-gray-500">
              <li>근무시간 : 10:00 ~ 17:00</li>
              <li>점심시간 : 12:00 ~ 13:00</li>
              <li>토요일, 일요일, 공휴일 휴무</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="text-xs">Membership</div>
            <div className="text-[8pt] text-gray-500 w-full max-w-[180px]">
              스케쳐스코리아 회원으로 가입하시면 다양한 혜택을 받으실 수
              있습니다.
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default function GlobalLayout() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <GlobalHeader />
      <main className="flex-grow">
        <ScrollToTop />
        <Outlet />
      </main>
      <GlobalFooter />
      <div className="fixed bottom-4 right-4 z-50">
        <ToTheTop />
      </div>
    </div>
  );
}
