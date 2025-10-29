import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import GlobalLayout from "@/layouts/GlobalLayout";

import Home from "@/pages/Home";
import Loading from "@/components/Loading";

const Category = lazy(() => import("@/pages/Category"));
const Product = lazy(() => import("@/pages/Product"));
const Cart = lazy(() => import("@/pages/Cart"));
const Stores = lazy(() => import("@/pages/Stores"));
const NotFound = lazy(() => import("@/pages/NotFount"));

import "@/App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <GlobalLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "products/:category", element: <Category /> },
      { path: "products/detail/:id", element: <Product /> },
      { path: "shopping/cart", element: <Cart /> },
      { path: "store", element: <Stores /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
