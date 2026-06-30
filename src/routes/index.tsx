import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Dashboard from "../pages/Dashboard";
import MaterialsPage from "../pages/MaterialsPage";
import QuizPlayer from "../pages/QuizPlayer";
import QuizManagement from "../pages/QuizManagement";
import Flashcards from "../pages/Flashcards";
import Statistics from "../pages/Statistics";
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
        path: "materiales/:subjectId",
        element: <MaterialsPage />,
      },
      {
        path: "cuestionario/:subjectId",
        element: <QuizPlayer />,
      },
      {
        path: "cuestionario-gestion/:subjectId",
        element: <QuizManagement />,
      },
      {
        path: "flashcards/:subjectId",
        element: <Flashcards />,
      },
      {
        path: "estadisticas/:subjectId",
        element: <Statistics />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
