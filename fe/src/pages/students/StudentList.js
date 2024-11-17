import React, { useEffect, useState } from "react";
import Head from "../../layout/head/Head";
import Content from "../../layout/content/Content";
import { DropdownMenu, DropdownToggle, UncontrolledDropdown, DropdownItem, Badge } from "reactstrap";
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
import authApi from "../../utils/ApiAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addFirstAndDeleteLast, findItemValue, upDownArrow } from "../../utils/Utils";
import { statusList } from "../../data/ConstantData";

export const StudentList = () => {
  const [sm, updateSm] = useState(false);
  const [modal, setModal] = useState({
    edit: false,
    add: false,
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
    type: null,
    active: null,
  });
  const [filterForm, setFilterForm] = useState({});
  const [isFetching, setIsFetching] = useState({
    add: false,
    edit: false,
    get: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await authApi.post("/students/search", {
          pageSize: itemPerPage,
          pageIndex: currentPage,
          keyWord: search.name,
          roleName: "STUDENT",
          active: search?.active === null ? null : search?.active?.value,
          sortBy: sortBy,
          orderBy: orderBy,
        });
        console.log(response);
        if (response.data.statusCode === 200) {
          setData(response.data.data.users);
          setTotalElements(response.data.data.totalElements);
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        toast.error("Lỗi khi tìm kiếm sinh viên!", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    };

    fetchData();
  }, [currentPage, sortBy, orderBy, filterForm]);

  const [formError, setFormError] = useState({});
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    note: "",
    gender: "Nam",
  });
  const [editFormData, setEditFormData] = useState({
    fullname: "",
    email: "",
    note: "",
    gender: "Nam",
  });

  // function to reset the form
  const resetForm = () => {
    setFormData({
      fullname: "",
      email: "",
      note: "",
      gender: "Nam",
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
    const { fullname, email, note, gender } = sData;
    const submittedData = {
      fullname: fullname,
      email: email,
      note: note,
      gender: gender,
      roleId: 4,
    };

    try {
      setIsFetching({ ...isFetching, add: true });
      const response = await authApi.post("/students/create", submittedData);
      console.log("Tạo sinh viên:", response.data.data);
      if (response.data.statusCode === 200) {
        toast.success("Thêm mới sinh viên thành công!", {
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
      console.error("Lỗi khi tạo sinh viên:", error);
      toast.error("Lỗi khi thêm mới sinh viên!", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, add: false });
    }
  };

  // submit function to update a new item
  const onEditSubmit = async (sData) => {
    const { fullname, email, mobile, gender, note, active, avatar } = sData;
    try {
      setIsFetching({ ...isFetching, edit: true });
      // Tạo đối tượng FormData
      const formData = new FormData();

      // Thêm các trường thông tin vào FormData
      formData.append("id", editId);
      formData.append("fullname", fullname);
      formData.append("email", email);
      if(mobile)
        formData.append("mobile", mobile);
      formData.append("gender", gender);
      if(note)
        formData.append("note", note);
      formData.append("active", active === "Active");

      // Thêm file avatar nếu có
      if (avatar) {
        formData.append("file", avatar);
      }
      // Gửi request PUT
      const response = await authApi.put(`/students/update/${editId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Đảm bảo gửi dưới dạng FormData
        },
      });
      console.log("Chỉnh sửa thông tin sinh viên: ", response.data);
      if (response.data.statusCode === 200) {
        toast.success("Cập nhật thông tin sinh viên thành công!", {
          position: toast.POSITION.TOP_CENTER,
        });
        let submittedData;
        let newitems = data;
        // newitems.forEach((item) => {
        //   if (item.id === editId) {
        //     submittedData = {
        //       id: item.id,
        //       fullname: fullname,
        //       email: email,
        //       gender: gender,
        //       note: note,
        //       active: active === "Active",
        //       avatar_url: avatar,
        //     };
        //   }
        // });
        let index = newitems.findIndex((item) => item.id === editId);
        newitems[index] = response.data?.data;
        setModal({ edit: false });
        resetForm();
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin sinh viên:", error);
      toast.error("Lỗi khi cập nhật thông tin sinh viên!", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, edit: false });
    }
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    data.forEach((item) => {
      if (item.id === id) {
        setEditFormData({
          fullname: item.fullname,
          email: item.email,
          gender: item.gender,
          displayOrder: item.displayOrder,
          active: item.active ? "Active" : "InActive",
          note: item.note,
          avatar_url: item.avatar_url,
          mobile: item.mobile
        });
        setModal({ edit: true }, { add: false });
        setEditedId(id);
      }
    });
  };

  // function to delete selected item
  const onDeleteClick = async (id) => {
    try {
      const response = await authApi.delete("/setting/delete/" + id);
      console.log("delete: ", response.data);
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
      console.error("Error delete setting:", error);
      toast.error("Error delete setting!", {
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
      <Head title="Quản lý sinh viên"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page> Quản lý sinh viên </BlockTitle>
              <BlockDes className="text-soft"> Bạn có tổng cộng {totalElements} sinh viên </BlockDes>
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
                          <span> Bộ lọc </span>
                          <Icon name="chevron-right" className="dd-indc"></Icon>
                        </DropdownToggle>
                        <DropdownMenu end className="filter-wg dropdown-menu-xl" style={{ overflow: "visible" }}>
                          <div className="dropdown-head">
                            <span className="sub-title dropdown-title"> Lọc sinh viên </span>
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
                                  <label className="form-label">Từ khóa</label>
                                  <input
                                    type="text"
                                    value={search.name}
                                    placeholder="Nhập từ khóa"
                                    onChange={(e) => setSearch({ ...search, name: e.target.value })}
                                    className="form-control"
                                  />
                                </div>
                              </Col>
                              <Col size="12">
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Trạng thái</label>
                                  <RSelect
                                    options={statusList}
                                    value={search.active}
                                    onChange={(e) => setSearch({ ...search, active: e })}
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
                                  type: null,
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
                    <li className="nk-block-tools-opt" onClick={() => setModal({ add: true })}>
                      <Button color="primary">
                        <Icon name="plus"></Icon>
                        <span> Thêm sinh viên </span>
                      </Button>
                    </li>
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
                  <span onClick={() => handleSort("code")} className="sub-text">
                    Mã sinh viên {upDownArrow(sortBy === "code" ? orderBy : "")}
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span onClick={() => handleSort("fullname")} className="sub-text">
                    Tên {upDownArrow(sortBy === "fullname" ? orderBy : "")}
                  </span>
                </DataTableRow>
                <DataTableRow size="mb">
                  <span onClick={() => handleSort("email")} className="sub-text">
                    Email {upDownArrow(sortBy === "email" ? orderBy : "")}
                  </span>
                </DataTableRow>
                {/* <DataTableRow size="mb">
                  <span onClick={() => handleSort("gender")} className="sub-text">
                    Giới tính {upDownArrow(sortBy === "gender" ? orderBy : "")}
                  </span>
                </DataTableRow> */}
                <DataTableRow size="mb">
                  <span onClick={() => handleSort("active")} className="sub-text">
                    Trạng thái {upDownArrow(sortBy === "active" ? orderBy : "")}
                  </span>
                </DataTableRow>
                <DataTableRow className="nk-tb-col-tools text-end">
                  <span className="sub-text">Hành động</span>
                </DataTableRow>
              </DataTableHead>
              {data.length > 0
                ? data.map((item) => {
                    return (
                      <DataTableItem key={item.id}>
                        <DataTableRow>
                          <span>{item.code}</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span>{item.fullname}</span>
                        </DataTableRow>
                        <DataTableRow size="mb">
                          <span>{item.email}</span>
                        </DataTableRow>
                        {/* <DataTableRow size="mb">
                          <span>{item.gender}</span>
                        </DataTableRow> */}
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
                                    {/* <li onClick={() => {
                                // eslint-disable-next-line no-restricted-globals
                                if(confirm('Bạn có chắc chắn muốn xóa cài đặt này?') === true)
                                  onDeleteClick(item.id);
                              }}>
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
                              </li> */}
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
                  <span className="text-silent">Không tìm thấy kết quả nào!</span>
                </div>
              )}
            </div>
          </DataTable>
        </Block>

        <FormModal
          modal={modal.add}
          modalType="add"
          formData={formData}
          setFormData={setFormData}
          closeModal={closeModal}
          onSubmit={onFormSubmit}
          isLoading={isFetching?.add}
        />
        <FormModal
          modal={modal.edit}
          modalType="edit"
          formData={editFormData}
          setFormData={setEditFormData}
          closeModal={closeEditModal}
          onSubmit={onEditSubmit}
          isLoading={isFetching?.edit}
        />
        <ToastContainer />
      </Content>
    </>
  );
};

export default StudentList;
