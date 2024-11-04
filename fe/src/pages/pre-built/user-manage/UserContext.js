import React, { useState, createContext } from "react";
import { Outlet } from "react-router-dom";
import { userData } from "./UserData";
export const UserContext = createContext();

//context này là data mẫu từ template


export const UserContextProvider = (props) => {
  const [data, setData] = useState(userData);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDataBE, setUserDataBE] = useState(null); // Thêm state mới để lưu thông tin người dùng

  const login = (userData) => {
    setIsAuthenticated(true);
    setUserDataBE(userData); // Lưu thông tin người dùng sau khi đăng nhập
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserDataBE(null); // Xóa thông tin người dùng khi đăng xuất
  };


  return (
    <UserContext.Provider
      value={{
        contextData: [data, setData],
        contextDataBE: [userDataBE, setUserDataBE], // Cung cấp state mới trong context
        isAuthenticated: isAuthenticated,
        login: login,
        logout: logout,
      }}>
      <Outlet />
    </UserContext.Provider>
  );
};
