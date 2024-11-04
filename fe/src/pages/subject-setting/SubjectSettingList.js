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
// import { settingData, statusList, settingTypeList } from "./SettingData";
import authApi from "../../utils/ApiAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addFirstAndDeleteLast, upDownArrow } from "../../utils/Utils";
import useQuerySubjectSetting from "../../hooks/UseQuerySubjectSetting";
import { settingTypeData, statusList } from "../../data/ConstantData";
import useAuthStore from "../../store/Userstore";
import { canModify } from "../../utils/CheckPermissions";

export const SubjectSettingList = ({ subject }) => {
  const [sm, updateSm] = useState(false);
  const [modal, setModal] = useState({
    edit: false,
    add: false,
  });
  const { role } = useAuthStore((state) => state);
  const [editId, setEditedId] = useState();
  const [data, setData] = useState([]);
  const [totalElements, setTotalElements] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage] = useState(7);
  const [sortBy, setSortBy] = useState("id");
  const [orderBy, setOrderBy] = useState("desc");
  const [search, setSearch] = useState({});
  const [filterForm, setFilterForm] = useState({
    name: "",
    type: null,
    active: null,
  });
  const [subjectSettings, setSubjectSettings] = useState([]);
  const { subjectSettingResponse, loading, error } = useQuerySubjectSetting({
    currentPage,
    itemPerPage,
    setTotalElements,
    search,
    subjectId: subject?.id,
    sortBy,
    orderBy,
    setSubjectSettings,
  });
  useEffect(() => {
    if (error) {
      toast.error(`${error}`, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }, [error]);

  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    extValue: "",
    settingType: null,
    displayOrder: 0,
    active: "Active",
    description: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    extValue: "",
    settingType: null,
    displayOrder: 0,
    active: "",
    description: "",
  });

  // function to reset the form
  const resetForm = () => {
    setFormData({
      name: "",
      extValue: "",
      settingType: null,
      displayOrder: 0,
      active: "Active",
      description: "",
    });
    setFormErrors({});
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
    const submittedData = {
      name: name,
      extValue: extValue,
      settingType: settingType?.value,
      displayOrder: displayOrder,
      active: active === "Active",
      description: description,
      subjectId: subject?.id,
    };
    try {
      const response = await authApi.post("/setting/create", submittedData);
      console.log("create subject setting:", response.data.data);
      if (response.data.statusCode === 200) {
        toast.success("Create subject setting successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        setTotalElements(totalElements + 1);
        setSubjectSettings(addFirstAndDeleteLast(subjectSettings, response.data.data, itemPerPage));
        resetForm();
        setModal({ add: false });
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error creating subject setting:", error);
      toast.error("Error creating subject setting!", {
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
        settingType: settingType?.value,
        displayOrder: displayOrder,
        active: active === "Active",
        description: description,
        subjectId: subject?.id,
      });
      console.log("edit subject setting: ", response.data);
      if (response.data.statusCode === 200) {
        toast.success("Update subject setting successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        let submittedData;
        // let newitems = subjectSettings;
        subjectSettings.forEach((item) => {
          if (item.id === editId) {
            submittedData = {
              id: item.id,
              name: name,
              extValue: extValue,
              settingType: settingType?.value,
              displayOrder: displayOrder,
              active: active === "Active",
              description: description,
            };
          }
        });
        let index = subjectSettings.findIndex((item) => item.id === editId);
        subjectSettings[index] = submittedData;
        setModal({ edit: false });
        resetForm();
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error update subject setting:", error);
      toast.error("Error update subject setting!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    subjectSettings.forEach((item) => {
      if (item.id === id) {
        setEditFormData({
          name: item.name,
          extValue: item.extValue,
          settingType: settingTypeData.find((setting) => setting.value === item.settingType),
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
  const onDeleteClick = (id) => {
    let newData = [...data];
    let index = newData.findIndex((item) => item.id === id);
    if (index !== -1) {
      newData.splice(index, 1);
      setData(newData);
    }
  };

  const handleFilter = () => setSearch(filterForm);

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
      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner style={{ width: "3rem", height: "3rem" }} />
        </div>
      ) : (
        <Content>
          <BlockHead size="sm">
            <BlockBetween>
              <BlockHeadContent>
                <BlockTitle page> Settings</BlockTitle>
                <BlockDes className="text-soft">You have total {totalElements} settings</BlockDes>
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
                                    <label className="form-label">Setting Name</label>
                                    <input
                                      type="text"
                                      value={filterForm.name}
                                      placeholder="Enter setting name"
                                      onChange={(e) => setFilterForm({ ...filterForm, name: e.target.value })}
                                      className="form-control"
                                    />
                                  </div>
                                </Col>
                                <Col size="6">
                                  <div className="form-group">
                                    <label className="overline-title overline-title-alt">Setting Type</label>
                                    <RSelect
                                      options={settingTypeData}
                                      value={filterForm.type}
                                      onChange={(e) => setFilterForm({ ...filterForm, type: e })}
                                    />
                                  </div>
                                </Col>
                                <Col size="6">
                                  <div className="form-group">
                                    <label className="overline-title overline-title-alt">Status</label>
                                    <RSelect
                                      options={statusList}
                                      value={filterForm.active}
                                      onChange={(e) => {
                                        setFilterForm({ ...filterForm, active: e });
                                      }}
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
                                  setSearch({});
                                  setFilterForm({
                                    name: "",
                                    type: null,
                                    active: null,
                                  });
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
                      {canModify(role, "subject-setting", "crud") && (
                        <li className="nk-block-tools-opt" onClick={() => setModal({ add: true })}>
                          <Button color="primary">
                            <Icon name="plus"></Icon>
                            <span>Add Setting</span>
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
                    <span onClick={() => handleSort("id")} className="sub-text">
                      ID {upDownArrow(sortBy === "id" ? orderBy : "")}
                    </span>
                  </DataTableRow>
                  <DataTableRow>
                    <span onClick={() => handleSort("name")} className="sub-text">
                      Setting Name {upDownArrow(sortBy === "name" ? orderBy : "")}
                    </span>
                  </DataTableRow>
                  <DataTableRow size="mb">
                    <span onClick={() => handleSort("extValue")} className="sub-text">
                      Value {upDownArrow(sortBy === "extValue" ? orderBy : "")}
                    </span>
                  </DataTableRow>
                  <DataTableRow size="mb">
                    <span onClick={() => handleSort("settingType")} className="sub-text">
                      Setting Type {upDownArrow(sortBy === "settingType" ? orderBy : "")}
                    </span>
                  </DataTableRow>
                  <DataTableRow size="mb">
                    <span onClick={() => handleSort("displayOrder")} className="sub-text">
                      Priority {upDownArrow(sortBy === "displayOrder" ? orderBy : "")}
                    </span>
                  </DataTableRow>
                  <DataTableRow size="mb">
                    <span className="sub-text">Status</span>
                  </DataTableRow>
                  {canModify(role, "subject-setting", "crud") && (
                    <DataTableRow className="nk-tb-col-tools text-end">
                      <span className="sub-text">Action</span>
                    </DataTableRow>
                  )}
                </DataTableHead>
                {subjectSettings?.length > 0
                  ? subjectSettings.map((item) => {
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
                            <span>{item.settingType}</span>
                          </DataTableRow>
                          <DataTableRow size="mb">
                            <span>{item.displayOrder}</span>
                          </DataTableRow>
                          <DataTableRow size="mb">
                            <span>{item.active ? "Active" : "InActive"}</span>
                          </DataTableRow>
                          {canModify(role, "subject-setting", "crud") && (
                            <DataTableRow className="nk-tb-col-tools text-end">
                              <Button onClick={() => onEditClick(item.id)} color="warning">
                                Edit
                              </Button>
                            </DataTableRow>
                          )}
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
                    <span className="text-silent">No settings found</span>
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
            formErrors={formErrors}
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
      )}
    </>
  );
};

export default SubjectSettingList;
