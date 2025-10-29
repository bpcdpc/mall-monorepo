import { Outlet, Link, NavLink } from "react-router-dom";

function NavItem({ url, children, ...rest }) {
  return (
    <NavLink
      to={url}
      className={({ isActive }) =>
        `hover:bg-stone-200 rounded-lg px-3 py-1 ${
          isActive ? "text-purple-400 " : ""
        }`
      }
      {...rest}
    >
      {children}
    </NavLink>
  );
}

function SideBar() {
  return (
    <div className="py-8 px-3 flex flex-col space-y-2">
      <NavItem url="/">홈</NavItem>
      <NavItem url="/mgr/product">상품 관리</NavItem>
      <NavItem url="/mgr/store">매장 관리</NavItem>
    </div>
  );
}

export default function MgrLayout() {
  return (
    <div className="w-full h-screen flex ">
      <div className="w-[200px] h-screen overflow-auto bg-stone-100">
        <SideBar />
      </div>
      <div className="grow h-screen overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
