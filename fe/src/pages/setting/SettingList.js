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
import { settingData, statusList, settingTypeList } from "./SettingData";
import authApi from "../../utils/ApiAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addFirstAndDeleteLast, findItemValue, upDownArrow } from "../../utils/Utils";

export const SettingList = () => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await authApi.post("/setting/search", {
          pageSize: itemPerPage,
          pageIndex: currentPage,
          name: search.name,
          type: search?.type?.value,
          active: search?.active === null ? null : search?.active?.value === "Active",
          sortBy: sortBy,
          orderBy: orderBy,
        });
        console.log(response);
        if (response.data.statusCode === 200) {
          setData(response.data.data.settingDTOS);
          setTotalElements(response.data.data.totalElements);
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        toast.error("Lỗi khi tìm kiếm cài đặt!", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    };

    fetchData();
  }, [currentPage, sortBy, orderBy, filterForm]);

  const [formError, setFormError] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    extValue: "",
    settingType: "",
    displayOrder: 0,
    active: "Active",
    description: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    extValue: "",
    settingType: "",
    displayOrder: 0,
    active: "",
    description: "",
  });

  // function to reset the form
  const resetForm = () => {
    setFormData({
      name: "",
      extValue: "",
      settingType: "",
      displayOrder: 0,
      active: "Active",
      description: "",
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
    const { name, extValue, settingType, displayOrder, active, description } = sData;
    console.log(active);
    const submittedData = {
      name: name,
      extValue: extValue,
      settingType: settingType,
      displayOrder: displayOrder,
      active: active === "Active",
      description: description,
    };

    try {
      const response = await authApi.post("/setting/create", submittedData);
      console.log("Tạo cài đặt:", response.data.data);
      if (response.data.statusCode === 200) {
        toast.success("Tạo cài đặt thành công!", {
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
      console.error("Lỗi khi tạo cài đặt:", error);
      toast.error("Lỗi khi tạo cài đặt!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  // submit function to update a new item
  const onEditSubmit = async (sData) => {
    const { name, extValue, settingType, displayOrder, active, description } = sData;
    try {
      const response = await authApi.put("/setting/update/" + editId, {
        id: editId,
        name: name,
        extValue: extValue,
        settingType: settingType,
        displayOrder: displayOrder,
        active: active === "Active",
        description: description,
      });
      console.log("Chỉnh sửa cài đặt: ", response.data);
      if (response.data.statusCode === 200) {
        toast.success("Cập nhật cài đặt thành công!", {
          position: toast.POSITION.TOP_CENTER,
        });
        let submittedData;
        let newitems = data;
        newitems.forEach((item) => {
          if (item.id === editId) {
            submittedData = {
              id: item.id,
              name: name,
              extValue: extValue,
              settingType: settingType,
              displayOrder: displayOrder,
              active: active === "Active",
              description: description,
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
      console.error("Lỗi khi cập nhật cài đặt:", error);
      toast.error("Lỗi khi cập nhật cài đặt!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    data.forEach((item) => {
      if (item.id === id) {
        setEditFormData({
          name: item.name,
          extValue: item.extValue,
          settingType: item.settingType,
          displayOrder: item.displayOrder,
          active: item.active ? "Active" : "InActive",
          description: item.description,
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
      <Head title="Danh sách cài đặt"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page> Cài đặt </BlockTitle>
              <BlockDes className="text-soft"> Bạn có tổng cộng {totalElements} cài đặt </BlockDes>
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
                            <span className="sub-title dropdown-title"> Lọc cài đặt </span>
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
                                  <label className="form-label">Tên</label>
                                  <input
                                    type="text"
                                    value={search.name}
                                    placeholder="Nhập tên"
                                    onChange={(e) => setSearch({ ...search, name: e.target.value })}
                                    className="form-control"
                                  />
                                </div>
                              </Col>
                              <Col size="6">
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Loại cài đặt</label>
                                  <RSelect
                                    options={settingTypeList}
                                    value={search.type}
                                    onChange={(e) => setSearch({ ...search, type: e })}
                                  />
                                </div>
                              </Col>
                              <Col size="6">
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
                        <span> Thêm cài đặt </span>
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
                  <span onClick={() => handleSort("id")} className="sub-text">
                    ID {upDownArrow(sortBy === "id" ? orderBy : "")}
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span onClick={() => handleSort("name")} className="sub-text">
                    Tên {upDownArrow(sortBy === "name" ? orderBy : "")}
                  </span>
                </DataTableRow>
                <DataTableRow size="mb">
                  <span onClick={() => handleSort("extValue")} className="sub-text">
                    Chi tiết {upDownArrow(sortBy === "extValue" ? orderBy : "")}
                  </span>
                </DataTableRow>
                <DataTableRow size="mb">
                  <span onClick={() => handleSort("settingType")} className="sub-text">
                    Loại cài đặt {upDownArrow(sortBy === "settingType" ? orderBy : "")}
                  </span>
                </DataTableRow>
                <DataTableRow size="mb">
                  <span onClick={() => handleSort("displayOrder")} className="sub-text">
                    Thứ tự hiển thị {upDownArrow(sortBy === "displayOrder" ? orderBy : "")}
                  </span>
                </DataTableRow>
                <DataTableRow size="mb">
                  <span className="sub-text">Trạng thái</span>
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
                          <span>{item.id}</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span>{item.name}</span>
                        </DataTableRow>
                        <DataTableRow size="mb">
                          <span>{item.extValue}</span>
                        </DataTableRow>
                        <DataTableRow size="mb">
                          <span>{findItemValue(settingTypeList, "value", "label", item.settingType)}</span>
                        </DataTableRow>
                        <DataTableRow size="mb" className="text-center">
                          <span>{item.displayOrder}</span>
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
                  <span className="text-silent">Không tìm thấy cài đặt</span>
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
        />
        <FormModal
          modal={modal.edit}
          modalType="edit"
          formData={editFormData}
          setFormData={setEditFormData}
          closeModal={closeEditModal}
          onSubmit={onEditSubmit}
        />
        <ToastContainer />
      </Content>
    </>
  );
};

export default SettingList;
