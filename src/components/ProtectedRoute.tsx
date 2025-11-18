import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import type { ReactNode } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const loggedInUser = Cookies.get("loggedInUser");

  if (!loggedInUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
