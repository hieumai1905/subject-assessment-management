import React, { useState, useEffect } from "react";
import Content from "../../layout/content/Content";
import Head from "../../layout/head/Head";
import { convertToOptions, isNullOrEmpty, transformToOptionsWithEmail } from "../../utils/Utils";
import { DropdownMenu, DropdownToggle, UncontrolledDropdown, DropdownItem, Spinner, ButtonGroup } from "reactstrap";
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
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableItem,
  Button,
  RSelect,
} from "../../components/Component";
import authApi from "../../utils/ApiAuth";
import { toast, ToastContainer } from "react-toastify";
import { fullRequirementStatuses, requirementStatuses } from "../../data/ConstantData";
import FormModal from "./FormModal";
import ImportRequirementsForm from "./ImportRequirementsForm";
import Swal from "sweetalert2";
import useAuthStore from "../../store/Userstore";
import { canChangeAssignee, canModifyMilestone } from "../../utils/CheckPermissions";
import ViewDetailReq from "./ViewDetailReq";
const RequirementList = ({ teams, milestone, currentTeam }) => {
  const [data, setData] = useState([]);
  const { role } = useAuthStore((state) => state);
  const { user } = useAuthStore((state) => state);
  const [sm, updateSm] = useState(false);
  const [tablesm, updateTableSm] = useState(false);
  const [onSearch, setonSearch] = useState(true);
  const [onSearchText, setSearchText] = useState("");
  const [modal, setModal] = useState({
    edit: false,
    add: false,
    import: false,
    detail: false,
  });
  const [editIds, setEditedIds] = useState([]);
  const [formData, setFormData] = useState({
    reqTitle: "",
    reqType: "",
    complexity: null,
    teams: null,
    note: "",
  });
  const [editFormData, setEditFormData] = useState({
    reqTitle: "",
    reqType: "",
    complexity: null,
    status: null,
    note: "",
    student: null,
  });
  const [importFormData, setImportFormData] = useState({
    teams: null,
    data: null,
  });
  const [actionText, setActionText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [complexities, setComplexities] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [filterForm, setFilterForm] = useState({
    title: "",
    type: "",
    status: null,
    complexity: null,
    user: null,
    team: null,
  });
  const [searchForm, setSearchForm] = useState({
    type: "",
    status: null,
    complexity: null,
    user: null,
    team: null,
  });
  const [isFetching, setIsFetching] = useState({
    complexity: true,
    members: true,
    requirement: true,
    updateReq: "",
    updateId: -1,
  });
  const [detailId, setDetailId] = useState();

  useEffect(() => {
    const fetchComplexity = async () => {
      try {
        setIsFetching({ ...isFetching, complexity: true });
        const response = await authApi.post("/setting/search", {
          pageSize: 9999,
          pageIndex: 1,
          type: "Complexity",
          active: true,
          sortBy: "displayOrder",
          orderBy: "ASC",
          isSubjectSetting: true,
          subjectId: milestone?.subjectId,
        });
        console.log("complexity", response.data.data);
        if (response.data.statusCode === 200) {
          setComplexities(convertToOptions(response.data.data.settingDTOS, "id", "name"));
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error search complexity!", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching({ ...isFetching, complexity: false });
      }
    };

    fetchComplexity();
  }, []);

  useEffect(() => {
    const fetchRequirements = async () => {
      if (isFetching?.complexity) return false;
      try {
        setIsFetching({ ...isFetching, requirement: true });
        const response = await authApi.post("/requirements/search", {
          milestoneId: milestone?.id,
          pageIndex: currentPage,
          pageSize: itemPerPage,
          title: filterForm?.title,
          status: filterForm?.status?.value,
          complexityId: filterForm?.complexity?.value,
          userId: filterForm?.user?.value,
          teamId: filterForm?.team?.value,
          isCurrentRequirements: role === "STUDENT",
        });
        console.log("search requirements:", response.data.data);
        if (response.data.statusCode === 200) {
          setData(response.data.data.requirementDTOs);
          setTotalItems(response.data.data.totalElements);
        } else {
          toast.error(`${response.data.data}`, {
            position: "top-center",
          });
        }
      } catch (error) {
        console.error("Error search requirements:", error);
        toast.error("Error search requirements!", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching({ ...isFetching, requirement: false });
      }
    };
    fetchRequirements();
  }, [milestone, itemPerPage, currentPage, filterForm, isFetching?.complexity]);

  // onChange function for searching name
  const onFilterChange = (e) => {
    setSearchText(e.target.value);
  };

  // function to change the selected property of an item
  const onSelectChange = (e, id) => {
    let newData = data;
    let index = newData.findIndex((item) => item.id === id);
    newData[index].checked = e.currentTarget.checked;
    setData([...newData]);
  };

  // function to set the action to be taken in table header
  const onActionText = (e) => {
    setActionText(e.value);
  };

  const resetForm = () => {
    setFormData({
      reqTitle: "",
      reqType: "",
      complexity: null,
      teams: null,
      note: "",
    });
  };

  const closeModal = () => {
    setModal({ add: false });
    resetForm();
  };

  const closeEditModal = () => {
    setModal({ edit: false });
    setEditedIds([]);
    setEditFormData({
      reqTitle: "",
      reqType: "",
      complexity: null,
      status: null,
      note: "",
      student: null,
    });
  };

  const closeImportModal = () => {
    setModal({ import: false });
    setImportFormData({
      teams: null,
      data: null,
    });
  };

  // function which fires on applying selected action
  const onActionClick = (e, action) => {
    let checkedReqs = data.filter((item) => item.checked === true);
    if (checkedReqs.length === 0) {
      toast.info("Please select at least one item", {
        position: toast.POSITION.TOP_CENTER,
      });
      return false;
    }
    let ids = checkedReqs.map((item) => item.id);
    if (action === "edit") {
      setEditedIds(ids);
      let isSameTeam = true;
      let firstTeamId = checkedReqs[0].teamId;
      checkedReqs.forEach((element) => {
        if (element.teamId !== firstTeamId) {
          isSameTeam = false;
          return;
        }
      });
      if (isSameTeam) {
        setMembers(teamMembers?.filter((item) => item.teamId === firstTeamId)?.flatMap((item) => item.members));
      } else setMembers([]);

      setModal({ edit: true });
    } else if (action === "delete") {
      deleteRequirements(ids);
    }
  };

  const onEditClick = (id, teamId) => {
    setModal({ edit: true });
    setEditedIds([id]);
    setMembers(teamMembers?.filter((item) => item.teamId === teamId)?.flatMap((item) => item.members));
  };

  const deleteRequirements = async (ids) => {
    Swal.fire({
      title: "Are you sure?",
      text: `If you delete requirement, the information relate to requirement like as: evaluation, update tracking will be removed!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await authApi.delete("/requirements", {
            data: ids,
          });
          console.log("delete reqs:", response.data.data);
          if (response.data.statusCode === 200) {
            let newData;
            newData = data.filter((item) => item.checked !== true);
            setData([...newData]);
            setTotalItems(totalItems - ids.length);
            toast.success(`Delete requirements successfully`, {
              position: toast.POSITION.TOP_CENTER,
            });
          } else {
            toast.error(`${response.data.data}`, {
              position: toast.POSITION.TOP_CENTER,
            });
          }
        } catch (error) {
          console.error("Error delete requirements:", error);
          toast.error("Error delete requirements!", {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } else {
        let newData;
        newData = data.map((item) => {
          item.checked = false;
          return item;
        });
        setData([...newData]);
      }
    });
    // if (confirm("Are you sure you want to delete requirements?") === true) {
    // } else {
    // }
  };

  const updateRequirement = async (id, status, studentId, fullname) => {
    if (status === null) {
      Swal.fire({
        title: "Are you sure?",
        text: `If you change other assignee, the before evaluations, update trackings of this requirement will be removed!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, change it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          updateStatusOrAssigneeRequirement(id, status, studentId, fullname);
        }
      });
    } else {
      updateStatusOrAssigneeRequirement(id, status, studentId, fullname);
    }
  };

  const updateStatusOrAssigneeRequirement = async (id, status, studentId, fullname) => {
    try {
      setIsFetching({ ...isFetching, updateReq: !isNullOrEmpty(status) ? "status" : "student" });
      setIsFetching({ ...isFetching, updateId: id });
      const response = await authApi.put("/requirements", {
        status: status,
        requirementIds: [id],
        studentId: studentId,
      });
      console.log("edit reqs: ", response.data.data);
      if (response.data.statusCode === 200) {
        let updatedData = [...data];
        let index = updatedData.findIndex((item) => item.id === id);
        if (index !== -1) {
          if (status !== null) updatedData[index] = { ...updatedData[index], status: status };
          else {
            updatedData[index] = {
              ...updatedData[index],
              studentId: studentId,
              studentFullname: fullname,
            };
          }
          setData(updatedData);
        }
        toast.success(`Update requirement successfully!`, {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error update requirements!", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, updateReq: "" });
      setIsFetching({ ...isFetching, updateId: -1 });
    }
  };

  useEffect(() => {
    const fetchTeamMembersInTeams = async () => {
      if (!teams || teams.length === 0 || isFetching?.complexity || isFetching?.requirement) return false;
      try {
        setIsFetching({ ...isFetching, members: true });
        const newTeamMembers = await Promise.allSettled(
          teams.map(async (team) => {
            if (team.value === null) return null;
            try {
              const response = await authApi.get(`/team-members/find-by-team-id/${team?.value}`);
              if (response.data.statusCode === 200) {
                const members = response.data.data;
                members.unshift({
                  id: -1,
                  fullname: "No one",
                });
                return {
                  teamId: team?.value,
                  members: members,
                };
              } else {
                toast.error(`${response.data.data}`, {
                  position: toast.POSITION.TOP_CENTER,
                });
                return null;
              }
            } catch (error) {
              toast.error("Error fetching team members!", {
                position: toast.POSITION.TOP_CENTER,
              });
              return null;
            }
          })
        );
        const filteredTeamMembers = newTeamMembers
          .filter((result) => result.status === "fulfilled" && result.value)
          .map((result) => result.value);
        setTeamMembers(filteredTeamMembers);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error searching team members!", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching({ ...isFetching, members: false });
      }
    };

    fetchTeamMembersInTeams();
  }, [teams, isFetching?.complexity, isFetching?.requirement]);

  const selectorCheck = (e) => {
    let newData;
    newData = data.map((item) => {
      if (role !== "STUDENT" || item.studentId === user.id) {
        item.checked = e.currentTarget.checked;
      }
      return item;
    });
    setData([...newData]);
  };

  const canTick = (item) => {
    return (
      item.status !== "EVALUATED" && (role !== "STUDENT" || isNullOrEmpty(item.studentId) || item.studentId === user.id)
    );
  };

  const toggle = () => setonSearch(!onSearch);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <ToastContainer />
      <Head title="Requirements"></Head>
      {isFetching?.complexity || isFetching?.requirement ? (
        <div className="d-flex justify-content-center">
          <Spinner style={{ width: "3rem", height: "3rem" }} />
        </div>
      ) : (
        <Content>
          <BlockHead size="sm">
            <BlockBetween>
              <BlockHeadContent>
                <BlockTitle tag="h3" page></BlockTitle>
                <BlockDes className="text-soft">
                  <p>You have total {totalItems} requirements.</p>
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
                      {(role === "STUDENT" || canModifyMilestone(user, role, milestone?.teacherId)) && (
                        <li>
                          <a
                            href="#import"
                            onClick={(ev) => {
                              ev.preventDefault();
                              setModal({ import: true });
                            }}
                            className="btn btn-white btn-outline-light"
                          >
                            <Icon name="download-cloud"></Icon>
                            <span>Import</span>
                          </a>
                        </li>
                      )}
                      {(canModifyMilestone(user, role, milestone?.teacherId) || role === "STUDENT") && (
                        <li className="nk-block-tools-opt">
                          <Button color="primary" className="btn-icon" onClick={() => setModal({ add: true })}>
                            <Icon name="plus"></Icon>
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
              <div className="card-inner position-relative card-tools-toggle">
                <div className="card-title-group">
                  <div className="card-tools">
                    {(role === "STUDENT" || canModifyMilestone(user, role, milestone?.teacherId)) && (
                      <div className="form-inline flex-nowrap gx-3">
                        <div className="btn-wrap">
                          <span className="d-none d-md-block">
                            <Button
                              // disabled={actionText !== "" ? false : true}
                              color="light"
                              outline
                              className="btn-dim me-2"
                              onClick={(e) => {
                                onActionClick(e, "edit");
                              }}
                            >
                              Bulk Edit
                            </Button>
                            <Button
                              // disabled={actionText !== "" ? false : true}
                              color="light"
                              outline
                              className="btn-dim"
                              onClick={(e) => {
                                onActionClick(e, "delete");
                              }}
                            >
                              Bulk Delete
                            </Button>
                          </span>
                          <span className="d-md-none">
                            <Button
                              color="light"
                              outline
                              disabled={actionText !== "" ? false : true}
                              className="btn-dim  btn-icon"
                              onClick={(e) => onActionClick(e)}
                            >
                              <Icon name="arrow-right"></Icon>
                            </Button>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="card-tools me-n1">
                    <ul className="btn-toolbar gx-1">
                      <li>
                        {/* <a
                          href="#search"
                          onClick={(ev) => {
                            ev.preventDefault();
                            toggle();
                          }}
                          className="btn btn-icon search-toggle toggle-search"
                        >
                          <Icon name="search"></Icon>
                        </a> */}
                        <ButtonGroup style={{ width: "300px" }}>
                          <input
                            type="text"
                            placeholder="search by title..."
                            className="form-control w-100"
                            value={onSearchText}
                            onChange={(e) => setSearchText(e.target.value)}
                          />
                          <Button
                            className="bg-gray"
                            onClick={() => {
                              setFilterForm({ ...filterForm, title: onSearchText });
                            }}
                          >
                            <Icon className="text-white" name="search"></Icon>
                          </Button>
                        </ButtonGroup>
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
                                    <div className="dropdown-body dropdown-body-rg">
                                      <Row className="gx-6 gy-3">
                                        <Col size="12">
                                          <div className="form-group">
                                            <label className="overline-title overline-title-alt">Status</label>
                                            <RSelect
                                              options={fullRequirementStatuses}
                                              value={searchForm.status}
                                              onChange={(e) => {
                                                setSearchForm({ ...searchForm, status: e });
                                              }}
                                              placeholder="Any Status"
                                            />
                                          </div>
                                        </Col>
                                        <Col size="12">
                                          <div className="form-group">
                                            <label className="overline-title overline-title-alt">Complexity</label>
                                            <RSelect
                                              options={complexities}
                                              value={searchForm.complexity}
                                              onChange={(e) => {
                                                setSearchForm({ ...searchForm, complexity: e });
                                              }}
                                              placeholder="Any Complexity"
                                            />
                                          </div>
                                        </Col>
                                        {role != "STUDENT" && (
                                          <Col size="12">
                                            <div className="form-group">
                                              <label className="overline-title overline-title-alt">Team</label>
                                              <RSelect
                                                options={teams}
                                                value={searchForm.team}
                                                onChange={(e) => {
                                                  setSearchForm({ ...searchForm, team: e });
                                                }}
                                                placeholder="Any Team"
                                              />
                                            </div>
                                          </Col>
                                        )}
                                        <Col size="12">
                                          <Row>
                                            <Col size="6">
                                              <a
                                                href="#reset"
                                                onClick={(ev) => {
                                                  ev.preventDefault();
                                                  setFilterForm({
                                                    title: "",
                                                    type: "",
                                                    status: null,
                                                    complexity: null,
                                                    user: null,
                                                    team: null,
                                                  });
                                                  setSearchText("");
                                                  setSearchForm({
                                                    type: "",
                                                    status: null,
                                                    complexity: null,
                                                    user: null,
                                                    team: null,
                                                  });
                                                }}
                                                className="clickable"
                                              >
                                                Reset Filter
                                              </a>
                                            </Col>
                                            <Col size="6">
                                              <div className="form-group text-end">
                                                <Button
                                                  color="secondary"
                                                  onClick={() => {
                                                    setFilterForm({
                                                      ...filterForm,
                                                      type: searchForm.type,
                                                      status: searchForm.status,
                                                      team: searchForm.team,
                                                      complexity: searchForm.complexity,
                                                    });
                                                    setCurrentPage(1);
                                                  }}
                                                >
                                                  Filter
                                                </Button>
                                              </div>
                                            </Col>
                                          </Row>
                                        </Col>
                                      </Row>
                                    </div>
                                  </DropdownMenu>
                                </UncontrolledDropdown>
                              </li>
                              <li>
                                <UncontrolledDropdown>
                                  <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
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
                                            setCurrentPage(1);
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
                                            setCurrentPage(1);
                                          }}
                                        >
                                          15
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
              <DataTableBody compact>
                <DataTableHead>
                  <DataTableRow className="nk-tb-col-check">
                    {(role === "STUDENT" || canModifyMilestone(user, role, milestone?.teacherId)) && (
                      <div className="custom-control custom-control-sm custom-checkbox notext">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          onChange={(e) => selectorCheck(e)}
                          id="uid"
                        />
                        <label className="custom-control-label" htmlFor="uid"></label>
                      </div>
                    )}
                  </DataTableRow>
                  <DataTableRow>
                    <span className="sub-text">Title</span>
                  </DataTableRow>
                  <DataTableRow size="sm">
                    <span className="sub-text">Status</span>
                  </DataTableRow>
                  <DataTableRow size="md">
                    <span className="sub-text">Complexity</span>
                  </DataTableRow>
                  <DataTableRow size="lg">
                    <span className="sub-text">Team</span>
                  </DataTableRow>
                  <DataTableRow size="lg">
                    <span className="sub-text">Student</span>
                  </DataTableRow>
                  <DataTableRow className="nk-tb-col-tools text-end">Actions</DataTableRow>
                </DataTableHead>
                {data.length > 0
                  ? data.map((item) => {
                      return (
                        <DataTableItem key={item.id}>
                          <DataTableRow className="nk-tb-col-check">
                            {(canModifyMilestone(user, role, milestone?.teacherId) || canTick(item)) &&
                              item.status !== "EVALUATED" && (
                                <div className="custom-control custom-control-sm custom-checkbox notext">
                                  <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    defaultChecked={item.checked}
                                    id={item.id + "uid1"}
                                    key={Math.random()}
                                    onChange={(e) => onSelectChange(e, item.id)}
                                  />
                                  <label className="custom-control-label" htmlFor={item.id + "uid1"}></label>
                                </div>
                              )}
                          </DataTableRow>
                          <DataTableRow>
                            <span>{item.reqTitle}</span>
                          </DataTableRow>
                          {isFetching?.updateReq === "status" && isFetching?.updateId == item.id ? (
                            <DataTableRow size="sm">
                              <Spinner />
                            </DataTableRow>
                          ) : (
                            <DataTableRow size="sm">
                              {(canChangeAssignee(user, role, item?.studentId) ||
                                canModifyMilestone(user, role, milestone?.teacherId)) &&
                              requirementStatuses.findIndex((r) => r.value === item?.status) != -1 ? (
                                <UncontrolledDropdown>
                                  <DropdownToggle tag="a" className="text-soft dropdown-toggle btn btn-icon ">
                                    <span style={{ cursor: "pointer" }}>
                                      {isNullOrEmpty(item?.status) ? "TO DO" : item.status}
                                    </span>
                                    <Icon name="chevron-down"></Icon>
                                  </DropdownToggle>
                                  <DropdownMenu>
                                    <ul className="link-list-opt no-bdr">
                                      {requirementStatuses.map((status) => (
                                        <li key={`s-${status.value}`}>
                                          <DropdownItem
                                            tag="a"
                                            href="#move"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              updateRequirement(item.id, status.value, null, null);
                                            }}
                                          >
                                            <span>{status.value}</span>
                                          </DropdownItem>
                                        </li>
                                      ))}
                                    </ul>
                                  </DropdownMenu>
                                </UncontrolledDropdown>
                              ) : (
                                <span style={{ cursor: "pointer" }}>
                                  {isNullOrEmpty(item?.status) ? "TO DO" : item.status}
                                </span>
                              )}
                            </DataTableRow>
                          )}
                          <DataTableRow size="md">
                            <span>{item.complexityName}</span>
                          </DataTableRow>
                          <DataTableRow size="lg">
                            <span>{item.teamTeamName}</span>
                          </DataTableRow>
                          {isFetching?.updateReq === "student" && isFetching?.updateId == item.id ? (
                            <DataTableRow size="lg">
                              <Spinner />
                            </DataTableRow>
                          ) : (
                            <DataTableRow size="lg">
                              <UncontrolledDropdown>
                                <DropdownToggle tag="a" className="text-soft dropdown-toggle btn btn-icon ">
                                  <span style={{ cursor: "pointer" }}>
                                    {isNullOrEmpty(item?.studentFullname) ? "No one" : item?.studentFullname}
                                  </span>
                                  {item.status !== "EVALUATED" &&
                                    (canChangeAssignee(user, role, item?.studentId) ||
                                      canModifyMilestone(user, role, milestone?.teacherId)) && (
                                      <Icon name="chevron-down"></Icon>
                                    )}
                                </DropdownToggle>
                                {item.status !== "EVALUATED" &&
                                  (canChangeAssignee(user, role, item?.studentId) ||
                                    canModifyMilestone(user, role, milestone?.teacherId)) && (
                                    <DropdownMenu>
                                      <ul className="link-list-opt no-bdr">
                                        {teamMembers
                                          .filter((team) => team.teamId === item.teamId)
                                          .flatMap((team) => team.members)
                                          ?.map((member) => (
                                            <li key={`s-${member.id}`}>
                                              <DropdownItem
                                                tag="a"
                                                href="#move"
                                                onClick={(ev) => {
                                                  ev.preventDefault();
                                                  updateRequirement(item.id, null, member.id, member.fullname);
                                                }}
                                              >
                                                <span>
                                                  {member.id !== -1 ? `${member.fullname} (${member.email})` : "No one"}
                                                </span>
                                              </DropdownItem>
                                            </li>
                                          ))}
                                      </ul>
                                    </DropdownMenu>
                                  )}
                              </UncontrolledDropdown>
                            </DataTableRow>
                          )}
                          <DataTableRow className="nk-tb-col-tools">
                            {
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
                                        {(canModifyMilestone(user, role, milestone?.teacherId) || canTick(item)) &&
                                          item.status !== "EVALUATED" && (
                                            <li onClick={() => onEditClick(item.id, item.teamId)}>
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
                                        {(canModifyMilestone(user, role, milestone?.teacherId) || canTick(item)) &&
                                          item.status !== "EVALUATED" && (
                                            <li
                                              onClick={() => {
                                                item.checked = true;
                                                deleteRequirements([item.id]);
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
                                          )}
                                        <li
                                          onClick={() => {
                                            // item.checked = true;
                                            // deleteRequirements([item.id]);
                                          }}
                                        >
                                          <DropdownItem
                                            tag="a"
                                            href="#delete"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              setModal({ detail: true });
                                              setDetailId(item.id);
                                            }}
                                          >
                                            <Icon name="info"></Icon>
                                            <span>Detail</span>
                                          </DropdownItem>
                                        </li>
                                      </ul>
                                    </DropdownMenu>
                                  </UncontrolledDropdown>
                                </li>
                              </ul>
                            }
                          </DataTableRow>
                        </DataTableItem>
                      );
                    })
                  : null}
              </DataTableBody>
              <div className="card-inner">
                {data.length > 0 ? (
                  <PaginationComponent
                    itemPerPage={itemPerPage}
                    totalItems={totalItems}
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
          </Block>
          <FormModal
            modal={modal.add}
            modalType="add"
            formData={formData}
            setFormData={setFormData}
            closeModal={closeModal}
            complexities={complexities}
            teams={teams}
            currentTeam={currentTeam}
            role={role}
            milestone={milestone}
            setData={setData}
            setTotalItems={setTotalItems}
          />
          {modal.edit && (
            <FormModal
              modal={modal.edit}
              modalType="edit"
              formData={editFormData}
              setFormData={setEditFormData}
              closeModal={closeEditModal}
              complexities={complexities}
              milestone={milestone}
              editIds={editIds}
              setData={setData}
              data={data}
              role={role}
              currentTeam={currentTeam}
              members={transformToOptionsWithEmail(members)}
            />
          )}
          {modal.import && (
            <ImportRequirementsForm
              modal={modal.import}
              milestone={milestone}
              teams={teams}
              closeModal={closeImportModal}
              formData={importFormData}
              setFormData={setImportFormData}
              data={data}
              setData={setData}
              complexities={complexities}
              setTotalItems={setTotalItems}
              currentTeam={currentTeam}
              role={role}
            />
          )}
          {modal?.detail && (
            <ViewDetailReq
              modal={modal?.detail}
              setModal={setModal}
              requirement={data.find((item) => item.id === detailId)}
            />
          )}
        </Content>
      )}
    </>
  );
};
export default RequirementList;
