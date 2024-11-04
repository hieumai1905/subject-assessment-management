import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Head from "../../layout/head/Head";
import Content from "../../layout/content/Content";
import { Spinner, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import {
  Block,
  BlockHead,
  BlockBetween,
  BlockHeadContent,
  BlockTitle,
  BlockDes,
  Icon,
  Button,
  PaginationComponent,
  Row,
  Col,
  RSelect,
} from "../../components/Component";
import { addFirstAndDeleteLast, isNullOrEmpty, transformToOptions } from "../../utils/Utils";
import FormModal from "./FormModal";
import useQuerySubject from "../../hooks/UseQuerySubject";
import authApi from "../../utils/ApiAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/Userstore";
import { canModify } from "../../utils/CheckPermissions";

const StyledCard = styled.div`
  background-color: #fff;
  border: 2px solid #ddd;
  border-radius: 16px;
  padding: 20px; /* Reduced padding */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px; /* Reduced height */
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px; /* Reduced margin */

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  .subject-title {
    font-size: 1.3rem;
    font-weight: 450;
    color: #333;
    margin-bottom: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    a {
      color: #333;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .subject-code {
    font-size: 1rem; /* Reduced font size */
    color: #555;
    margin-bottom: 18px; /* Reduced margin */
  }

  .subject-info {
    display: flex;
    flex-direction: column;
    gap: 6px; /* Reduced gap */
    font-size: 0.95rem; /* Reduced font size */
    color: #666;

    .info-item {
      display: flex;
      align-items: center;
      gap: 10px; /* Reduced gap */
    }

    .info-icon {
      font-size: 1.1rem; /* Reduced icon size */
      color: #888;
    }

    .managers {
      display: flex;
      flex-direction: column;
      margin-top: 6px; /* Reduced margin */
    }

    .manager-name {
      line-height: 1.3; /* Adjusted line height */
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-style: italic;
      color: #444;
    }
  }

  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 14px; /* Reduced margin */

    .action-button,
    .view-details {
      font-size: 0.85rem; /* Reduced font size */
      font-weight: 400;
      color: #007bff;
      cursor: pointer;
      text-align: right;
      transition: color 0.3s;

      &:hover {
        text-decoration: underline;
        color: #0056b3;
      }
    }
  }
`;

const SubjectList = () => {
  const [sm, updateSm] = useState(false);
  const [modal, setModal] = useState({
    edit: false,
    add: false,
  });
  const [editId, setEditedId] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage] = useState(7);
  const [totalElements, setTotalElements] = useState(0);
  const [filterFormData, setFilterFormData] = useState({
    nameOrCode: "",
    managerId: null,
    status: null,
  });
  const [selectedManager, setSelectedManager] = useState({
    fullname: "",
    username: "",
  });
  const { role } = useAuthStore((state) => state);
  const [sortBy, setSortBy] = useState("id");
  const [orderBy, setOrderBy] = useState("desc");
  const [searchSubjects, setSearchSubjects] = useState({});
  const [subjects, setSubjects] = useState([]);
  const { subjectResponse, loading, error } = useQuerySubject({
    currentPage,
    itemPerPage,
    setTotalElements,
    searchSubjects,
    sortBy,
    orderBy,
    setSubjects,
  });

  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authApi.post("/user/search", {
          pageSize: 9999,
          roleName: "manager",
        });
        if (response.data.statusCode === 200) {
          setUsers(response.data.data.users);
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("fetch users:", error);
        toast.error(`${error}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    };

    fetchUsers();
  }, []);

  const changeSelectedManager = (managerId) => {
    if (users) {
      const selectedManager = users.find((manager) => manager.id === managerId);
      if (selectedManager) setSelectedManager(selectedManager);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    managerIds: [],
    description: "",
    isActive: "Active",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    code: "",
    managerIds: [],
    description: "",
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      managerIds: [],
      description: "",
      isActive: "Active",
    });
    setSelectedManager({
      fullname: "",
      username: "",
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

  const onFormSubmit = async (sData) => {
    const { name, code, managerIds, description, isActive } = sData;
    const submittedData = {
      subjectName: name,
      subjectCode: code,
      managers: managerIds?.map((manager) => ({ id: manager.value })),
      description: description,
      active: isActive === "Active",
    };

    try {
      const response = await authApi.post("/subjects/create", submittedData);
      if (response.data.statusCode === 200) {
        toast.success("Create subject successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        setTotalElements(totalElements + 1);
        setSubjects(addFirstAndDeleteLast(subjects, response.data.data, itemPerPage));
        resetForm();
        setModal({ add: false });
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error creating subject:", error);
      toast.error("Error creating subject!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  const onEditSubmit = async (sData) => {
    const { name, code, managerIds, description, isActive } = sData;
    try {
      const response = await authApi.put("/subjects/update/" + editId, {
        id: editId,
        subjectName: name,
        subjectCode: code,
        managers: managerIds?.map((manager) => ({ id: manager.value })),
        description: description,
        active: isActive === "Active",
      });
      if (response.data.statusCode === 200) {
        toast.success("Update subject successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        let submittedData = {
          id: editId,
          subjectName: response.data?.data?.subjectName,
          subjectCode: response.data?.data?.subjectCode,
          managers: response.data?.data?.managers,
          username: response.data?.data?.username,
          description: response.data?.data?.description,
          active: response.data?.data?.active,
        };
        let index = subjects?.findIndex((item) => item.id === editId);
        subjects[index] = submittedData;
        setModal({ edit: false });
        resetForm();
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error update subject:", error);
      toast.error("Error update subject!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  const onEditClick = (id) => {
    subjects?.forEach((item) => {
      if (item.id === id) {
        setEditFormData({
          name: item.subjectName,
          code: item.subjectCode,
          managerIds: transformToOptions(item.managers),
          description: item.description === null ? "" : item.description,
          isActive: item.active ? "Active" : "InActive",
        });
        setModal({ edit: true });
        setEditedId(id);
      }
    });
  };

  const onViewDetails = (id) => {
    // You can use this function to navigate to the subject detail page
    // Example: history.push(`/subject-list/subject-detail/${id}`);
  };

  const handleSort = (sortField) => {
    setSortBy(sortField);
    setOrderBy((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  useEffect(() => {
    setCurrentPage(1);
  }, [filterFormData]);

  return (
    <>
      <Head title="Subject List"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>Subjects</BlockTitle>
              <BlockDes className="text-soft">You have total {totalElements} subjects</BlockDes>
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
                    <li>
                      <UncontrolledDropdown>
                        <DropdownToggle tag="a" className="dropdown-toggle btn btn-white btn-dim btn-outline-light">
                          <Icon name="filter-alt" className="d-none d-sm-inline"></Icon>
                          <span>Filtered By</span>
                          <Icon name="chevron-right" className="dd-indc"></Icon>
                        </DropdownToggle>
                        <DropdownMenu end className="filter-wg dropdown-menu-xl" style={{ overflow: "visible" }}>
                          <div className="dropdown-head">
                            <span className="sub-title dropdown-title">Filter Setting</span>
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
                                  <label className="form-label">Name Or Code</label>
                                  <input
                                    type="text"
                                    value={filterFormData.nameOrCode}
                                    placeholder="Enter subject name or code"
                                    onChange={(e) =>
                                      setFilterFormData({ ...filterFormData, nameOrCode: e.target.value })
                                    }
                                    className="form-control"
                                  />
                                </div>
                              </Col>
                              <Col size="12">
                                <div className="form-group">
                                  <label className="form-label">Manager</label>
                                  <RSelect
                                    options={
                                      Array.isArray(users)
                                        ? users.map((manager) => ({
                                            value: manager.id,
                                            label: `${manager.fullname} (${manager.username})`,
                                          }))
                                        : []
                                    }
                                    value={{
                                      value: filterFormData.managerId,
                                      label: !isNullOrEmpty(selectedManager.fullname)
                                        ? `${selectedManager?.fullname} (${selectedManager.username})`
                                        : "",
                                    }}
                                    onChange={(e) => {
                                      changeSelectedManager(e.value);
                                      setFilterFormData({ ...filterFormData, managerId: e.value });
                                    }}
                                  />
                                </div>
                              </Col>
                              <Col size="12">
                                <div className="form-group">
                                  <label className="form-label">Status</label>
                                  <Row>
                                    <Col md={6}>
                                      <div className="custom-control custom-radio">
                                        <input
                                          type="radio"
                                          id="customRadio1"
                                          name="customRadio"
                                          className="custom-control-input"
                                          value="Active"
                                          checked={filterFormData.status === "Active"}
                                          onChange={(e) =>
                                            setFilterFormData({ ...filterFormData, status: e.target.value })
                                          }
                                        />
                                        <label className="custom-control-label" htmlFor="customRadio1">
                                          Active
                                        </label>
                                      </div>
                                    </Col>
                                    <Col md={6}>
                                      <div className="custom-control custom-radio">
                                        <input
                                          type="radio"
                                          id="customRadio2"
                                          name="customRadio"
                                          className="custom-control-input"
                                          value="InActive"
                                          checked={filterFormData.status === "InActive"}
                                          onChange={(e) =>
                                            setFilterFormData({ ...filterFormData, status: e.target.value })
                                          }
                                        />
                                        <label className="custom-control-label" htmlFor="customRadio2">
                                          InActive
                                        </label>
                                      </div>
                                    </Col>
                                  </Row>
                                </div>
                              </Col>
                            </Row>
                          </div>
                          <div className="dropdown-foot between">
                            <a
                              href="#reset"
                              onClick={(ev) => {
                                ev.preventDefault();
                                setFilterFormData({
                                  nameOrCode: "",
                                  managerId: null,
                                  status: null,
                                });
                                setSearchSubjects({});
                                setSelectedManager({
                                  fullname: "",
                                  username: "",
                                });
                              }}
                              className="clickable"
                            >
                              Reset Filter
                            </a>
                            <button
                              onClick={() => {
                                setSearchSubjects(filterFormData);
                              }}
                              settingType="button"
                              className="btn btn-secondary"
                            >
                              Filter
                            </button>
                          </div>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </li>
                    {canModify(role, "subject", "crud") && (
                      <li
                        className="nk-block-tools-opt"
                        onClick={() => {
                          setModal({ add: true });
                          setSelectedManager({
                            fullname: "",
                            username: "",
                          });
                        }}
                      >
                        <Button color="primary">
                          <Icon name="plus"></Icon>
                          <span>Add Subject</span>
                        </Button>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>
        <Block>
          <Row className="gy-4" style={{ gap: "20px" }}>
            {loading ? (
              <div className="text-center w-100">
                <Spinner color="primary" /> {/* Loading spinner */}
              </div>
            ) : subjects.length > 0 ? (
              subjects.map((item) => (
                <Col md="6" lg="4" key={item.id} className="mb-4">
                  <StyledCard active={item.active}>
                    <div className="subject-title" title={item.subjectName}>
                      <Link to={`/subject-list/subject-detail/${item.id}`}>{item.subjectName}</Link>
                    </div>
                    <div className="subject-code">{item.subjectCode}</div>
                    <div className="subject-info">
                      <div className="info-item">
                        <div className="managers">
                          <span>
                            <Icon name="user" className="info-icon" />
                            Managers:
                          </span>
                          <div className="manager-list" style={{ display: "inline-block" }}>
                            {item.managers.length > 0 ? (
                              <>
                                <span className="manager-name">
                                  {item.managers[0].fullname} ({item.managers[0].username})
                                </span>
                                {item.managers.length > 1 && (
                                  <span className="manager-more" style={{ marginLeft: "5px" }}>
                                    +{item.managers.length - 1} more
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="manager-name">None</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span>
                        Status:{" "}
                        <span style={{ color: item.active ? "#28a745" : "#dc3545" }}>
                          {item.active ? "Active" : "Inactive"}
                        </span>
                      </span>
                    </div>
                    <div className="actions">
                      <div>
                        {role === "ADMIN" && (
                          <span className="action-button" onClick={() => onEditClick(item.id)}>
                            <Icon name="edit" /> Edit
                          </span>
                        )}
                      </div>
                      <Link to={`/subject-list/subject-detail/${item.id}`} className="view-details">
                        <span>View details →</span>
                      </Link>
                    </div>
                  </StyledCard>
                </Col>
              ))
            ) : (
              <div className="text-center w-100">
                <p className="text-silent">No subjects found</p>
              </div>
            )}
          </Row>
          {totalElements > 0 && (
            <div className="card-inner">
              <PaginationComponent
                itemPerPage={itemPerPage}
                totalItems={totalElements}
                paginate={paginate}
                currentPage={currentPage}
              />
            </div>
          )}
        </Block>

        <FormModal
          modal={modal.add}
          modalType="add"
          formData={formData}
          setFormData={setFormData}
          closeModal={closeModal}
          onSubmit={onFormSubmit}
          users={users}
          selectedManager={selectedManager}
          setSelectedManager={setSelectedManager}
          changeSelectedManager={changeSelectedManager}
        />
        <FormModal
          modal={modal.edit}
          modalType="edit"
          formData={editFormData}
          setFormData={setEditFormData}
          closeModal={closeEditModal}
          onSubmit={onEditSubmit}
          users={users}
          selectedManager={selectedManager}
          setSelectedManager={setSelectedManager}
          changeSelectedManager={changeSelectedManager}
        />
        <ToastContainer />
      </Content>
    </>
  );
};

export default SubjectList;
