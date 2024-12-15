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
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState({
    add: false,
    edit: false,
  });
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
        console.log('semester: ', response.data.data);
        if (response.data.statusCode === 200) {
          setSemesters(convertToOptions(response.data.data.settingDTOS, "id", "name"));
          if (response.data.data.totalElements > 0) {
            let fsemester = {
              value: response.data.data.settingDTOS[0]?.id,
              label: response.data.data.settingDTOS[0]?.name,
            };
            setFilterForm({
              ...filterForm,
              semester: fsemester,
            });
            setSearch({...search, semester: fsemester});
          }
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (err) {
        toast.error("Lỗi khi lấy danh sách học kỳ", {
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
        console.log('subject: ', response.data.data);
        if (response.data.statusCode === 200) {
          setSubjects(convertToOptions(response.data.data.subjects, "id", "subjectCode"));
          if (response.data.data.totalElements > 0){
            let fsubject = {
              value: response.data.data.subjects[0]?.id,
              label: response.data.data.subjects[0]?.subjectCode,
            };
            setFilterForm({...filterForm, subject: fsubject});
            setSearch({...search, subject: fsubject});
          }
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        toast.error("Lỗi khi lấy danh sách môn học", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    };
    fetchSubjects();
  }, [semesters]);

  useEffect(() => {
    const fetchTeachers = async () => {
      if (subjects.length === 0) return;
      if (!filterForm?.semester?.value || !filterForm?.subject?.value) {
        setData([]);
        setTotalElements(0);
        setIsFetching(false);
        return false;
      }
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
        toast.error("Lỗi khi lấy danh sách giáo viên", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    };

    fetchTeachers();
  }, [subjects]);

  useEffect(() => {
    const fetchData = async () => {
      if (teacherList.length === 0) return;
      if (!filterForm?.semester?.value || !filterForm?.subject?.value) {
        setData([]);
        setTotalElements(0);
        setIsFetching(false);
        return false;
      }
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
        toast.error("Lỗi khi lấy danh sách lớp học", {
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
      setIsLoading({...isLoading, add: true});
      const response = await authApi.post("/class/create", submittedData);
      if (response.data.statusCode === 200) {
        toast.success("Tạo lớp học thành công!", {
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
      toast.error("Lỗi khi tạo lớp học", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsLoading({...isLoading, add: false});
    }
  };

  // submit function to update a new item
  const onEditSubmit = async (sData) => {
    const { name, code, semester, teacher, subject, active, description, listEvaluator } = sData;
    try {
      setIsLoading({...isLoading, edit: true});
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
        toast.success("Cập nhật lớp học thành công!", {
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
      toast.error("Lỗi khi cập nhật lớp học", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally{
      setIsLoading({...isLoading, edit: false});
    }
  };

  // function that loads the want to edited data
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
      toast.error("Lỗi khi lấy thông tin lớp học", {
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
      <Head title="Danh sách lớp học"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>Quản lý lớp học</BlockTitle>
              <BlockDes className="text-soft">Bạn có tổng cộng {totalElements} lớp học</BlockDes>
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
                          <span>Bộ lọc</span>
                          <Icon name="chevron-right" className="dd-indc"></Icon>
                        </DropdownToggle>
                        <DropdownMenu end className="filter-wg dropdown-menu-xxl" style={{ overflow: "visible" }}>
                          <div className="dropdown-head">
                            <span className="sub-title dropdown-title">Cài đặt bộ lọc</span>
                          </div>
                          <div className="dropdown-body dropdown-body-rg">
                            <Row className="gx-6 gy-3">
                              <Col size="12">
                                <div className="form-group">
                                  <label className="form-label">Tên hoặc Mã lớp</label>
                                  <input
                                    type="text"
                                    value={search.name}
                                    placeholder="Nhập tên hoặc mã lớp"
                                    onChange={(e) => setSearch({ ...search, name: e.target.value })}
                                    className="form-control"
                                  />
                                </div>
                              </Col>
                              <Col size="6">
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Học kỳ</label>
                                  <RSelect
                                    options={semesters}
                                    value={search.semester}
                                    onChange={(e) => setSearch({ ...search, semester: e })}
                                  />
                                </div>
                              </Col>
                              <Col size="6">
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Môn học</label>
                                  <RSelect
                                    options={subjects}
                                    value={search.subject}
                                    onChange={(e) => setSearch({ ...search, subject: e })}
                                  />
                                </div>
                              </Col>
                              <Col size="6">
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Giáo viên</label>
                                  <RSelect
                                    options={teacherList}
                                    value={search.teacher}
                                    onChange={(e) => setSearch({ ...search, teacher: e })}
                                  />
                                </div>
                              </Col>

                              <Col size="6">
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Trạng thái</label>
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
                              Đặt lại bộ lọc
                            </a>
                            <button
                              onClick={() => {
                                handleFilter();
                              }}
                              type="button"
                              className="btn btn-secondary"
                            >
                              Lọc
                            </button>
                          </div>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </li>
                    {(role === "ADMIN" || role === "MANAGER") && (
                      <li className="nk-block-tools-opt" onClick={() => setModal({ add: true })}>
                        <Button color="primary">
                          <Icon name="plus"></Icon>
                          <span>Thêm lớp mới</span>
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
                {/* <DataTableRow>
                  <span
                    onClick={() => handleSort("id")}
                    className="sub-text"
                    style={{ fontWeight: "bold", cursor: "pointer" }}
                  >
                    ID {upDownArrow(sortBy === "id" ? orderBy : "")}
                  </span>
                </DataTableRow> */}
                <DataTableRow>
                  <span
                    onClick={() => handleSort("name")}
                    className="sub-text"
                    style={{ fontWeight: "bold", cursor: "pointer" }}
                  >
                    Tên lớp {upDownArrow(sortBy === "name" ? orderBy : "")}
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span
                    onClick={() => handleSort("classCode")}
                    className="sub-text"
                    style={{ fontWeight: "bold", cursor: "pointer" }}
                  >
                    Mã lớp {upDownArrow(sortBy === "classCode" ? orderBy : "")}
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span className="sub-text" style={{ fontWeight: "bold" }}>
                    Giáo viên
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }}>Môn học</span>
                </DataTableRow>
                <DataTableRow>
                  <span className="sub-text" style={{ fontWeight: "bold" }}>
                    Học kỳ
                  </span>
                </DataTableRow>
                <DataTableRow size="mb">
                  <span className="sub-text" style={{ fontWeight: "bold" }}>
                    Trạng thái
                  </span>
                </DataTableRow>
                <DataTableRow className="nk-tb-col-tools text-end">
                  <span className="sub-text" style={{ fontWeight: "bold" }}>
                    Hành động
                  </span>
                </DataTableRow>
              </DataTableHead>

              {isFetching ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
                  <Spinner color="primary" />
                </div>
              ) : data?.length > 0 ? (
                data.map((item) => {
                  return (
                    <DataTableItem key={item.id} className="nk-tb-item">
                      {/* <DataTableRow>
                        <span>{item.id}</span>
                      </DataTableRow> */}
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
                        <Badge color={item.active ? "success" : "danger"}>
                          {item.active ? "Hoạt động" : "Không hoạt động"}
                        </Badge>
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
                                  {(role === "ADMIN" || role === "MANAGER") && (
                                    <li onClick={() => onEditClick(item.id)}>
                                      <DropdownItem
                                        tag="a"
                                        href="#edit"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                        }}
                                      >
                                        <Icon name="edit"></Icon>
                                        <span>Chỉnh sửa</span>
                                      </DropdownItem>
                                    </li>
                                  )}

                                  <li>
                                    <Link to={`/class-list/get-by-id/${item.id}`}>
                                      <Icon name="eye-fill" />
                                      <span>Xem</span>
                                    </Link>
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
              ) : (
                <div className="text-center">Không tìm thấy lớp học nào</div>
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
          isLoading={isLoading?.add}
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
          isLoading={isLoading?.edit}
        />
        <ToastContainer />
      </Content>
    </>
  );
};

export default ClassList;
