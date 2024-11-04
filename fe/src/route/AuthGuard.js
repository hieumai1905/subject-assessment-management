import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/Userstore";
import Error403Classic from "../pages/error/403-classic";
import { canAccess } from "../utils/CheckPermissions";

const AuthGuard = ({ element }) => {
  const isAuth = useAuthStore((state) => state.isAuth);
  const { role } = useAuthStore((state) => state);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  if (!canAccess(role, location.pathname)) {
    return <Error403Classic />;
  } else {
    return element;
  }
};

export default AuthGuard;
