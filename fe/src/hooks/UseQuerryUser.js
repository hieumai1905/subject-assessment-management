import { useEffect, useState } from "react";
import authApi from "../utils/ApiAuth";

const useQueryUser = ({
  currentPage,
  itemPerPage,
  totalElements,
  setTotalElements,
  searchUser,
  sortBy,
  orderBy,
  search,
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authApi.post("/user/search", {
          pageIndex: currentPage,
          pageSize: itemPerPage,
          keyWord: search?.keyWord,
          roleName: search?.roleName,
          sortBy: sortBy,
          status: search?.status,
          active: search?.active,
          orderBy: orderBy,
        });
        console.log("users: ", response.data.data);
        if (response.data.statusCode === 200) {
          setUsers(response.data.data);
          setTotalElements(response.data?.data?.totalElements);
        } else {
          setError(response.data.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("fetch users:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, itemPerPage, totalElements, search, sortBy, orderBy]);

  return { users, loading, error };
};

export default useQueryUser;
