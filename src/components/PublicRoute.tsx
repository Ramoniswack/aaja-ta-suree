import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import type { ReactNode } from "react";

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const loggedInUser = Cookies.get("loggedInUser");

  if (loggedInUser) {
    return <Navigate to="/todo" replace />;
  }

  return children;
};

export default PublicRoute;
