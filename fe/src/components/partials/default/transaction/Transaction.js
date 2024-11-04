import React, { useEffect, useState } from "react";
import UserAvatar from "../../../user/UserAvatar";
import { CardTitle, Badge, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import { DataTableBody, DataTableHead, DataTableItem, DataTableRow } from "../../../table/DataTable";
import authApi from "../../../../utils/ApiAuth";

const TransactionTable = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [trans, setTrans] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await authApi.get("/dashboard/manager");
        if (response.data.statusCode === 200) {
          setActiveUsers(response.data.data.listActive);
          setInactiveUsers(response.data.data.listInactive);
        } else {
          console.error("Failed to fetch data:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const dataToDisplay = trans === "active" ? activeUsers : inactiveUsers;

  // Calculate total pages
  const totalPages = Math.ceil(dataToDisplay.length / itemsPerPage);

  // Ensure current page is within valid range
  const validCurrentPage = Math.min(currentPage, totalPages);

  // Get current page data
  const currentData = dataToDisplay.slice((validCurrentPage - 1) * itemsPerPage, validCurrentPage * itemsPerPage);

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  return (
    <React.Fragment>
      <div className="card-inner">
        <div className="card-title-group">
          <CardTitle>
            <h6 className="title">
              <span className="me-2">Users overview</span>{" "}
            </h6>
          </CardTitle>
          <div className="card-tools">
            <ul className="card-tools-nav">
              <li
                className={trans === "inactive" ? "active" : ""}
                onClick={() => {
                  setTrans("inactive");
                  setCurrentPage(1);
                }}
              >
                <a
                  href="#inactive"
                  onClick={(ev) => {
                    ev.preventDefault();
                  }}
                >
                  <span>Inactive</span>
                </a>
              </li>
              <li
                className={trans === "active" ? "active" : ""}
                onClick={() => {
                  setTrans("active");
                  setCurrentPage(1);
                }}
              >
                <a
                  href="#active"
                  onClick={(ev) => {
                    ev.preventDefault();
                  }}
                >
                  <span>Active</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {dataToDisplay.length === 0 ? (
        <div className="text-center p-3">
          <p>No users found for {trans === "active" ? "Active" : "Inactive"} status.</p>
        </div>
      ) : (
        <DataTableBody className="border-top" bodyclass="nk-tb-orders">
          <DataTableHead>
            <DataTableRow>
              <span>Full name</span>
            </DataTableRow>
            <DataTableRow size="md">
              <span>Email</span>
            </DataTableRow>
            <DataTableRow>
              <span className="d-none d-sm-inline">Status</span>
            </DataTableRow>
          </DataTableHead>
          {currentData.map((item, idx) => {
            return (
              <DataTableItem key={idx}>
                <DataTableRow>
                  <div className="user-card">
                    <UserAvatar size="sm" text={item.fullName.charAt(0)}></UserAvatar>
                    <div className="user-name">
                      <span className="tb-lead">{item.fullName}</span>
                    </div>
                  </div>
                </DataTableRow>
                <DataTableRow size="md">
                  <span className="tb-sub">{item.email}</span>
                </DataTableRow>
                <DataTableRow>
                  <Badge className="badge-dot badge-dot-xs" color={trans === "active" ? "success" : "danger"}>
                    {trans === "active" ? "Active" : "Inactive"}
                  </Badge>
                </DataTableRow>
              </DataTableItem>
            );
          })}
        </DataTableBody>
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="card-inner">
          <Pagination aria-label="Page navigation">
            <PaginationItem disabled={validCurrentPage === 1}>
              <PaginationLink
                first
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageClick(1);
                }}
              />
            </PaginationItem>
            <PaginationItem disabled={validCurrentPage === 1}>
              <PaginationLink
                previous
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageClick(validCurrentPage - 1);
                }}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem active={i + 1 === validCurrentPage} key={i}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageClick(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem disabled={validCurrentPage === totalPages}>
              <PaginationLink
                next
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageClick(validCurrentPage + 1);
                }}
              />
            </PaginationItem>
            <PaginationItem disabled={validCurrentPage === totalPages}>
              <PaginationLink
                last
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageClick(totalPages);
                }}
              />
            </PaginationItem>
          </Pagination>
        </div>
      )}
    </React.Fragment>
  );
};

export default TransactionTable;
