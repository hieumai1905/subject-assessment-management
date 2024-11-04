import React, { useEffect, useState } from "react";
import Head from "../../layout/head/Head";
import Content from "../../layout/content/Content";
import { DropdownMenu, DropdownToggle, UncontrolledDropdown, DropdownItem, Badge, Spinner, Tooltip } from "reactstrap";
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
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableItem,
  Row,
  Col,
  RSelect,
} from "../../components/Component";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  addFirstAndDeleteLast,
  convertToOptions,
  getItemByValue,
  isNullOrEmpty,
  transformToOptions,
  upDownArrow,
} from "../../utils/Utils";
import ClassFormModal from "./ClassFormModal";
import { statusList } from "../setting/SettingData";
import authApi from "../../utils/ApiAuth";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/Userstore";
import { canModify } from "../../utils/CheckPermissions";

export const ClassList = () => {
  const [sm, updateSm] = useState(false);
  const [modal, setModal] = useState({
    edit: false,
    add: false,
    import: false,
  });
  const [editId, setEditedId] = useState();
  const [data, setData] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage] = useState(7);
  const [sortBy, setSortBy] = useState("id");
  const [orderBy, setOrderBy] = useState("desc");
  const [search, setSearch] = useState({
    name: "",
    teacher: null,
    semester: null,
    subject: null,
    active: null,
  });
  const [isFetching, setIsFetching] = useState(true);
  const [filterForm, setFilterForm] = useState({});
  const [teacherList, setTeacherList] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const { role } = useAuthStore((state) => state);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await authApi.post("setting/search", {
          pageSize: 9999,
          pageIndex: 1,
          type: "Semester",
          active: true,
          sortBy: "displayOrder",
          orderBy: "ASC",
        });
        if (response.data.statusCode === 200) {
          setSemesters(convertToOptions(response.data.data.settingDTOS, "id", "name"));
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (err) {
        toast.error("Error fetching semesters", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    };

    fetchSemesters();
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (semesters.length === 0) return;
      try {
        const response = await authApi.post("/subjects/search", {
          pageSize: 9999,
          pageIndex: 1,
          active: true,
        });
        if (response.data.statusCode === 200) {
          setSubjects(convertToOptions(response.data.data.subjects, "id", "subjectCode"));
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        toast.error("Error fetching subjects", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    };
    fetchSubjects();
  }, [semesters]);

  useEffect(() => {
    const fetchTeachers = async () => {
      if (subjects.length === 0) return;
      try {
        const response = await authApi.post("/user/search", {
          pageSize: 9999,
          roleName: "teacher",
        });
        if (response.data.statusCode === 200) {
          setTeacherList(transformToOptions(response.data.data.users));
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (err) {
        toast.error("Error fetching teachers", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    };

    fetchTeachers();
  }, [subjects]);

  useEffect(() => {
    const fetchData = async () => {
      if (teacherList.length === 0) return;
      try {
        setIsFetching(true);
        const response = await authApi.post("/class/search", {
          pageSize: itemPerPage,
          pageIndex: currentPage,
          keyWord: filterForm?.name,
          active: isNullOrEmpty(filterForm?.active) ? null : filterForm?.active === "Active",
          semesterId: filterForm?.semester?.value,
          subjectId: filterForm?.subject?.value,
          teacherId: filterForm?.teacher?.value,
          isCurrentClass: role !== "ADMIN" && role !== "MANAGER",
          sortBy: sortBy,
          orderBy: orderBy,
        });
        if (response.data.statusCode === 200) {
          setData(response.data.data.classesDTOS);
          setTotalElements(response.data.data.totalElements);
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        toast.error("Error fetching classes", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [currentPage, sortBy, orderBy, filterForm, teacherList]);

  const [formError, setFormError] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    semesterId: null,
    teacher: null,
    subject: null,
    active: "Active",
    description: "",
    listEvaluator: [],
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    code: "",
    semesterId: null,
    teacher: null,
    subject: null,
    active: "Active",
    description: "",
    listEvaluator: [],
  });

  // function to reset the form
  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      semesterId: null,
      teacher: null,
      subject: null,
      active: "Active",
      description: "",
      listEvaluator: [],
    });
    setFormError({});
  };

  const closeModal = () => {
    setModal({ add: false });
    resetForm();
  };

  const closeEditModal = () => {
    setModal({ edit: false });
    resetForm();
  };

  // submit function to add a new item
  const onFormSubmit = async (sData) => {
    const { name, code, semester, teacher, subject, active, description, listEvaluator } = sData;
    const submittedData = {
      name: name,
      classCode: code,
      semesterId: semester?.value,
      teacherId: teacher?.value,
      subjectId: subject?.value,
      active: active === "Active",
      description: description,
      listEvaluator: listEvaluator.map((item) => ({
        id: item.value,
      })),
    };

    try {
      const response = await authApi.post("/class/create", submittedData);
      if (response.data.statusCode === 200) {
        toast.success("Create class successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        setTotalElements(totalElements + 1);
        setData(addFirstAndDeleteLast(data, response.data.data, itemPerPage));
        resetForm();
        setModal({ add: false });
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      toast.error("Error creating class", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  // submit function to update a new item
  const onEditSubmit = async (sData) => {
    const { name, code, semester, teacher, subject, active, description, listEvaluator } = sData;
    try {
      const response = await authApi.put("/class/update/" + editId, {
        id: editId,
        name: name,
        classCode: code,
        semesterId: semester?.value,
        teacherId: teacher?.value,
        subjectId: subject?.value,
        active: active === "Active",
        description: description,
        listEvaluator: listEvaluator.map((item) => ({
          id: item.value,
        })),
      });
      if (response.data.statusCode === 200) {
        toast.success("Update class successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        let submittedData;
        data.forEach((item) => {
          if (item.id === editId) {
            submittedData = {
              id: item.id,
              name: name,
              classCode: code,
              semesterId: semester?.value,
              teacherId: teacher?.value,
              subjectId: subject?.value,
              active: active === "Active",
              description: description,
            };
          }
        });
        let index = data.findIndex((item) => item.id === editId);
        data[index] = submittedData;
        setModal({ edit: false });
        resetForm();
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      toast.error("Error updating class", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  // function that loads the want to editted data
  const onEditClick = async (id) => {
    try {
      const response = await authApi.get("/class/get-by-id/" + id);
      if (response.data.statusCode === 200) {
        let item = response.data.data;
        let listEvaluator = [];
        item?.listEvaluator?.forEach((element) => {
          let evaluator = teacherList.find((t) => t.value === element.id);
          if (evaluator) {
            listEvaluator.push(evaluator);
          }
        });
        setEditFormData({
          name: item.name,
          code: item.classCode,
          teacher: getItemByValue(teacherList, item.teacherId),
          semester: getItemByValue(semesters, item.semesterId),
          subject: getItemByValue(subjects, item.subjectId),
          active: item.active ? "Active" : "InActive",
          description: item.description,
          listEvaluator: listEvaluator,
        });
        setModal({ edit: true });
        setEditedId(id);
      } else {
        toast.error(response.data.data, {
          position: "top-center",
        });
      }
    } catch {
      toast.error("Error while getting class", {
        position: "top-center",
      });
    }
  };

  // function to delete selected item
  const onDeleteClick = async (id) => {
    try {
      const response = await authApi.delete("/setting/delete/" + id);
      if (response.data.statusCode === 200) {
        toast.success("Delete setting successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        let newData = [...data];
        let index = newData.findIndex((item) => item.id === id);
        if (index !== -1) {
          newData.splice(index, 1);
          setData(newData);
        }
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      toast.error("Error deleting class", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  const handleFilter = () => setFilterForm(search);

  const handleSort = (sortField) => {
    setSortBy(sortField);
    setOrderBy((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Change Page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <>
      <Head title="Class List"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>Class Management</BlockTitle>
              <BlockDes className="text-soft">You have total {totalElements} classes</BlockDes>
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
                        <DropdownMenu end className="filter-wg dropdown-menu-xxl" style={{ overflow: "visible" }}>
                          <div className="dropdown-head">
                            <span className="sub-title dropdown-title">Filter Setting</span>
                          </div>
                          <div className="dropdown-body dropdown-body-rg">
                            <Row className="gx-6 gy-3">
                              <Col size="12">
                                <div className="form-group">
                                  <label className="form-label">Name or Code</label>
                                  <input
                                    type="text"
                                    value={search.name}
                                    placeholder="Enter name or code"
                                    onChange={(e) => setSearch({ ...search, name: e.target.value })}
                                    className="form-control"
                                  />
                                </div>
                              </Col>
                              <Col size="6">
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Semester</label>
                                  <RSelect
                                    options={semesters}
                                    value={search.semester}
                                    onChange={(e) => setSearch({ ...search, semester: e })}
                                  />
                                </div>
                              </Col>
                              <Col size="6">
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Subject</label>
                                  <RSelect
                                    options={subjects}
                                    value={search.subject}
                                    onChange={(e) => setSearch({ ...search, subject: e })}
                                  />
                                </div>
                              </Col>
                              <Col size="6">
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Teacher</label>
                                  <RSelect
                                    options={teacherList}
                                    value={search.teacher}
                                    onChange={(e) => setSearch({ ...search, teacher: e })}
                                  />
                                </div>
                              </Col>

                              <Col size="6">
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Status</label>
                                  <RSelect
                                    options={statusList}
                                    value={[{ value: search.active, label: search.active }]}
                                    onChange={(e) => setSearch({ ...search, active: e.value })}
                                  />
                                </div>
                              </Col>
                            </Row>
                          </div>
                          <div className="dropdown-foot between">
                            <a
                              href="#reset"
                              onClick={(ev) => {
                                ev.preventDefault();
                                setSearch({
                                  name: "",
                                  teacher: null,
                                  semester: null,
                                  subject: null,
                                  active: null,
                                });
                                setFilterForm({});
                              }}
                              className="clickable"
                            >
                              Reset Filter
                            </a>
                            <button
                              onClick={() => {
                                handleFilter();
                              }}
                              type="button"
                              className="btn btn-secondary"
                            >
                              Filter
                            </button>
                          </div>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </li>
                    {(role === 'ADMIN' || role === 'MANAGER') && (
                      <li className="nk-block-tools-opt" onClick={() => setModal({ add: true })}>
                        <Button color="primary">
                          <Icon name="plus"></Icon>
                          <span>Add new class</span>
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
          <DataTable className="card-stretch">
            <DataTableBody>
              <DataTableHead className="nk-tb-item nk-tb-head">
                <DataTableRow>
                  <span
                    onClick={() => handleSort("id")}
                    className="sub-text"
                    style={{ fontWeight: "bold", cursor: "pointer" }}
                  >
                    ID {upDownArrow(sortBy === "id" ? orderBy : "")}
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span
                    onClick={() => handleSort("name")}
                    className="sub-text"
                    style={{ fontWeight: "bold", cursor: "pointer" }}
                  >
                    Name {upDownArrow(sortBy === "name" ? orderBy : "")}
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span
                    onClick={() => handleSort("classCode")}
                    className="sub-text"
                    style={{ fontWeight: "bold", cursor: "pointer" }}
                  >
                    Class Code {upDownArrow(sortBy === "classCode" ? orderBy : "")}
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span className="sub-text" style={{ fontWeight: "bold" }}>
                    Teacher
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }}>Subject</span>
                </DataTableRow>
                <DataTableRow>
                  <span className="sub-text" style={{ fontWeight: "bold" }}>
                    Semester
                  </span>
                </DataTableRow>
                <DataTableRow size="mb">
                  <span className="sub-text" style={{ fontWeight: "bold" }}>
                    Status
                  </span>
                </DataTableRow>
                <DataTableRow className="nk-tb-col-tools text-end">
                  <span className="sub-text" style={{ fontWeight: "bold" }}>
                    Action
                  </span>
                </DataTableRow>
              </DataTableHead>

              {isFetching ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
                  <Spinner color="primary" />
                </div>
              ) : data.length > 0 ? (
                data.map((item) => {
                  return (
                    <DataTableItem key={item.id} className="nk-tb-item">
                      <DataTableRow>
                        <span>{item.id}</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="sub-text">{item.name}</span>
                      </DataTableRow>
                      <DataTableRow size="mb">
                        <span>{item.classCode}</span>
                      </DataTableRow>
                      <DataTableRow size="mb">
                        <span>{getItemByValue(teacherList, item.teacherId)?.label}</span>
                      </DataTableRow>
                      <DataTableRow size="mb">
                        <span>{getItemByValue(subjects, item.subjectId)?.label}</span>
                      </DataTableRow>
                      <DataTableRow size="mb">
                        <span>{getItemByValue(semesters, item.semesterId)?.label}</span>
                      </DataTableRow>
                      <DataTableRow size="mb">
                        <Badge color={item.active ? "success" : "danger"}>{item.active ? "Active" : "Inactive"}</Badge>
                      </DataTableRow>
                      <DataTableRow className="nk-tb-col-tools text-end">
                        <ul className="nk-tb-actions gx-1">
                          <li>
                            <UncontrolledDropdown>
                              <DropdownToggle tag="a" className="text-soft dropdown-toggle btn btn-icon btn-trigger">
                                <Icon name="more-h"></Icon>
                              </DropdownToggle>
                              <DropdownMenu end>
                                <ul className="link-list-opt no-bdr">
                                  {(role === 'ADMIN' || role === 'MANAGER') && (
                                    <li onClick={() => onEditClick(item.id)}>
                                      <DropdownItem
                                        tag="a"
                                        href="#edit"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                        }}
                                      >
                                        <Icon name="edit"></Icon>
                                        <span>Edit</span>
                                      </DropdownItem>
                                    </li>
                                  )}

                                  <li>
                                    <Link to={`/class-list/get-by-id/${item.id}`}>
                                      <Icon name="eye-fill" />
                                      <span>View</span>
                                    </Link>
                                  </li>
                                  {/* 
                                  {canModify(role, "class", "crud") && (
                                    <li onClick={() => onDeleteClick(item.id)}>
                                      <DropdownItem
                                        tag="a"
                                        href="#delete"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                        }}
                                      >
                                        <Icon name="trash"></Icon>
                                        <span>Delete</span>
                                      </DropdownItem>
                                    </li>
                                  )} */}
                                </ul>
                              </DropdownMenu>
                            </UncontrolledDropdown>
                          </li>
                        </ul>
                      </DataTableRow>
                    </DataTableItem>
                  );
                })
              ) : (
                <div className="text-center">No classes found</div>
              )}
            </DataTableBody>
            <div className="card-inner">
              {totalElements > 0 && (
                <PaginationComponent
                  itemPerPage={itemPerPage}
                  totalItems={totalElements}
                  paginate={paginate}
                  currentPage={currentPage}
                />
              )}
            </div>
          </DataTable>
        </Block>

        <ClassFormModal
          modal={modal.add}
          modalType="add"
          formData={formData}
          setFormData={setFormData}
          semesters={semesters}
          subjects={subjects}
          closeModal={closeModal}
          onSubmit={onFormSubmit}
        />
        <ClassFormModal
          modal={modal.edit}
          modalType="edit"
          formData={editFormData}
          semesters={semesters}
          subjects={subjects}
          setFormData={setEditFormData}
          closeModal={closeEditModal}
          onSubmit={onEditSubmit}
        />
        <ToastContainer />
      </Content>
    </>
  );
};

export default ClassList;
