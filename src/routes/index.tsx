import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Dashboard from "../pages/Dashboard";
import MaterialsPage from "../pages/MaterialsPage";
import QuizPlayer from "../pages/QuizPlayer";
import NotFoundPage from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "materiales",
        element: <MaterialsPage />,
      },
      {
        path: "cuestionario",
        element: <QuizPlayer />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
