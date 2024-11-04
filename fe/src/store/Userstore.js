import create from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      isAuth: false,
      user: {
        active: false,
        id: null,
        username: null,
        fullname: null,
        gender: null,
        email: null,
        mobile: null,
        avatar_url: null,
        note: null,
        roleId: null,
      },
      role: null,

      setLogin: (data) =>
        set(() => {
          return {
            token: data.token,
            isAuth: true,
            user: {
              active: true,
              id: data.user.id,
              username: data.user.username,
              fullname: data.user.fullname,
              gender: data.user.gender,
              email: data.user.email,
              mobile: data.user.mobile,
              avatar_url: data.user.avatar_url,
              note: data.user.note,
              roleId: data.user.roleId,
            },
            role: data.role,
          };
        }),

      setLogout: () =>
        set(() => {
          localStorage.clear();
          return {
            token: null,
            isAuth: false,
            user: {
              active: false,
              id: null,
              username: null,
              fullname: null,
              gender: null,
              email: null,
              mobile: null,
              avatar_url: null,
              note: null,
              roleId: null,
            },
            role: null,
          };
        }),
    }),
    {
      name: "authstore",
    }
  )
);

export default useAuthStore;
