import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";

const elem = document.getElementById("root")!;

createRoot(elem).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
