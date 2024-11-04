import React, { useContext, useEffect, useState } from "react";
import { DropdownMenu, DropdownToggle, UncontrolledDropdown, DropdownItem, Badge, Spinner } from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Row,
  Col,
  PaginationComponent,
  Button,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableItem,
  RSelect,
} from "../../../components/Component";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { filterRole, filterStatus, userData, filterGender } from "./UserData";
import { upDownArrow } from "../../../utils/Utils";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import EditModal from "./EditModal";
import AddModal from "./AddModal";
import useQueryUser from "../../../hooks/UseQuerryUser";
import authApi from "../../../utils/ApiAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChangeRoleModal from "./ChangeRoleModal";
import useAuthStore from "../../../store/Userstore";

const UserListRegularPage = () => {
  const { contextData } = useContext(UserContext);
  const [data, setData] = contextData;
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(7);
  const [searchUser, setSearchUser] = useState({
    keyWord: null,
    roleName: null,
    gender: null,
    active: null,
    status: null,
  });
  const { user } = useAuthStore();

  const [search, setSearch] = useState({});
  const [sortBy, setSortBy] = useState("id");
  const [orderBy, setOrderBy] = useState("desc");
  const [loadingReload, setLoadingReload] = useState(false); // Thêm state để quản lý trạng thái loading

  const {
    users: userDataBE,
    loading,
    error,
    refetch,
  } = useQueryUser({
    currentPage,
    itemPerPage,
    totalElements,
    setTotalElements,
    sortBy,
    orderBy,
    search,
  });

  if (error) {
    toast.error(`${error}`, {
      position: toast.POSITION.TOP_CENTER,
    });
  }
  useEffect(() => {
    if (userDataBE && userDataBE.users) {
      setLoadingReload(false); // Tắt loading sau khi dữ liệu được tải xong
      const newData = userDataBE.users.filter((item) => item.id !== user.id);
      setData([...newData]);
    }
  }, [userDataBE, user.id]);

  const [sm, updateSm] = useState(false);
  const [tablesm, updateTableSm] = useState(false);
  const [onSearch, setonSearch] = useState(true);
  const [onSearchText, setSearchText] = useState("");
  const [modal, setModal] = useState({
    edit: false,
    add: false,
    changerole: false,
  });
  const [editId, setEditedId] = useState();
  const [changeRoleId, setChangeroleId] = useState();

  const [formData, setFormData] = useState({
    email: "",
    status: "Active",
  });
  const [editFormData, setEditFormData] = useState({
    email: "",
    status: "",
  });

  const roleMap = {
    1: "Admin",
    2: "Manager",
    3: "Teacher",
    4: "Student",
  };
  const [actionText, setActionText] = useState("");
  const [sort, setSortState] = useState("");
  const [editUserClick, setEditUserClick] = useState("");

  const handleStatusChange = (selectedOption) => {
    setSearchUser({
      ...searchUser,
      status: selectedOption.value,
    });
  };

  const handleRoleChange = (selectedOption) => {
    setSearchUser({
      ...searchUser,
      roleName: selectedOption.value,
    });
  };
  const handleActiveChange = (selectedOption) => {
    setSearchUser({
      ...searchUser,
      active: selectedOption.value,
    });
  };

  useEffect(() => {
    let newData;
    newData = userData.map((item) => {
      item.checked = false;
      return item;
    });
    setData([...newData]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (onSearchText !== "") {
      const filteredObject = userData.filter((item) => {
        return (
          item.name.toLowerCase().includes(onSearchText.toLowerCase()) ||
          item.email.toLowerCase().includes(onSearchText.toLowerCase())
        );
      });
      setData([...filteredObject]);
    } else {
      setData([...userData]);
    }
  }, [onSearchText, setData]);

  useEffect(() => {
    if (userDataBE && userDataBE.users) {
      // Check if userDataBE and userDataBE.users are defined
      const newData = userDataBE.users.filter((item) => item.id !== user.id);
      setData([...newData]);
    }
  }, [userDataBE, user.id]);

  useEffect(() => {
    if (onSearchText !== "") {
      const filteredObject = userData.filter((item) => {
        return (
          item.name.toLowerCase().includes(onSearchText.toLowerCase()) ||
          item.email.toLowerCase().includes(onSearchText.toLowerCase())
        );
      });
      setData([...filteredObject]);
    } else {
      if (userDataBE && userDataBE.users) {
        const filteredData = userDataBE.users.filter((item) => item.id !== user.id);
        setData([...filteredData]);
      }
    }
  }, [onSearchText, userDataBE, user.id, setData]);

  const resetForm = () => {
    setFormData({
      email: "",
      status: "verified",
    });
  };

  const closeModal = () => {
    setModal({ add: false });
    resetForm();
  };

  const closeEditModal = () => {
    setModal({ edit: false });
    resetForm();
  };

  const closeChangeRoleModal = () => {
    setModal({ changerole: false });
  };

  const handleSort = (sortField) => {
    setSortBy(sortField);
    setOrderBy((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const onFormSubmit = (submitData) => {
    const { email } = submitData;
    let submittedData = {
      id: data.length + 1,
      avatarBg: "purple",
      role: "Customer",
      email: email,
      emailStatus: "success",
      kycStatus: "alert",
      lastLogin: "10 Feb 2020",
      status: formData.status,
      country: "Bangladesh",
    };
    setData([submittedData, ...data]);
    resetForm();
    setModal({ edit: false }, { add: false }, { changerole: false });
  };
  const navigate = useNavigate();

  const onEditSubmit = (submitData) => {
    const { name, email, phone } = submitData;
    let submittedData;
    let newitems = data;
    newitems.forEach((item) => {
      if (item.id === editId) {
        submittedData = {
          id: item.id,
          avatarBg: item.avatarBg,
          image: item.image,
          role: item.role,
          email: email,
          emailStatus: item.emailStatus,
          kycStatus: item.kycStatus,
          lastLogin: item.lastLogin,
          status: editFormData.status,
          country: item.country,
        };
      }
    });
    let index = newitems.findIndex((item) => item.id === editId);
    newitems[index] = submittedData;
    setModal({ edit: false });
  };

  const onEditClick = (id) => {
    userDataBE.users.forEach((item) => {
      if (item.id === id) {
        setEditFormData({
          email: item.email,
          status: item.status,
        });
        setModal({ edit: true }, { add: false }, { changeroles: false });
        setEditedId(id);
      }
    });
  };

  const handleChangeRole = (id, roleId, note) => {
    setChangeroleId(id);
    setEditFormData({
      roleId: roleId,
      note: note,
    });
    setModal({ changerole: true });
  };

  const onRoleChanged = (userId, newRoleId) => {
    let newData = data.map((item) => {
      if (item.id === userId) {
        return { ...item, roleId: newRoleId, role: roleMap[newRoleId] };
      }
      return item;
    });
    setData(newData);
  };

  const handleActiveDeactivate = async (userId, newActiveStatus) => {
    try {
      const user = userDataBE.users.find((user) => user.id === userId);
      const response = await authApi.put(`/user/update-by-admin/${userId}`, {
        active: newActiveStatus,
        roleId: user.roleId,
        note: user.note,
      });

      if (response.data.statusCode === 200) {
        console.log("old data: ", userDataBE.users);
        let userList = [...userDataBE.users];
        userList = userList.map((item) => (item.id === userId ? { ...item, active: newActiveStatus } : item));
        setData(userList);

        toast.success(`User ${newActiveStatus ? "activated" : "deactivated"} successfully`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      toast.error("Failed to update user status", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  const toggle = () => setonSearch(!onSearch);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const resetData = async () => {
    setSearchUser({
      keyWord: null,
      roleName: null,
      gender: null,
      status: null,
      active: null,
    });
    setSearch({});
    setLoadingReload(true); // Kích hoạt spinner trước khi bắt đầu refetch
    await refetch(); // Sử dụng async/await để đảm bảo hoàn thành trước khi tắt spinner
    setLoadingReload(false); // Tắt spinner sau khi refetch xong
  };

  return (
    <React.Fragment>
      <Head title="User management"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Users Management
              </BlockTitle>
              <BlockDes className="text-soft">
                <p>You have total {totalElements} users.</p>
              </BlockDes>
            </BlockHeadContent>
            <BlockHeadContent>
              <div className="toggle-wrap nk-block-tools-toggle">
                <Button
                  className={`btn-icon btn-trigger toggle-expand me-n1 ${sm ? "active" : ""}`}
                  onClick={() => updateSm(!sm)}
                >
                  <Icon name="menu-alt-r"></Icon>
                </Button>
                <div className="toggle-expand-content" style={{ display: sm ? "block" : "none" }}>
                  <ul className="nk-block-tools g-3">
                    <li className="nk-block-tools-opt">
                      <Button color="primary" className="btn-icon me-2" onClick={() => setModal({ add: true })}>
                        <Icon name="plus"></Icon>
                        <label className="me-2">Create User</label>
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>
        <Block>
          {loading || loadingReload ? ( // Hiển thị spinner nếu đang trong quá trình reload
            <div className="text-center">
              <Spinner style={{ width: "3rem", height: "3rem" }} />
            </div>
          ) : (
            <DataTable className="card-stretch">
              <div className="card-inner position-relative card-tools-toggle">
                <div className="card-title-group">
                  <div className="card-tools"></div>
                  <div className="card-tools me-n1">
                    <ul className="btn-toolbar gx-1">
                      <li>
                        <a
                          href="#search"
                          onClick={(ev) => {
                            ev.preventDefault();
                            toggle();
                          }}
                          className="btn btn-icon search-toggle toggle-search"
                        ></a>
                      </li>
                      <li className="btn-toolbar-sep"></li>
                      <li>
                        <div className="toggle-wrap">
                          <Button
                            className={`btn-icon btn-trigger toggle ${tablesm ? "active" : ""}`}
                            onClick={() => updateTableSm(true)}
                          >
                            <Icon name="menu-right"></Icon>
                          </Button>
                          <div className={`toggle-content ${tablesm ? "content-active" : ""}`}>
                            <ul className="btn-toolbar gx-1">
                              <li className="toggle-close">
                                <Button className="btn-icon btn-trigger toggle" onClick={() => updateTableSm(false)}>
                                  <Icon name="arrow-left"></Icon>
                                </Button>
                              </li>
                              <li></li>
                              <li>
                                <UncontrolledDropdown>
                                  <DropdownToggle
                                    color="tranparent"
                                    className="btn btn-trigger btn-icon dropdown-toggle"
                                  >
                                    <Icon onClick={resetData} name="reload"></Icon>
                                  </DropdownToggle>{" "}
                                </UncontrolledDropdown>
                              </li>
                              <li>
                                <UncontrolledDropdown>
                                  <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
                                    <div className="dot dot-primary"></div>
                                    <Icon name="filter-alt"></Icon>
                                  </DropdownToggle>
                                  <DropdownMenu
                                    end
                                    className="filter-wg dropdown-menu-xl"
                                    style={{ overflow: "visible" }}
                                  >
                                    <div className="dropdown-head">
                                      <span className="sub-title dropdown-title">Filter Users</span>
                                      <div className="dropdown">
                                        <a
                                          href="#more"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                          }}
                                          className="btn btn-sm btn-icon"
                                        >
                                          <Icon name="more-h"></Icon>
                                        </a>
                                      </div>
                                    </div>
                                    <div className="dropdown-body dropdown-body-rg">
                                      <Row className="gx-6 gy-3">
                                        <Col size="12">
                                          <div className="form-group">
                                            <label className="form-label">Search Name</label>
                                            <input
                                              type="text"
                                              value={searchUser.keyWord || ""}
                                              placeholder="Enter search name"
                                              onChange={(e) =>
                                                setSearchUser({ ...searchUser, keyWord: e.target.value })
                                              }
                                              className="form-control"
                                            />
                                          </div>
                                        </Col>
                                        <Col size="6">
                                          <div className="form-group">
                                            <label className="overline-title overline-title-alt">Role</label>
                                            <RSelect
                                              options={filterRole}
                                              onChange={handleRoleChange}
                                              value={
                                                searchUser.roleName
                                                  ? { value: searchUser.roleName, label: searchUser.roleName }
                                                  : null
                                              }
                                              placeholder="Any Role"
                                            />
                                          </div>
                                        </Col>
                                        <Col size="6">
                                          <div className="form-group">
                                            <label className="overline-title overline-title-alt">Active Status</label>
                                            <RSelect
                                              options={[
                                                { value: true, label: "Active" },
                                                { value: false, label: "Inactive" },
                                              ]}
                                              onChange={handleActiveChange}
                                              value={
                                                searchUser.active !== null
                                                  ? {
                                                      value: searchUser.active,
                                                      label: searchUser.active ? "Active" : "Inactive",
                                                    }
                                                  : null
                                              }
                                              placeholder="Any Status"
                                            />
                                          </div>
                                        </Col>
                                        {/* <Col size="6">
                                          <div className="form-group">
                                            <label className="overline-title overline-title-alt">Gender</label>
                                            <RSelect
                                              options={filterGender}
                                              onChange={handleGenderChange}
                                              placeholder="Any Gender"
                                            />
                                          </div>
                                        </Col> */}
                                        <Col size="6">
                                          <div className="form-group">
                                            <label className="overline-title overline-title-alt">Status</label>

                                            <RSelect
                                              options={filterStatus}
                                              onChange={handleStatusChange}
                                              value={
                                                searchUser.status
                                                  ? { value: searchUser.status, label: searchUser.status }
                                                  : null
                                              }
                                              placeholder="Any Status"
                                            />
                                          </div>
                                        </Col>
                                        <Col size="12">
                                          <p>Found {data.length} results</p>
                                        </Col>
                                      </Row>
                                    </div>
                                    <div className="dropdown-foot between">
                                      <a
                                        href="#reset"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                          resetData();
                                        }}
                                        className="clickable"
                                      >
                                        Reset Filter
                                      </a>
                                      <button
                                        onClick={() => setSearch(searchUser)}
                                        type="button"
                                        className="btn btn-secondary"
                                      >
                                        Filter
                                      </button>
                                    </div>
                                  </DropdownMenu>
                                </UncontrolledDropdown>
                              </li>
                              <li>
                                <UncontrolledDropdown>
                                  <DropdownToggle
                                    color="tranparent"
                                    className="btn btn-trigger btn-icon dropdown-toggle"
                                  >
                                    <Icon name="setting"></Icon>
                                  </DropdownToggle>
                                  <DropdownMenu end className="dropdown-menu-xs">
                                    <ul className="link-check">
                                      <li>
                                        <span>Show</span>
                                      </li>
                                      <li className={itemPerPage === 10 ? "active" : ""}>
                                        <DropdownItem
                                          tag="a"
                                          href="#dropdownitem"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            setItemPerPage(10);
                                          }}
                                        >
                                          10
                                        </DropdownItem>
                                      </li>
                                      <li className={itemPerPage === 15 ? "active" : ""}>
                                        <DropdownItem
                                          tag="a"
                                          href="#dropdownitem"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            setItemPerPage(15);
                                          }}
                                        >
                                          15
                                        </DropdownItem>
                                      </li>
                                    </ul>
                                    <ul className="link-check">
                                      <li>
                                        <span>Order</span>
                                      </li>
                                      <li className={sort === "dsc" ? "active" : ""}>
                                        <DropdownItem
                                          tag="a"
                                          href="#dropdownitem"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            setSortState("dsc");
                                            // eslint-disable-next-line no-undef
                                            sortFunc("dsc");
                                          }}
                                        >
                                          DESC
                                        </DropdownItem>
                                      </li>
                                      <li className={sort === "asc" ? "active" : ""}>
                                        <DropdownItem
                                          tag="a"
                                          href="#dropdownitem"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            setSortState("asc");
                                            // eslint-disable-next-line no-undef
                                            sortFunc("asc");
                                          }}
                                        >
                                          ASC
                                        </DropdownItem>
                                      </li>
                                    </ul>
                                  </DropdownMenu>
                                </UncontrolledDropdown>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <DataTableBody>
                <DataTableHead>
                  <DataTableRow>
                    <span onClick={() => handleSort("id")} className="sub-text">
                      ID {upDownArrow(sortBy === "id" ? orderBy : "")}
                    </span>
                  </DataTableRow>
                  <DataTableRow>
                    <span onClick={() => handleSort("fullname")} className="sub-text">
                      FullName {upDownArrow(sortBy === "fullname" ? orderBy : "")}
                    </span>
                  </DataTableRow>
                  <DataTableRow size="md">
                    <span className="sub-text">Email</span>
                  </DataTableRow>
                  <DataTableRow size="md">
                    <span className="sub-text">Role</span>
                  </DataTableRow>
                  <DataTableRow size="md">
                    <span className="sub-text">Status</span>
                  </DataTableRow>
                  <DataTableRow size="md">
                    <span className="sub-text">Active</span>
                  </DataTableRow>
                  <DataTableRow className="nk-tb-col-tools text-end">
                    <span className="sub-text">Action</span>
                  </DataTableRow>
                </DataTableHead>
                {userDataBE.users?.length > 0
                  ? userDataBE.users.map((item) => {
                      return (
                        <DataTableItem key={item.id}>
                          <DataTableRow>
                            <span>{item.id}</span>
                          </DataTableRow>
                          <DataTableRow size="mb">
                            <span className="tb-amount">{item.fullname}</span>
                          </DataTableRow>
                          <DataTableRow size="md">
                            <span>{item.email}</span>
                          </DataTableRow>
                          <DataTableRow size="md">
                            <span>{roleMap[item.roleId]}</span>
                          </DataTableRow>
                          <DataTableRow size="lg">
                            <ul className="list-status">
                              <li>
                                <Icon
                                  className={`text-${
                                    item.status === "verified"
                                      ? "success"
                                      : item.status === "unverified"
                                      ? "info"
                                      : "secondary"
                                  }`}
                                  name={`alarm-alt`}
                                ></Icon>{" "}
                                <span>{item.status}</span>
                              </li>
                            </ul>
                          </DataTableRow>

                          <DataTableRow size="md">
                            <Badge className="badge-dot" color={item.active ? "success" : "danger"}>
                              {item.active ? "active" : "inactive"}
                            </Badge>
                          </DataTableRow>

                          <DataTableRow className="nk-tb-col-tools">
                            <ul className="nk-tb-actions gx-1">
                              <li>
                                <UncontrolledDropdown>
                                  <DropdownToggle tag="a" className="dropdown-toggle btn btn-icon btn-trigger">
                                    <Icon name="more-h"></Icon>
                                  </DropdownToggle>
                                  <DropdownMenu end>
                                    <ul className="link-list-opt no-bdr">
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#edit"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            navigate(`/user-list/user-details/${item.id}`);
                                          }}
                                        >
                                          <Icon name="eye-fill" />
                                          <span>View</span>
                                        </DropdownItem>
                                      </li>
                                      <li onClick={() => handleChangeRole(item.id, item.roleId, item.note)}>
                                        <DropdownItem
                                          tag="a"
                                          href="#changerole"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                          }}
                                        >
                                          <Icon name="exchange"></Icon>
                                          <span>Update user</span>
                                        </DropdownItem>
                                      </li>

                                      <li onClick={() => handleActiveDeactivate(item.id, !item.active)}>
                                        <DropdownItem
                                          tag="a"
                                          href="#toggleActive"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                          }}
                                        >
                                          <Icon name={item.active ? "toggle-off" : "toggle-on"}></Icon>
                                          <span>{item.active ? "Deactivate" : "Activate"} user</span>
                                        </DropdownItem>
                                      </li>
                                    </ul>
                                  </DropdownMenu>
                                </UncontrolledDropdown>
                              </li>
                            </ul>
                          </DataTableRow>
                        </DataTableItem>
                      );
                    })
                  : null}
              </DataTableBody>
              <div className="card-inner">
                {totalElements > 0 ? (
                  <PaginationComponent
                    itemPerPage={itemPerPage}
                    totalItems={totalElements}
                    paginate={paginate}
                    currentPage={currentPage}
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-silent">No data found</span>
                  </div>
                )}
              </div>
            </DataTable>
          )}
        </Block>

        <AddModal
          modal={modal.add}
          formData={formData}
          setFormData={setFormData}
          closeModal={closeModal}
          onSubmit={onFormSubmit}
          filterStatus={filterStatus}
          filterRole={filterRole}
          filterGender={filterGender}
          setTotalElements={setTotalElements}
        />
        <EditModal
          modal={modal.edit}
          formData={editFormData}
          setFormData={setEditFormData}
          closeModal={closeEditModal}
          onSubmit={onEditSubmit}
          editUserClick={editId}
          filterStatus={filterStatus}
          filterRole={filterRole}
          filterGender={filterGender}
        />
        <ChangeRoleModal
          modal={modal.changerole}
          userId={changeRoleId}
          editFormData={editFormData}
          onChangeRole={onRoleChanged}
          handleChangeRole={handleChangeRole}
          closeChangeRoleModal={closeChangeRoleModal}
          setData={setData}
        />
        <ToastContainer />
      </Content>
    </React.Fragment>
  );
};
export default UserListRegularPage;
