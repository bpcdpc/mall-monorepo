import { Outlet, Link } from "react-router-dom";
export default function GlobalLayout() {
  return (
    <div className="min-h-screen">
      <nav className="p-4 border-b flex gap-4 ">
        <Link to="/">홈</Link>
        {/* <Link to="/products/women">women</Link>
        <Link to="/products/men">men</Link>
        <Link to="/products/kids">kids</Link> */}
        <Link to="/mgr/product">상품관리</Link>
        <Link to="/mgr/store">매장관리</Link>
      </nav>
      <main className="h-full">
        <Outlet />
      </main>
    </div>
  );
}
