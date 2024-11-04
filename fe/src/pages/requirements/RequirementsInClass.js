import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Head from "../../layout/head/Head";
import Content from "../../layout/content/Content";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Col,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
  Icon,
  PaginationComponent,
  Row,
  RSelect,
  TooltipComponent,
} from "../../components/Component";
import authApi from "../../utils/ApiAuth";
import {
  convertToOptions,
  getAllOptions,
  isNullOrEmpty,
  shortenString,
  transformToOptionsWithEmail,
} from "../../utils/Utils";
import { ButtonGroup, DropdownItem, DropdownMenu, DropdownToggle, Spinner, UncontrolledDropdown } from "reactstrap";
import { evaluationTypes, requirementStatuses } from "../../data/ConstantData";
import SubmitWorkModal from "../requirements/SubmitWorkModal";
import useAuthStore from "../../store/Userstore";
import ImportReqToClassModal from "./ImportReqToClassModal";
import MoveReqModal from "./MoveReqModal";
import ViewDetailReq from "./ViewDetailReq";
import { canModifyMilestone } from "../../utils/CheckPermissions";
import ImportRequirementsForm from "./ImportRequirementsForm";
import Swal from "sweetalert2";
import FormModal from "./FormModal";
import { useNavigate } from "react-router-dom";

export default function RequirementsInClass() {
  const [sm, updateSm] = useState(false);
  const [tablesm, updateTableSm] = useState(false);
  const [onSearch, setonSearch] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [modal, setModal] = useState({
    edit: false,
    add: false,
    import: false,
    moveReq: false,
    detail: false,
  });
  const [isFetching, setIsFetching] = useState({
    semester: true,
    subject: true,
    class: true,
    milestone: true,
    team: true,
    requirement: true,
    complexities: true,
  });
  const navigate = useNavigate();
  const { role } = useAuthStore((state) => state);
  const { user } = useAuthStore((state) => state);
  const [filterForm, setFilterForm] = useState({
    title: "",
    semester: null,
    subject: null,
    class: null,
    milestone: null,
    team: null,
  });
  const [searchForm, setSearchForm] = useState({
    type: "",
    semester: null,
    subject: null,
    class: null,
    milestone: null,
    team: null,
  });
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [teams, setTeams] = useState([]);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [formData, setFormData] = useState({
    requirements: [],
    submitType: "file",
    file: null,
    link: null,
    note: "",
  });
  const [selectedItem, setSelectedItem] = useState({
    teamId: -1,
    milestoneId: -1,
  });
  const [id, setId] = useState(0);
  const [teacherClass, setTeacherClass] = useState({});
  const [isFirst, setIsFirst] = useState(true);
  const [complexities, setComplexities] = useState([]);
  const toggle = () => setonSearch(!onSearch);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const [editIds, setEditedIds] = useState([]);
  const [editFormData, setEditFormData] = useState({
    reqTitle: "",
    reqType: "",
    complexity: null,
    status: null,
    note: "",
    student: null,
  });
  const [members, setMembers] = useState([]);
  const [teamMembers, setTeamMembers] = useState({});

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
        const semesterOptions = convertToOptions(response.data.data.settingDTOS, "id", "name");
        setSemesters(semesterOptions);
        if (response.data.data.totalElements > 0) {
          setFilterForm((prev) => ({
            ...prev,
            semester: {
              value: response.data.data.settingDTOS[0]?.id,
              label: response.data.data.settingDTOS[0]?.name,
            },
          }));
        }
      } else {
        toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error search setting!", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetching((prev) => ({ ...prev, semester: false }));
    }
  };

  const fetchSubjects = async () => {
    if (isFetching.semester) return;
    try {
      setIsFetching({ ...isFetching, subject: true });
      const response = await authApi.post("/subjects/search", {
        pageSize: 9999,
        pageIndex: 1,
        active: true,
      });
      console.log("subject:", response.data.data);
      if (response.data.statusCode === 200) {
        const subjectOptions = convertToOptions(response.data.data.subjects, "id", "subjectCode");
        setSubjects(subjectOptions);
        if (response.data.data.totalElements > 0) {
          setFilterForm((prev) => ({
            ...prev,
            subject: {
              value: response.data.data.subjects[0]?.id,
              label: response.data.data.subjects[0]?.subjectCode,
            },
          }));
        }
      } else {
        toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error search subject!", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetching((prev) => ({ ...prev, subject: false }));
    }
  };

  const fetchClasses = async () => {
    if (!filterForm?.semester || !filterForm.subject) {
      setClasses([]);
      setTeacherClass({});
      setFilterForm({ ...filterForm, class: null });
      setIsFetching({ ...isFetching, class: false });
      return;
    }
    try {
      setIsFetching({ ...isFetching, class: true });
      const response = await authApi.post("/class/search", {
        pageSize: 9999,
        pageIndex: 1,
        active: true,
        subjectId: filterForm?.subject?.value,
        settingId: filterForm?.semester?.value,
        isCurrentClass: role === "STUDENT" || role === "TEACHER",
      });
      console.log("class:", response.data.data);
      if (response.data.statusCode === 200) {
        let rClass = response.data.data.classesDTOS;
        const classOptions = convertToOptions(rClass, "id", "classCode");
        setClasses(classOptions);
        if (response.data.data.totalElements > 0) {
          let teacherClasses = {};
          rClass.forEach((item) => {
            teacherClasses = {
              ...teacherClasses,
              [`${item.id}`]: item.teacherId,
            };
          });
          setTeacherClass(teacherClasses);
          setFilterForm((prev) => ({
            ...prev,
            class: {
              value: response.data.data.classesDTOS[0]?.id,
              label: response.data.data.classesDTOS[0]?.classCode,
            },
          }));
        } else {
          setFilterForm((prev) => ({ ...prev, class: null }));
        }
      } else {
        toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error search class!", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetching((prev) => ({ ...prev, class: false }));
    }
  };

  const fetchMilestones = async () => {
    if (!filterForm?.class?.value) {
      setMilestones([]);
      setFilterForm({ ...filterForm, milestone: null });
      setIsFetching((prev) => ({ ...prev, milestone: false }));
      return;
    }
    try {
      setIsFetching((prev) => ({ ...prev, milestone: true }));
      const response = await authApi.post("/milestone/search", {
        pageSize: 9999,
        pageIndex: 1,
        // active: true,
        sortBy: "displayOrder",
        orderBy: "asc",
        classId: filterForm?.class?.value,
      });
      console.log("milestone:", response.data.data);
      if (response.data.statusCode === 200) {
        let rMilestones = response.data.data.milestoneResponses;
        rMilestones = rMilestones.filter((milestone) => milestone.typeEvaluator !== evaluationTypes[2].value);
        let milestoneOptions = convertToOptions(rMilestones, "id", "title");
        // milestoneOptions.unshift(getAllOptions("All Milestones"));
        setMilestones(milestoneOptions);
        if (milestoneOptions.length > 0) {
          const milestone = {
            value: milestoneOptions[0]?.value,
            label: milestoneOptions[0]?.label,
          };
          setFilterForm((prev) => ({
            ...prev,
            milestone: milestone,
          }));
        } else {
          setFilterForm((prev) => ({ ...prev, milestone: null }));
        }
      } else {
        toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error search milestone!", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetching((prev) => ({ ...prev, milestone: false }));
    }
  };

  const fetchTeams = async () => {
    if (!filterForm?.milestone?.value) {
      setFilterForm({ ...filterForm, team: null });
      setTeams([]);
      setTeamMembers({});
      setIsFetching((prev) => ({ ...prev, team: false }));
      return;
    }
    try {
      setIsFetching((prev) => ({ ...prev, team: true }));
      const response = await authApi.post("/teams/search", {
        pageSize: 9999,
        pageIndex: 1,
        milestoneId: filterForm?.milestone?.value,
      });
      console.log("teams:", response.data.data);
      if (response.data.statusCode === 200) {
        let rTeams = response.data.data.teamDTOs;
        let teamOptions = convertToOptions(rTeams, "id", "teamName");
        teamOptions = teamOptions?.filter((team) => team.label !== "Wish List");
        if (teamOptions.length > 0) {
          let team = {
            value: teamOptions[0]?.value,
            label: teamOptions[0]?.label,
          };
          let tMembers = {};
          rTeams.forEach((t) => {
            tMembers = {
              ...tMembers,
              [`${t.id}`]: t.members,
            };
          });
          setTeamMembers(tMembers);
          if (role === "STUDENT") {
            let isFound = false;
            rTeams.forEach((t) => {
              t.members.forEach((tm) => {
                if (tm.id === user.id) {
                  team.value = t.id;
                  team.label = t.teamName;
                  isFound = true;
                  return false;
                }
              });
              if (isFound) {
                return false;
              }
            });
          }
          setFilterForm((prev) => ({
            ...prev,
            team: team,
          }));
        } else {
          setFilterForm((prev) => ({ ...prev, team: null }));
        }
        setTeams(teamOptions);
      } else {
        toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error search teams!", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetching((prev) => ({ ...prev, team: false }));
    }
  };

  const fetchComplexity = async () => {
    if (!filterForm?.subject?.value) {
      setIsFetching({ ...isFetching, complexities: false });
      setComplexities([]);
      return;
    }
    try {
      setIsFetching({ ...isFetching, complexities: true });
      const response = await authApi.post("/setting/search", {
        pageSize: 9999,
        pageIndex: 1,
        type: "Complexity",
        active: true,
        sortBy: "displayOrder",
        orderBy: "ASC",
        isSubjectSetting: true,
        subjectId: filterForm?.subject?.value,
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
      setIsFetching({ ...isFetching, complexities: false });
    }
  };

  const fetchRequirements = async () => {
    if (!filterForm?.class?.value || !filterForm?.milestone?.value || !filterForm?.team?.value) {
      setIsFetching({ ...isFetching, requirement: false });
      setData([]);
      setIsFirst(false);
      setTotalItems(0);
      return;
    }
    try {
      setIsFetching({ ...isFetching, requirement: true });
      const response = await authApi.post("/requirements/get-by-class", {
        pageSize: 99999,
        pageIndex: 1,
        milestoneId: filterForm?.milestone?.value,
        teamId: filterForm?.team?.value,
        title: filterForm?.title,
        classId: filterForm?.class?.value,
      });
      console.log("requirements:", response.data.data);
      if (response.data.statusCode === 200) {
        let requirements = response.data.data.requirementDTOs;
        // requirements = requirements.filter((item) => item.status !== "WAITING FOR APPROVAL");
        setTotalItems(response.data.data.totalElements);
        setData(requirements);
      } else {
        toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error search requirements!", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetching({ ...isFetching, requirement: false });
      setIsFirst(false);
      setSelectedItem({
        teamId: -1,
        milestoneId: -1,
      });
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [isFetching.semester]);

  useEffect(() => {
    if (isFirst && !isFetching?.subject) {
      fetchComplexity();
    }
  }, [isFetching?.subject]);

  useEffect(() => {
    if (isFirst && !isFetching?.complexities) {
      fetchClasses();
    }
  }, [isFetching?.complexities]);

  useEffect(() => {
    if (isFirst && !isFetching?.class) {
      fetchMilestones();
    }
  }, [isFetching?.class]);

  useEffect(() => {
    if (isFirst && !isFetching?.milestone) {
      fetchTeams();
    }
  }, [isFetching?.milestone]);

  useEffect(() => {
    if (isFirst && !isFetching?.team) {
      fetchRequirements();
    }
  }, [isFetching?.team]);

  //load when select change
  useEffect(() => {
    if (!isFirst && !isFetching?.subject) {
      fetchComplexity();
    }
  }, [filterForm?.subject?.value]);

  useEffect(() => {
    if (!isFirst && !isFetching?.subject && !isFetching?.semester) {
      fetchClasses();
    }
  }, [filterForm?.subject?.value, filterForm?.semester?.value]);

  useEffect(() => {
    if (!isFirst && !isFetching?.class) {
      fetchMilestones();
    }
  }, [filterForm?.class?.value]);

  useEffect(() => {
    if (!isFirst && !isFetching?.milestone) {
      fetchTeams();
    }
  }, [filterForm?.milestone?.value]);

  useEffect(() => {
    if (!isFirst && !isFetching?.team && !isFetching?.milestone && !isFetching?.class) {
      fetchRequirements();
    }
  }, [filterForm?.team?.value, filterForm?.milestone?.value]);

  const selectorCheck = (e) => {
    let newData,
      firstItem = {
        milestoneId: -1,
        teamId: -1,
      };
    if (data && data.length > 0) {
      firstItem = {
        milestoneId: data[0]?.milestoneId,
        teamId: data[0]?.teamId,
      };
    }
    newData = data.map((item) => {
      if (
        item.status !== "EVALUATED" &&
        item?.teamId === firstItem?.teamId &&
        item?.milestoneId === firstItem?.milestoneId &&
        (role !== "STUDENT" || isNullOrEmpty(item?.studentId) || item?.studentId === user?.id)
      ) {
        item.checked = e.currentTarget.checked;
      }
      return item;
    });
    setData([...newData]);
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

  // const onActionClick = (e, type) => {
  //   let checkedReqs = data.filter((item) => item.checked === true);
  //   if (checkedReqs.length === 0) {
  //     toast.info("Please select at least one item", {
  //       position: toast.POSITION.TOP_CENTER,
  //     });
  //     return false;
  //   }
  //   setModal({ submit: true });
  //   setFormData({
  //     requirements: checkedReqs,
  //     submitType: type,
  //   });
  // };

  const onSelectChange = (e, id) => {
    let newData = data;
    let index = newData.findIndex((item) => item.id === id);
    newData[index].checked = e.currentTarget.checked;
    if (e.currentTarget.checked) {
      setSelectedItem({
        teamId: newData[index].teamId,
        milestoneId: newData[index].milestoneId,
      });
    } else if (newData.filter((item) => item.checked).length === 0) {
      setSelectedItem({
        teamId: -1,
        milestoneId: -1,
      });
    }
    setData([...newData]);
  };

  const canTick = (item) => {
    return (
      item.status !== "EVALUATED" &&
      (role !== "STUDENT" || isNullOrEmpty(item.studentId) || item.studentId === user.id) &&
      ((selectedItem.teamId === -1 && selectedItem.milestoneId === -1) ||
        (selectedItem.teamId === item.teamId && selectedItem.milestoneId === item.milestoneId))
    );
  };

  const [importFormData, setImportFormData] = useState({
    teams: null,
    data: null,
  });

  const onEditClick = (id, teamId) => {
    setModal({ edit: true });
    setEditedIds([id]);
    setMembers(teamMembers[`${filterForm?.team?.value}`] || []);
  };

  const closeImportModal = () => {
    setModal({ import: false });
    setImportFormData({
      teams: null,
      data: null,
    });
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
        setMembers(teamMembers[`${filterForm?.team?.value}`] || []);
      } else setMembers([]);

      setModal({ edit: true });
    } else if (action === "delete") {
      deleteRequirements(ids);
    }
  };

  return (
    <>
      <Head title="Requirement List" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page> Requirement List</BlockTitle>
            </BlockHeadContent>
            <BlockHeadContent></BlockHeadContent>
          </BlockBetween>
        </BlockHead>
        <Block>
          <Row>
            <Col md={2}>
              <div className="form-group">
                <label className="overline-title overline-title-alt">Semester</label>
                {isFetching?.semester ? (
                  <div>
                    <Spinner />
                  </div>
                ) : (
                  <RSelect
                    options={semesters}
                    value={filterForm.semester}
                    onChange={(e) => {
                      setFilterForm({ ...filterForm, semester: e });
                    }}
                    placeholder="Any Semester"
                  />
                )}
              </div>
            </Col>
            <Col md={2}>
              <div className="form-group">
                <label className="overline-title overline-title-alt">Subject</label>
                {isFetching?.subject ? (
                  <div>
                    <Spinner />
                  </div>
                ) : (
                  <RSelect
                    options={subjects}
                    value={filterForm.subject}
                    onChange={(e) => {
                      setFilterForm({ ...filterForm, subject: e });
                    }}
                    placeholder="Any subject"
                  />
                )}
              </div>
            </Col>
            <Col md={3}>
              <div className="form-group">
                <label className="overline-title overline-title-alt">Class</label>
                {isFetching?.class ? (
                  <div>
                    <Spinner />
                  </div>
                ) : (
                  <RSelect
                    options={classes}
                    value={filterForm.class}
                    onChange={(e) => {
                      setFilterForm({ ...filterForm, class: e });
                    }}
                    placeholder="Any class"
                  />
                )}
              </div>
            </Col>
            <Col md={3}>
              <div className="form-group">
                <label className="overline-title overline-title-alt">Milestone</label>
                {isFetching?.milestone ? (
                  <div>
                    <Spinner />
                  </div>
                ) : (
                  <RSelect
                    options={milestones}
                    value={filterForm.milestone}
                    onChange={(e) => {
                      setFilterForm({ ...filterForm, milestone: e });
                    }}
                    placeholder="Any milestone"
                  />
                )}
              </div>
            </Col>
            <Col md={2}>
              {role !== "STUDENT" && (
                <div className="form-group">
                  <label className="overline-title overline-title-alt">Team</label>
                  {isFetching?.team ? (
                    <div>
                      <Spinner />
                    </div>
                  ) : (
                    <RSelect
                      options={teams}
                      value={filterForm.team}
                      onChange={(e) => {
                        setFilterForm({ ...filterForm, team: e });
                      }}
                      placeholder="Any Team"
                    />
                  )}
                </div>
              )}
            </Col>
          </Row>
        </Block>
        <Block>
          {isFetching?.requirement ? (
            <div className="d-flex justify-content-center">
              <Spinner style={{ width: "3rem", height: "3rem" }} />
            </div>
          ) : (
            <DataTable className="card-stretch">
              <div className="card-inner position-relative card-tools-toggle">
                <div className="card-title-group">
                  <div className="card-tools w-40">
                    <ButtonGroup className="w-100">
                      <input
                        type="text"
                        placeholder="search by title..."
                        className="form-control w-100"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                      <Button
                        className="bg-gray"
                        onClick={() => {
                          setFilterForm({ ...filterForm, title: searchText });
                        }}
                      >
                        <Icon className="text-white" name="search"></Icon>
                      </Button>
                    </ButtonGroup>
                  </div>
                  <div className="btn-wrap">
                    <span className="d-none d-md-block"></span>
                  </div>
                  {(role === "STUDENT" ||
                    canModifyMilestone(
                      user,
                      role,
                      filterForm?.class?.value ? teacherClass[`${filterForm?.class?.value}`] : -1
                    )) && (
                    <div className="text-end">
                      <Button
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
                        color="light"
                        outline
                        className="btn-dim me-3"
                        onClick={(e) => {
                          onActionClick(e, "delete");
                        }}
                      >
                        Bulk Delete
                      </Button>
                      <Button
                        color="primary"
                        className="me-2"
                        onClick={() => {
                          let checkedItems = data.filter((item) => item.checked);
                          if (checkedItems.length > 0) {
                            setModal({ ...modal, moveReq: true });
                          } else {
                            toast.info("Please select at least one requirement!", {
                              position: toast.POSITION.TOP_CENTER,
                            });
                          }
                        }}
                      >
                        Assign
                      </Button>
                      <Button color="primary" onClick={() => setModal({ ...modal, import: true })}>
                        Import
                      </Button>
                      <Button color="primary" className="btn-icon ms-3" onClick={() => setModal({ add: true })}>
                        <Icon name="plus"></Icon>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <DataTableBody compact>
                <DataTableHead>
                  <DataTableRow className="nk-tb-col-check">
                    <div className="custom-control custom-control-sm custom-checkbox notext">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        onChange={(e) => selectorCheck(e)}
                        id="uid"
                      />
                      <label className="custom-control-label" htmlFor="uid"></label>
                    </div>
                  </DataTableRow>
                  <DataTableRow>
                    <span className="sub-text">Title</span>
                  </DataTableRow>
                  <DataTableRow>
                    <span className="sub-text">Complexity</span>
                  </DataTableRow>
                  <DataTableRow>
                    <span className="sub-text">Milestone</span>
                  </DataTableRow>
                  <DataTableRow>
                    <span className="sub-text">Team</span>
                  </DataTableRow>
                  <DataTableRow>
                    <span className="sub-text">Student</span>
                  </DataTableRow>
                  <DataTableRow>
                    <span className="sub-text">Status</span>
                  </DataTableRow>
                  <DataTableRow className="nk-tb-col-tools text-end">
                    <span className="sub-text">Actions</span>
                  </DataTableRow>
                </DataTableHead>
                {data.length > 0
                  ? data.map((item) => {
                      return (
                        <DataTableItem key={item.id}>
                          <DataTableRow className="nk-tb-col-check">
                            {canTick(item) && (
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

                          <DataTableRow>
                            <span style={{ cursor: "pointer" }}>{item.complexityName}</span>
                          </DataTableRow>
                          <DataTableRow>{item.milestoneTitle}</DataTableRow>
                          <DataTableRow>
                            <span>{item.teamTeamName}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span style={{ cursor: "pointer" }}>
                              {isNullOrEmpty(item?.studentFullname) ? "No one" : item?.studentFullname}
                            </span>
                          </DataTableRow>
                          <DataTableRow>
                            <span style={{ cursor: "pointer" }}>
                              {isNullOrEmpty(item?.status) ? "TO DO" : item.status}
                            </span>
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
                                      {(canTick(item) ||
                                        canModifyMilestone(user, role, teacherClass[`${filterForm?.class?.value}`])) &&
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
                                      {(canTick(item) ||
                                        canModifyMilestone(user, role, teacherClass[`${filterForm?.class?.value}`])) &&
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
                                            // setModal({ detail: true });
                                            // setId(item.id);
                                            navigate(`/requirement-details?reqId=${item.id}`);
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
                            {/* <Button
                            color="info"
                            onClick={() => {
                              setModal({ detail: true });
                              setId(item.id);
                            }}
                          >
                            Detail
                          </Button> */}
                          </DataTableRow>
                        </DataTableItem>
                      );
                    })
                  : null}
              </DataTableBody>
              <div className="card-inner">
                {data.length > 0 ? (
                  <></>
                ) : (
                  <div className="text-center">
                    <span className="text-silent">No data found</span>
                  </div>
                )}
              </div>
            </DataTable>
          )}
        </Block>
        {/* <ImportReqToClassModal
          modal={modal?.import}
          setModal={setModal}
          data={data}
          setData={setData}
          milestones={milestones.filter((item) => item.value !== null)}
          //   teamOptions={teams.filter(item => item.value !== null)}
        /> */}
        {modal?.add && <FormModal
          modal={modal.add}
          modalType="add"
          formData={formData}
          setFormData={setFormData}
          closeModal={closeModal}
          complexities={complexities}
          teams={teams}
          role={role}
          milestone={{
            id: filterForm?.milestone?.value,
          }}
          setData={setData}
          setTotalItems={setTotalItems}
          currentTeam={filterForm?.team}
        />}
        {modal?.import && (
          <ImportRequirementsForm
            modal={modal.import}
            milestone={{
              id: filterForm?.milestone?.value,
            }}
            teams={teams}
            closeModal={closeImportModal}
            formData={importFormData}
            setFormData={setImportFormData}
            data={data}
            setData={setData}
            complexities={complexities}
            setTotalItems={setTotalItems}
            currentTeam={filterForm?.team}
            role={role}
          />
        )}
        {modal?.moveReq && (
          <MoveReqModal
            modal={modal?.moveReq}
            setModal={setModal}
            data={data}
            setData={setData}
            milestones={milestones.filter((item) => item.value !== null)}
            teamOptions={teams.filter((item) => item.value !== selectedItem?.teamId)}
            setSelectedItem={setSelectedItem}
            initFormData={{
              milestone: milestones.find((item) => item.value === selectedItem?.milestoneId),
              teams: teams.find((item) => item.value === selectedItem?.teamId),
            }}
            role={role}
            user={user}
          />
        )}
        {modal?.edit && (
          <FormModal
            modal={modal.edit}
            modalType="edit"
            formData={editFormData}
            setFormData={setEditFormData}
            closeModal={closeEditModal}
            complexities={complexities}
            milestone={{
              id: filterForm?.milestone?.value,
            }}
            editIds={editIds}
            setData={setData}
            data={data}
            teams={teams}
            role={role}
            currentTeam={filterForm?.team}
            members={transformToOptionsWithEmail(members)}
          />
        )}
        {modal?.detail && (
          <ViewDetailReq modal={modal?.detail} setModal={setModal} requirement={data.find((item) => item.id == id)} />
        )}
        <ToastContainer />
      </Content>
    </>
  );
}

const getFileNameFromURL = (url) => {
  return url.split("/").pop().split("?")[0];
};

const renderSubmission = (item, isUpdate) => {
  let note = isNullOrEmpty(item.note) ? "" : " - " + item.note;
  if (item.submitType === "file") {
    const fileName = getFileNameFromURL(item.submission);
    return (
      <>
        <a href={item.submission} download={item.submission}>
          Download {shortenString(fileName, 150)}
        </a>
        {isUpdate && <span>{note}</span>}
      </>
    );
  } else if (item.submitType === "link") {
    return (
      <>
        <a href={item.submission} target="_blank" rel="noopener noreferrer">
          {shortenString(item.submission, 150)}
        </a>
        {isUpdate && <span>{note}</span>}
      </>
    );
  } else {
    return <span>No submission</span>;
  }
};
