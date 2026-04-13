// TEMPLATE: merge sobre tu router principal
import React from "react";
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import NotFoundPage from "@/pages/NotFoundPage";
import AridosAppRuntime from "@/modules/aridos/integration/runtime/AridosAppRuntime.example";
import { createAridosFeatureRoutes } from "@/modules/aridos/integration/runtime/createAridosFeatureRoutes";

const aridosRoutes = createAridosFeatureRoutes("/aridos");

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/aridos",
        element: <AridosAppRuntime />,
        children: aridosRoutes.map((route) => ({
          path: route.path.replace("/aridos", "").replace(/^\//, "") || ".",
          element: route.element,
        })),
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
