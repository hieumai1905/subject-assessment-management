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
// import { settingData, statusList, settingTypeList } from "./SettingData";
import authApi from "../../utils/ApiAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addFirstAndDeleteLast, upDownArrow } from "../../utils/Utils";
import { settingTypeData, statusList } from "../../data/ConstantData";
import useQueryAssignment from "../../hooks/UseQueryAssignment";
import { Link } from "react-router-dom";
import useQueryCriteria from "../../hooks/UseQueryCriteria";

export const CriteriaList = ({ assignment }) => {
  const [sm, updateSm] = useState(false);
  const [modal, setModal] = useState({
    edit: false,
    add: false,
  });
  const [editId, setEditedId] = useState();
  const [data, setData] = useState([]);
  const [totalElements, setTotalElements] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage] = useState(7);
  const [sortBy, setSortBy] = useState("id");
  const [orderBy, setOrderBy] = useState("desc");
  const [search, setSearch] = useState({});
  const [filterForm, setFilterForm] = useState({
    criteriaName: "",
    minEvalWeight: null,
    maxEvalWeight: null,
    active: null,
  });
  const [criterias, setCriterias] = useState([]);
  const { criteriaResponse, loading, error } = useQueryCriteria({
    currentPage,
    itemPerPage,
    setTotalElements,
    search,
    assignmentId: assignment?.id,
    sortBy,
    orderBy,
    setCriterias,
  });
  useEffect(() => {
    if (error) {
      toast.error(`${error}`, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }, [error]);

  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    criteriaName: "",
    evalWeight: "",
    workEval: "",
    guides: "",
    note: "",
    active: "Active",
  });
  const [editFormData, setEditFormData] = useState({
    criteriaName: "",
    evalWeight: "",
    workEval: "",
    guides: "",
    note: "",
    active: "Active",
  });

  const resetForm = () => {
    setFormData({
      criteriaName: "",
      evalWeight: "",
      workEval: "",
      guides: "",
      note: "",
      active: "Active",
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

  const onFormSubmit = async (sData) => {
    const { criteriaName, evalWeight, workEval, active, note, guides } = sData;
    const submittedData = {
      criteriaName: criteriaName,
      evalWeight: evalWeight,
      workEval: workEval,
      active: active === "Active",
      note: note,
      guides: guides,
      assignmentId: assignment?.id,
    };
    try {
      const response = await authApi.post("/evaluation-criteria/create", submittedData);
      console.log("create criteria:", response.data.data);
      if (response.data.statusCode === 200) {
        toast.success("Create criteria successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        setTotalElements(totalElements + 1);
        setCriterias(addFirstAndDeleteLast(criterias, response.data.data, itemPerPage));
        resetForm();
        setModal({ add: false });
      } else {
        toast.error(`${response.data.data}`, {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error assignment setting:", error);
      toast.error("Error assignment setting!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  // submit function to update a new item
  const onEditSubmit = async (sData) => {
    const { criteriaName, evalWeight, workEval, active, note, guides } = sData;
    try {
      const response = await authApi.put("/evaluation-criteria/update/" + editId, {
        id: editId,
        criteriaName: criteriaName,
        workEval: workEval,
        evalWeight: evalWeight,
        active: active === "Active",
        note: note,
        guides: guides,
        assignmentId: assignment?.id,
      });
      console.log("edit criteria: ", response.data);
      if (response.data.statusCode === 200) {
        toast.success("Update criteria successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        let submittedData;
        criterias.forEach((item) => {
          if (item.id === editId) {
            submittedData = {
              id: editId,
              criteriaName: criteriaName,
              workEval: workEval,
              evalWeight: evalWeight,
              active: active === "Active",
              note: note,
              guides: guides,
            };
          }
        });
        let index = criterias.findIndex((item) => item.id === editId);
        criterias[index] = submittedData;
        setModal({ edit: false });
        resetForm();
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      console.error("Error update criteria:", error);
      toast.error("Error update criteria!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    criterias.forEach((item) => {
      if (item.id === id) {
        setEditFormData({
          criteriaName: item.criteriaName,
          workEval: item.workEval,
          evalWeight: item.evalWeight,
          active: item.active ? "Active" : "InActive",
          note: item.note,
          guides: item.guides,
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
      <Head title="Criteria List"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page> Evaluation Criterias</BlockTitle>
              <BlockDes className="text-soft">You have total {totalElements} criterias</BlockDes>
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
                            <span className="sub-title dropdown-title">Filter Criteria</span>
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
                                  <label className="form-label">Criteria Name</label>
                                  <input
                                    type="text"
                                    value={filterForm.criteriaName}
                                    placeholder="Enter criteria name"
                                    onChange={(e) => setFilterForm({ ...filterForm, criteriaName: e.target.value })}
                                    className="form-control"
                                  />
                                </div>
                              </Col>
                              <Col size="12">
                                <div className="form-group">
                                  <label className="form-label">Evaluation Weight</label>
                                  <div className="row">
                                    <div className="input-group input-group-sm w-50">
                                      <div className="input-group-prepend">
                                        <span className="input-group-text" id="inputGroup-sizing-sm">
                                          From
                                        </span>
                                      </div>
                                      <input
                                        type="number"
                                        value={filterForm?.minEvalWeight === null ? "" : filterForm?.minEvalWeight}
                                        min="0"
                                        maxLength="10"
                                        className="form-control"
                                        onChange={(e) =>
                                          setFilterForm({ ...filterForm, minEvalWeight: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div className="input-group input-group-sm w-50">
                                      <div className="input-group-prepend">
                                        <span className="input-group-text" id="inputGroup-sizing-sm">
                                          To
                                        </span>
                                      </div>
                                      <input
                                        type="number"
                                        min="0"
                                        value={filterForm?.maxEvalWeight === null ? "" : filterForm.maxEvalWeight}
                                        maxLength={10}
                                        className="form-control"
                                        onChange={(e) =>
                                          setFilterForm({ ...filterForm, maxEvalWeight: e.target.value })
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              </Col>
                              <Col md="12">
                                <div className="form-group">
                                  <label className="form-label">Status</label>
                                  <RSelect
                                    options={statusList}
                                    value={filterForm.active}
                                    onChange={(e) => setFilterForm({ ...filterForm, active: e })}
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
                                  criteriaName: "",
                                  minEvalWeight: null,
                                  maxEvalWeight: null,
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
                    <li className="nk-block-tools-opt" onClick={() => setModal({ add: true })}>
                      <Button color="primary">
                        <Icon name="plus"></Icon>
                        <span>Add Criteria</span>
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
                  <span onClick={() => handleSort("criteriaName")} className="sub-text">
                    Criteria Name {upDownArrow(sortBy === "criteriaName" ? orderBy : "")}
                  </span>
                </DataTableRow>
                <DataTableRow size="mb">
                  <span onClick={() => handleSort("evalWeight")} className="sub-text">
                    Evaluation Weight {upDownArrow(sortBy === "evalWeight" ? orderBy : "")}
                  </span>
                </DataTableRow>
                <DataTableRow size="mb">
                  <span onClick={() => handleSort("workEval")} className="sub-text">
                    Work Evaluation {upDownArrow(sortBy === "workEval" ? orderBy : "")}
                  </span>
                </DataTableRow>
                {/* <DataTableRow size="mb">
                  <span onClick={() => handleSort('displayOrder')}
                   className="sub-text">
                    Display Order {upDownArrow(sortBy === 'displayOrder' ? orderBy : '')}
                  </span>
                </DataTableRow> */}
                <DataTableRow size="mb">
                  <span className="sub-text">Status</span>
                </DataTableRow>
                <DataTableRow className="nk-tb-col-tools text-end">
                  <span className="sub-text">Action</span>
                </DataTableRow>
              </DataTableHead>
              {criterias?.length > 0
                ? criterias.map((item) => {
                    return (
                      <DataTableItem key={item.id}>
                        <DataTableRow>
                          <span>{item.id}</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span>{item.criteriaName}</span>
                        </DataTableRow>
                        <DataTableRow size="mb">
                          <span>{item.evalWeight} %</span>
                        </DataTableRow>
                        <DataTableRow size="mb">
                          <span>{item.workEval}</span>
                        </DataTableRow>
                        {/* <DataTableRow size="mb">
                          <span>{item.displayOrder}</span>
                        </DataTableRow> */}
                        <DataTableRow size="mb">
                          <span>{item.active ? "Active" : "InActive"}</span>
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
                                        <span>Edit</span>
                                      </DropdownItem>
                                    </li>
                                    <li
                                      onClick={() => {
                                        // eslint-disable-next-line no-restricted-globals
                                        if (confirm("Are you sure to delete this assignment?") === true)
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
                                        <span>Delete</span>
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
                  <span className="text-silent">No criterias found</span>
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
      </Content>
    </>
  );
};

export default CriteriaList;
