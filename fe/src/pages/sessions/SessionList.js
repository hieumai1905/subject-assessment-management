import React, { useEffect, useState } from "react";
import Head from "../../layout/head/Head";
import Content from "../../layout/content/Content";
import { DropdownMenu, DropdownToggle, UncontrolledDropdown, DropdownItem, Badge, Spinner } from "reactstrap";
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
import FormModal from "./FormModal";
import { settingData, statusList, settingTypeList } from "./SettingData";
import authApi from "../../utils/ApiAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  addFirstAndDeleteLast,
  convertToOptions,
  formatDateToDDMMYYYY,
  getOnlyDate,
  getOnlyDate2,
  upDownArrow,
} from "../../utils/Utils";
import Swal from "sweetalert2";
import useAuthStore from "../../store/Userstore";
import { canModifySessionCouncil } from "../../utils/CheckPermissions";

const SessionList = () => {
  const [sm, updateSm] = useState(false);
  const [modal, setModal] = useState({
    edit: false,
    add: false,
  });
  const [editId, setEditedId] = useState();
  const [data, setData] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("id");
  const [orderBy, setOrderBy] = useState("desc");
  const [search, setSearch] = useState({
    name: "",
    type: null,
    active: null,
  });
  const [filterForm, setFilterForm] = useState({
    semester: null,
    subject: null,
    round: null,
  });
  const [isFetching, setIsFetching] = useState({
    semester: true,
    subject: true,
    round: true,
    session: true,
    submit: false,
  });
  const { role, user } = useAuthStore((state) => state);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => {
    if (user && role) {
      setCanEdit(canModifySessionCouncil(user, role));
    }
  }, [user, role]);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        setIsFetching({ ...isFetching, semester: true });
        const response = await authApi.post("/setting/search", {
          pageSize: 9999,
          pageIndex: 1,
          type: "Semester",
          active: true,
          sortBy: "displayOrder",
          orderBy: "ASC",
        });
        console.log("semester:", response.data.data);
        if (response.data.statusCode === 200) {
          let semesters = convertToOptions(response.data.data.settingDTOS, "id", "name");
          setSemesters(semesters);
          if (response.data.data.totalElements > 0) {
            let selectedSemester = {
              value: semesters[0]?.value,
              label: semesters[0]?.label,
            };
            setFilterForm({
              ...filterForm,
              semester: selectedSemester,
            });
          }
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Xảy ra lỗi khi tìm kiếm học kỳ", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching({ ...isFetching, semester: false });
      }
    };
    fetchSemesters();
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (isFetching.semester) return false;
      try {
        setIsFetching({ ...isFetching, subject: true });
        const response = await authApi.post("/subjects/search", {
          pageSize: 9999,
          pageIndex: 1,
          active: true,
        });
        console.log("subject:", response.data.data);
        if (response.data.statusCode === 200) {
          setSubjects(convertToOptions(response.data.data.subjects, "id", "subjectCode"));
          if (response.data.data.totalElements > 0)
            setFilterForm({
              ...filterForm,
              subject: {
                value: response.data.data.subjects[0]?.id,
                label: response.data.data.subjects[0]?.subjectCode,
              },
            });
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Xảy ra lỗi khi tìm kiếm môn học", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching({ ...isFetching, subject: false });
      }
    };
    fetchSubjects();
  }, [isFetching.semester]);

  const fetchRounds = async () => {
    try {
      if (!filterForm?.subject?.value) {
        setIsFetching({ ...isFetching, round: false });
        return;
      }
      setIsFetching({ ...isFetching, round: true });
      const response = await authApi.post("/setting/search", {
        pageSize: 9999,
        pageIndex: 1,
        type: "Round",
        active: true,
        sortBy: "displayOrder",
        orderBy: "ASC",
        isSubjectSetting: true,
        subjectId: filterForm?.subject?.value,
      });
      console.log("round:", response.data.data);
      if (response.data.statusCode === 200) {
        let rounds = convertToOptions(response.data.data.settingDTOS, "id", "name");
        setRounds(rounds);
        if (response.data.data.totalElements > 0) {
          let selectedRound = {
            value: rounds[0]?.value,
            label: rounds[0]?.label,
          };
          setFilterForm({
            ...filterForm,
            round: selectedRound,
          });
        } else {
          setFilterForm({
            ...filterForm,
            round: null,
          });
        }
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi tìm kiếm lần đánh giá", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, round: false });
    }
  };
  const fetchData = async () => {
    try {
      if (!filterForm?.semester?.value || !filterForm?.round?.value) {
        setIsFetching({ ...isFetching, session: false });
        setData([]);
        setTotalElements(0);
        return false;
      }
      setIsFetching({ ...isFetching, session: true });
      const response = await authApi.post("/sessions/search", {
        pageSize: itemPerPage,
        pageIndex: currentPage,
        semesterId: filterForm?.semester?.value,
        settingId: filterForm?.round?.value,
        sortBy: sortBy,
        orderBy: orderBy,
      });
      console.log("session:", response.data.data);
      if (response.data.statusCode === 200) {
        setData(response.data.data.sessionDTOs);
        setTotalElements(response.data.data.totalElements);
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi tìm kiếm phiên đánh giá", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, session: false });
      setIsFirst(false);
    }
  };

  //load first time
  useEffect(() => {
    if (isFirst && !isFetching?.subject) {
      fetchRounds();
    }
  }, [isFetching.subject]);
  useEffect(() => {
    if (isFirst && !isFetching?.round) {
      fetchData();
    }
  }, [isFetching.round]);
  //----------------------------

  // load when select change
  useEffect(() => {
    if (!isFirst && !isFetching?.subject) {
      fetchRounds();
    }
  }, [filterForm?.subject?.value]);
  useEffect(() => {
    if (!isFirst && !isFetching?.semester && !isFetching?.round) {
      fetchData();
    }
  }, [currentPage, sortBy, orderBy, filterForm?.semester?.value, filterForm?.round?.value]);
  //-----------------------

  const [formError, setFormError] = useState({});
  const [formData, setFormData] = useState({
    name: `${getOnlyDate2(new Date())}_AM`,
    semesterId: 0,
    sessionDate: formatDateToDDMMYYYY(new Date()),
    round: filterForm?.round,
    time: "Active",
    note: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    semesterId: 0,
    sessionDate: `2024-08-30`,
    round: null,
    time: "Active",
    note: "",
  });

  // function to reset the form
  const resetForm = () => {
    setFormData({
      name: `${getOnlyDate2(new Date())}_AM`,
      semesterId: 0,
      sessionDate: formatDateToDDMMYYYY(new Date()),
      round: filterForm?.round,
      time: "Active",
      note: "",
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
    const { name, time, sessionDate, note, round } = sData;
    const submittedData = {
      name: name,
      time: time === "Active",
      sessionDate: sessionDate,
      note: note,
      subjectSettingId: round?.value,
      semesterId: filterForm?.semester?.value,
      subjectId: filterForm?.subject?.value,
    };
    setIsFetching({ ...isFetching, submit: true });
    try {
      const response = await authApi.post("/sessions/create", submittedData);
      console.log("create session:", response.data.data);
      if (response.data.statusCode === 200) {
        toast.success("Tạo phiên đánh giá thành công", {
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
      console.error("Error creating session:", error);
      toast.error("Xảy ra lỗi khi tạo phiên đánh giá", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, submit: false });
    }
  };

  // submit function to update a new item
  const onEditSubmit = async (sData) => {
    const { name, time, sessionDate, note, round } = sData;

    setIsFetching({ ...isFetching, submit: true });
    try {
      const response = await authApi.put("/sessions/update/" + editId, {
        id: editId,
        name: name,
        time: time === "Active",
        sessionDate: sessionDate,
        note: note,
        subjectSettingId: round?.value,
        semesterId: filterForm?.semester?.value,
        subjectId: filterForm?.subject?.value,
      });
      console.log("edit session: ", response.data.data);
      if (response.data.statusCode === 200) {
        toast.success("Cập nhật phiên đánh giá thành công", {
          position: toast.POSITION.TOP_CENTER,
        });
        let submittedData;
        let newitems = data;
        newitems.forEach((item) => {
          if (item.id === editId) {
            submittedData = {
              id: item.id,
              name: name,
              time: time === "Active",
              sessionDate: sessionDate,
              note: note,
              subjectSettingId: round?.value,
              subjectSettingName: round?.label,
              semesterId: filterForm?.semester?.value,
              canDelete: response.data.data?.canDelete,
            };
          }
        });
        let index = newitems.findIndex((item) => item.id === editId);
        newitems[index] = submittedData;
        setModal({ edit: false });
        resetForm();
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error update session:", error);
      toast.error("Xảy ra lỗi khi cập nhật phiên đánh giá", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, submit: false });
    }
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    data.forEach((item) => {
      if (item.id === id) {
        setEditFormData({
          name: item.name,
          time: item.time ? "Active" : "InActive",
          note: item.note,
          sessionDate: item.sessionDate.split("T")[0],
          round: rounds.find((r) => r.value === item.subjectSettingId),
        });
        setModal({ edit: true }, { add: false });
        setEditedId(id);
      }
    });
  };

  // function to delete selected item
  const onDeleteClick = async (id) => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: `Bạn có chắc chắn muốn xóa phiên đánh giánày?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đồng ý xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await authApi.delete("/sessions/delete/" + id);
          console.log("Xóa: ", response.data);
          if (response.data.statusCode === 200) {
            toast.success("Xóa phiên đánh giá thành công!", {
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
          console.error("Lỗi khi xóa phiên đánh giá", error);
          toast.error("Lỗi khi xóa phiên đánh giá", {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      }
    });
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
      <Head title="Setting List"></Head>
      <Content>
        <BlockTitle page>Các Phiên Đánh Giá Cuối Kỳ</BlockTitle>
        <BlockDes>Bạn có tổng cộng {data.length} phiên đánh giá</BlockDes>
        <div className="d-flex justify-content-between align-items-end w-100 mb-3 mt-4">
          <div className="d-flex align-items-end" style={{ gap: "20px" }}>
            <div className="form-group mb-0" style={{ minWidth: "150px" }}>
              <label className="form-label">Học Kỳ</label>
              {isFetching?.semester ? (
                <div>
                  <Spinner />
                </div>
              ) : (
                <RSelect
                  options={semesters}
                  value={filterForm.semester}
                  onChange={(e) => setFilterForm({ ...filterForm, semester: e })}
                  styles={{ control: (base) => ({ ...base, width: "100%" }) }}
                />
              )}
            </div>
            <div className="form-group mb-0" style={{ minWidth: "150px" }}>
              <label className="form-label">Môn Học</label>
              {isFetching?.subject ? (
                <div>
                  <Spinner />
                </div>
              ) : (
                <RSelect
                  options={subjects}
                  value={filterForm.subject}
                  onChange={(e) => setFilterForm({ ...filterForm, subject: e })}
                  styles={{ control: (base) => ({ ...base, width: "100%" }) }}
                />
              )}
            </div>
            <div className="form-group mb-0" style={{ minWidth: "150px" }}>
              <label className="form-label">Lần đánh giá</label>
              {isFetching?.round ? (
                <div>
                  <Spinner />
                </div>
              ) : (
                <RSelect
                  options={rounds}
                  value={filterForm.round}
                  onChange={(e) => setFilterForm({ ...filterForm, round: e })}
                  styles={{ control: (base) => ({ ...base, width: "100%" }) }}
                />
              )}
            </div>
          </div>
          <div className="text-end">
            {canEdit && (
              <Button
                color="primary"
                onClick={() => {
                  setModal({ add: true });
                  setFormData({ ...formData, round: filterForm.round });
                }}
              >
                <Icon name="plus"></Icon>
                <span>Thêm Mới</span>
              </Button>
            )}
          </div>
        </div>

        <Block>
          {isFetching?.session ? (
            <div className="d-flex justify-content-center">
              <Spinner style={{ width: "3rem", height: "3rem" }} />
            </div>
          ) : (
            <DataTable className="card-stretch">
              <DataTableBody>
                <DataTableHead className="nk-tb-item nk-tb-head">
                  <DataTableRow>
                    <span className="sub-text">Mã</span>
                  </DataTableRow>
                  <DataTableRow>
                    <span className="sub-text">Vòng</span>
                  </DataTableRow>
                  <DataTableRow>
                    <span className="sub-text">Phiên Đánh Giá</span>
                  </DataTableRow>
                  <DataTableRow>
                    <span className="sub-text">Ngày</span>
                  </DataTableRow>
                  <DataTableRow>
                    <span className="sub-text">Sáng/Chiều</span>
                  </DataTableRow>
                  <DataTableRow className="nk-tb-col-tools text-end">
                    <span className="sub-text">Hành Động</span>
                  </DataTableRow>
                </DataTableHead>
                {data.length > 0
                  ? data.map((item) => {
                      return (
                        <DataTableItem key={item.id}>
                          <DataTableRow>
                            <span>{item.id}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>{item.subjectSettingName}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>
                              {getOnlyDate(item.sessionDate)}_{item.time ? "AM" : "PM"}
                            </span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>{getOnlyDate(item.sessionDate)}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>{item.time ? "Sáng" : "Chiều"}</span>
                          </DataTableRow>
                          <DataTableRow className="nk-tb-col-tools text-end">
                            <ul className="nk-tb-actions gx-1">
                              <li>
                                <UncontrolledDropdown>
                                  <DropdownToggle
                                    tag="a"
                                    className="text-soft dropdown-toggle btn btn-icon btn-trigger"
                                  >
                                    <Icon name="more-h"></Icon>
                                  </DropdownToggle>
                                  <DropdownMenu end>
                                    <ul className="link-list-opt no-bdr">
                                      <li onClick={() => onEditClick(item.id)}>
                                        <DropdownItem
                                          tag="a"
                                          href="#edit"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                          }}
                                        >
                                          <Icon name={`${canEdit ? "edit" : "info"}`}></Icon>
                                          <span>{canEdit ? "Chỉnh Sửa" : "Xem"}</span>
                                        </DropdownItem>
                                      </li>
                                      {item.canDelete && canEdit && (
                                        <li
                                          onClick={() => {
                                            onDeleteClick(item.id);
                                          }}
                                        >
                                          <DropdownItem
                                            tag="a"
                                            href="#delete"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                            }}
                                          >
                                            <Icon name="trash"></Icon>
                                            <span>Xóa</span>
                                          </DropdownItem>
                                        </li>
                                      )}
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
                    <span className="text-silent">Không có dữ liệu</span>
                  </div>
                )}
              </div>
            </DataTable>
          )}
        </Block>

        <FormModal
          modal={modal.add}
          modalType="add"
          formData={formData}
          setFormData={setFormData}
          closeModal={closeModal}
          onSubmit={onFormSubmit}
          rounds={rounds}
          filterForm={filterForm}
          isFetching={isFetching?.submit}
          canEdit={canEdit}
        />
        <FormModal
          modal={modal.edit}
          modalType="edit"
          formData={editFormData}
          setFormData={setEditFormData}
          closeModal={closeEditModal}
          onSubmit={onEditSubmit}
          rounds={rounds}
          filterForm={filterForm}
          isFetching={isFetching?.submit}
          canEdit={canEdit}
        />
        <ToastContainer />
      </Content>
    </>
  );
};

export default SessionList;
