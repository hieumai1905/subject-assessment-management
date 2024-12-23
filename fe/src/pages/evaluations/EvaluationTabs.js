import React, { useEffect, useState } from "react";
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
  Icon,
  Row,
  RSelect,
} from "../../components/Component";
import { DropdownMenu, DropdownToggle, Nav, NavItem, NavLink, Spinner, TabContent, TabPane, UncontrolledDropdown } from "reactstrap";
import classnames from "classnames";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StudentEvaluations from "./StudentEvaluations";
import authApi from "../../utils/ApiAuth";
import { convertToOptions, getAllOptions, isNullOrEmpty } from "../../utils/Utils";
import RequirementEvaluations from "./RequirementEvaluations";
import EvaluationsByMilestones from "./EvaluationsByMilestones";
import useAuthStore from "../../store/Userstore";
import { canModify } from "../../utils/CheckPermissions";
import { ViewStudentEval } from "./ViewStudentEval";
import { evaluationTypes } from "../../data/ConstantData";
import Swal from "sweetalert2";

export default function EvaluationTabs() {
  const [sm, updateSm] = useState(false);
  const [activeTab, setActiveTab] = useState("3");
  const [isFirst, setIsFirst] = useState(true);
  const [needLoad, setNeedLoad] = useState(false);
  const [haveChanged, setHaveChanged] = useState(false);
  const { role } = useAuthStore((state) => state);
  const { user } = useAuthStore((state) => state);
  const [isFetching, setIsFetching] = useState({
    semester: true,
    subject: true,
    class: true,
    milestone: true,
    team: true,
    reqEval: false,
    studentEval: false,
    allMileEval: true,
  });

  const toggle = (tab) => {
    if (activeTab !== tab && checkCanSwitchTab(tab)) {
      if (activeTab !== "3") {
        if (haveChanged && role === "TEACHER") {
          Swal.fire({
            title: "Thông báo",
            text: `Bạn nên lưu thay đổi trước khi chuyển tab`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Chuyển tab",
            cancelButtonText: "Ở lại",
          }).then(async (result) => {
            if (result.isConfirmed) {
              setActiveTab(tab);
              setHaveChanged(false);
            }
          });
        } else {
          setActiveTab(tab);
        }
      } else {
        setActiveTab(tab);
      }
    }
  };

  const checkCanSwitchTab = (tab) => {
    if(isFetching?.semester || isFetching?.subject || isFetching?.class 
      || isFetching?.milestone || isFetching?.team){
        return false;
    }
    
    if(tab === "3" && isFetching?.allMileEval){
      return false;
    }
    if(tab === "2" && isFetching?.studentEval){
      return false;
    }
    if(tab === "1" && isFetching?.reqEval){
      return false;
    }
    return true;
  }

  const [filterForm, setFilterForm] = useState({
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
  const [evaluations, setEvaluations] = useState([]);
  const [workEvaluation, setWorkEvaluation] = useState([]);
  const [milestoneEvaluations, setMilestoneEvaluations] = useState([]);
  const [complexity, setComplexity] = useState([]);
  const [quality, setQuality] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [typeEvaluator, setTypeEvaluator] = useState([]);
  const [mileActive, setMileActive] = useState(-1);

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
          setSemesters(convertToOptions(response.data.data.settingDTOS, "id", "name"));
          if (response.data.data.totalElements > 0) {
            setFilterForm({
              ...filterForm,
              semester: {
                value: response.data.data.settingDTOS[0]?.id,
                label: response.data.data.settingDTOS[0]?.name,
              },
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
      if (isFetching.semester) {
        return false;
      }
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

  const fetchClasses = async () => {
    if (!filterForm?.subject?.value || !filterForm?.semester?.value) {
      setClasses([]);
      setEvaluators([]);
      setFilterForm({ ...filterForm, class: null });
      setIsFetching({ ...isFetching, class: false });
      return false;
    }
    try {
      let isCurrentClass = true;
      if (role === "MANAGER" || role === "ADMIN") isCurrentClass = false;
      setIsFetching({
        ...isFetching,
        class: true,
      });
      const response = await authApi.post("/class/search", {
        pageSize: 9999,
        pageIndex: 1,
        active: true,
        subjectId: filterForm?.subject?.value,
        settingId: filterForm?.semester?.value,
        name: "",
        classCode: "",
        isCurrentClass: isCurrentClass,
      });
      console.log("class:", response.data.data);
      if (response.data.statusCode === 200) {
        let classList = response.data.data.classesDTOS;
        setClasses(convertToOptions(classList, "id", "classCode"));
        if (response.data.data.totalElements > 0) {
          setFilterForm({
            ...filterForm,
            class: {
              value: classList[0]?.id,
              label: classList[0]?.classCode,
            },
          });
          setEvaluators(classList);
        } else {
          setFilterForm({
            ...filterForm,
            class: null,
          });
        }
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi tìm kiếm lớp học", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({
        ...isFetching,
        class: false,
      });
    }
  };
  const fetchMilestones = async () => {
    if (!filterForm?.class?.value) {
      setMileActive(null);
      setMilestones([]);
      setTypeEvaluator([]);
      setFilterForm({ ...filterForm, milestone: null });
      setIsFetching({ ...isFetching, milestone: false });
      return false;
    }
    try {
      setIsFetching({ ...isFetching, milestone: true });
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
        let milestones = response.data.data.milestoneResponses;
        milestones = milestones.filter((milestone) => milestone.evaluationType !== evaluationTypes[2].value);
        let typeEvaluators = milestones.map((item) => ({
          id: item.id,
          typeEvaluator: item.evaluationType,
        }));
        let mileActiveId = -1;
        milestones.forEach((milestone) => {
          if (milestone.active) {
            mileActiveId = milestone.id;
            return;
          }
        });
        setMileActive(mileActiveId);
        setTypeEvaluator(typeEvaluators);
        let milestoneOptions = convertToOptions(milestones, "id", "title");
        setMilestones(milestoneOptions);
        if (milestoneOptions.length > 0) {
          setFilterForm({ ...filterForm, milestone: milestoneOptions[0] });
        } else {
          setFilterForm({ ...filterForm, milestone: null });
        }
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi tìm kiếm giai đoạn", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, milestone: false });
    }
  };
  const fetchTeams = async () => {
    if (!filterForm?.milestone?.value) {
      setTeams([]);
      setFilterForm({ ...filterForm, team: true });
      setIsFetching((prev) => ({ ...prev, team: false }));
      return;
    }
    try {
      setIsFetching((prev) => ({ ...prev, team: true }));
      const response = await authApi.post("/teams/search", {
        pageSize: 9999,
        pageIndex: 1,
        classId: filterForm?.class?.value,
      });
      console.log("teams:", response.data.data);
      if (response.data.statusCode === 200) {
        let teamOptions = convertToOptions(response.data.data.teamDTOs, "id", "teamName");
        teamOptions = teamOptions?.filter((team) => team.label !== "Wish List");
        setTeams(teamOptions);
        if (teamOptions.length > 0) {
          setFilterForm({
            ...filterForm,
            team: {
              value: teamOptions[0].value,
              label: teamOptions[0].label,
            },
          });
        } else {
          setFilterForm({ ...filterForm, team: null });
        }
      } else {
        toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
        // setTeams([]);
        // setFilterForm({...filterForm, team: null});
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi tìm kiếm nhóm", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetching((prev) => ({ ...prev, team: false }));
    }
  };
  const fetchEvaluations = async () => {
    if (!filterForm?.class?.value || !filterForm?.milestone?.value || !filterForm?.team?.value) {
      setEvaluations([]);
      setIsFetching({ ...isFetching, studentEval: false });
      setIsFirst(false);
      return;
    }
    try {
      setIsFetching({ ...isFetching, studentEval: true });
      const response = await authApi.post("/evaluation/search-student-evaluation", {
        classId: filterForm?.class?.value,
        milestoneId: filterForm?.milestone?.value,
        teamId: filterForm?.team?.value,
      });
      console.log("evaluations:", response.data.data);
      if (response.data.statusCode === 200) {
        setEvaluations(response.data.data);
      } else {
        toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi tìm kiếm đánh giá", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetching({ ...isFetching, studentEval: false });
      setIsFirst(false);
    }
  };
  const fetchWorkEvaluations = async () => {
    if (!filterForm?.class?.value || !filterForm?.milestone?.value || !filterForm?.team?.value) {
      setWorkEvaluation([]);
      setComplexity([]);
      setQuality([]);
      setIsFetching({ ...isFetching, reqEval: false });
      setIsFirst(false);
      return;
    }
    try {
      setIsFetching({ ...isFetching, reqEval: true });
      const response = await authApi.post("/evaluation/search-requirement-evaluation", {
        classId: filterForm?.class?.value,
        milestoneId: filterForm?.milestone?.value,
        teamId: filterForm?.team?.value,
      });
      console.log("work evaluations:", response.data.data);
      if (response.data.statusCode === 200) {
        setWorkEvaluation(response.data.data?.workEvaluationResponses);
        setComplexity(response.data.data?.complexities);
        setQuality(response.data.data?.qualities);
      } else {
        toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi tìm kiếm đánh giá yêu cầu", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetching({ ...isFetching, reqEval: false });
      setIsFirst(false);
    }
  };
  const fetchMilestonesEvaluations = async () => {
    if (!filterForm?.class?.value) {
      setMilestoneEvaluations([]);
      setIsFirst(false);
      setIsFetching({ ...isFetching, allMileEval: false });
      return;
    }
    try {
      setIsFetching({ ...isFetching, allMileEval: true });
      const response = await authApi.get(`/evaluation/search-student-evaluation-by-class/${filterForm?.class?.value}`);
      console.log("milestone evaluations:", response.data.data);
      if (response.data.statusCode === 200) {
        let requirements = response.data.data;
        setMilestoneEvaluations(requirements);
      } else {
        toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi tìm kiếm đánh giá theo giai đoạn", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetching({ ...isFetching, allMileEval: false });
      setIsFirst(false);
    }
  };

  // first load
  useEffect(() => {
    if (isFirst && !isFetching?.subject) {
      fetchClasses();
    }
  }, [isFetching?.subject]);
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
      fetchMilestonesEvaluations();
    }
  }, [isFetching?.team]);
  //----------------------------------------------------------------

  //load when select change
  useEffect(() => {
    if (!isFirst && !isFetching?.semester && !isFetching?.subject) {
      fetchClasses();
    }
  }, [filterForm?.semester?.value, filterForm?.subject?.value]);

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
    if (!isFirst && !isFetching?.team && !isFetching?.milestone && activeTab === "2") {
      fetchEvaluations();
    }
  }, [filterForm?.team?.value, activeTab, isFetching?.team]);

  useEffect(() => {
    if (!isFirst && !isFetching?.team && !isFetching?.milestone && activeTab === "1") {
      fetchWorkEvaluations();
    }
  }, [filterForm?.team?.value, activeTab, isFetching?.team]);
  useEffect(() => {
    if (!isFirst && !isFetching?.class && activeTab === "3") {
      fetchMilestonesEvaluations();
    }
  }, [filterForm?.class?.value, activeTab]);

  return (
    <>
      <Head title="Đánh giá"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>Đánh giá quá trình</BlockTitle>
              <BlockDes></BlockDes>
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
                            <span className="sub-title dropdown-title">Lọc đánh giá</span>
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
                              <Col md={6}>
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Học kỳ</label>
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
                                      placeholder="Chọn học kỳ"
                                    />
                                  )}
                                </div>
                              </Col>
                              <Col md={6}>
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Môn học</label>
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
                                      placeholder="Chọn môn học"
                                    />
                                  )}
                                </div>
                              </Col>
                              <Col md={6}>
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Lớp</label>
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
                                      placeholder="Chọn lớp"
                                    />
                                  )}
                                </div>
                              </Col>
                              <Col md={6}>
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Giai đoạn</label>
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
                                      placeholder="Chọn giai đoạn"
                                    />
                                  )}
                                </div>
                              </Col>
                              <Col md={6}>
                                {role !== "STUDENT" && (
                                  <div className="form-group">
                                    <label className="overline-title overline-title-alt">Nhóm</label>
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
                                        placeholder="Chọn nhóm"
                                      />
                                    )}
                                  </div>
                                )}
                              </Col>
                            </Row>
                          </div>
                          
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </li>
                  </ul>
                </div>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>
        {/* <Row>
          <Col size="2">
            <div className="form-group">
              <label className="form-label">Semester</label>
              {isFetching?.semester ? (
                <div>
                  <Spinner />
                </div>
              ) : (
                <RSelect
                  options={semesters}
                  value={filterForm.semester}
                  onChange={(e) => setFilterForm({ ...filterForm, semester: e })}
                />
              )}
            </div>
          </Col>
          <Col size="2">
            <div className="form-group">
              <label className="form-label">Subject</label>
              {isFetching?.subject ? (
                <div>
                  <Spinner />
                </div>
              ) : (
                <RSelect
                  options={subjects}
                  value={filterForm.subject}
                  onChange={(e) =>
                    setFilterForm({
                      ...filterForm,
                      subject: e,
                    })
                  }
                />
              )}
            </div>
          </Col>
          <Col size="3">
            <div className="form-group">
              <label className="form-label">Class</label>
              {isFetching?.class ? (
                <div>
                  <Spinner />
                </div>
              ) : (
                <RSelect
                  options={classes}
                  value={filterForm.class}
                  onChange={(e) => setFilterForm({ ...filterForm, class: e })}
                />
              )}
            </div>
          </Col>
          {role !== "STUDENT" && (
            <>
              <Col size="3">
                <div className="form-group">
                  <label className="form-label">Milestone</label>
                  {isFetching?.milestone ? (
                    <div>
                      <Spinner />
                    </div>
                  ) : (
                    <RSelect
                      options={milestones}
                      value={filterForm.milestone}
                      onChange={(e) => setFilterForm({ ...filterForm, milestone: e })}
                    />
                  )}
                </div>
              </Col>
              <Col size="2">
                <div className="form-group">
                  <label className="form-label">Team</label>
                  {isFetching?.team ? (
                    <div>
                      <Spinner />
                    </div>
                  ) : (
                    <RSelect
                      options={teams}
                      value={filterForm.team}
                      onChange={(e) => setFilterForm({ ...filterForm, team: e })}
                    />
                  )}
                </div>
              </Col>
            </>
          )}
        </Row> */}
        {role !== "STUDENT" && (
          <>
            <Nav tabs>
              <NavItem>
                <NavLink
                  tag="a"
                  href="#tab"
                  className={classnames({ active: activeTab === "3" })}
                  onClick={(ev) => {
                    ev.preventDefault();
                    toggle("3");
                  }}
                >
                  Theo lớp học
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  tag="a"
                  href="#tab"
                  className={classnames({ active: activeTab === "2" })}
                  onClick={(ev) => {
                    ev.preventDefault();
                    toggle("2");
                  }}
                >
                  Theo giai đoạn
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  tag="a"
                  href="#tab"
                  className={classnames({ active: activeTab === "1" })}
                  onClick={(ev) => {
                    ev.preventDefault();
                    toggle("1");
                  }}
                >
                  Theo yêu cầu
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
                {activeTab === "1" ? (
                  <RequirementEvaluations
                    evaluations={workEvaluation}
                    setEvaluations={setWorkEvaluation}
                    milestone={filterForm?.milestone}
                    filterForm={filterForm}
                    teams={teams}
                    complexities={complexity}
                    qualities={quality}
                    role={role}
                    user={user}
                    loadings={isFetching?.reqEval}
                    classes={evaluators.find((item) => item.id === filterForm?.class?.value)}
                    setHaveChanged={setHaveChanged}
                    mileActive={mileActive}
                    typeEvaluator={
                      typeEvaluator.find((item) => item.id === filterForm?.milestone?.value)?.typeEvaluator
                    }
                  />
                ) : (
                  <></>
                )}
              </TabPane>
              <TabPane tabId="2">
                {activeTab === "2" ? (
                  <StudentEvaluations
                    evaluations={evaluations}
                    setEvaluations={setEvaluations}
                    milestone={filterForm?.milestone}
                    filterForm={filterForm}
                    teams={teams}
                    role={role}
                    user={user}
                    mileActive={mileActive}
                    loadings={isFetching?.studentEval}
                    classes={evaluators.find((item) => item.id === filterForm?.class?.value)}
                    setHaveChanged={setHaveChanged}
                    typeEvaluator={
                      typeEvaluator.find((item) => item.id === filterForm?.milestone?.value)?.typeEvaluator
                    }
                  />
                ) : (
                  <></>
                )}
              </TabPane>
              <TabPane tabId="3">
                {activeTab === "3" ? (
                  <EvaluationsByMilestones
                    evaluations={milestoneEvaluations}
                    setEvaluations={setMilestoneEvaluations}
                    role={role}
                    loadings={isFetching?.allMileEval}
                  />
                ) : (
                  <></>
                )}
              </TabPane>
            </TabContent>
          </>
        )}
        {role === "STUDENT" && (
          <Block>
            <ViewStudentEval
              data={milestoneEvaluations}
              classId={filterForm?.class?.value}
              loadings={isFetching?.allMileEval}
            />
          </Block>
        )}
      </Content>
      <ToastContainer />
    </>
  );
}
