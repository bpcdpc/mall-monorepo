import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import GlobalLayout from "./layouts/GlobalLayout.jsx";
import NotFound from "./pages/NotFound.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import MgrLayout from "./layouts/MgrLayout.jsx";
import MgrProduct from "./pages/MgrProduct.jsx";
import MgrStore from "./pages/MgrStore.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <GlobalLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
    ],
  },
  {
    path: "mgr",
    element: <MgrLayout />,
    children: [
      { index: true, element: <Navigate to="product" replace /> },
      { path: "product", element: <MgrProduct /> },
      { path: "store", element: <MgrStore /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

const queryClient = new QueryClient(); //

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
