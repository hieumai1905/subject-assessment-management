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
import { Nav, NavItem, NavLink, Spinner, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StudentEvaluations from "./StudentEvaluations";
import authApi from "../../utils/ApiAuth";
import { convertToOptions, getAllOptions, isNullOrEmpty } from "../../utils/Utils";
import RequirementEvaluations from "./RequirementEvaluations";
import useAuthStore from "../../store/Userstore";
import { canModify } from "../../utils/CheckPermissions";
import { ViewStudentEval } from "./ViewStudentEval";
import { evaluationTypes } from "../../data/ConstantData";
import GFStudentEvaluations from "./StudentEvaluations";
import Swal from "sweetalert2";

export default function GFEvaluationTabs() {
  const [activeTab, setActiveTab] = useState("2");
  const [isFirst, setIsFirst] = useState(true);
  const navigate = useNavigate();
  const [haveChanged, setHaveChanged] = useState(false);
  const { role } = useAuthStore((state) => state);
  const { user } = useAuthStore((state) => state);

  const toggle = (tab) => {
    if (activeTab !== tab) {
      if (haveChanged && role === 'TEACHER') {
        Swal.fire({
          title: "Message",
          text: `You should save the changes before navigating to another tab.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Switch tabs",
          cancelButtonText: "Stay here",
        }).then(async (result) => {
          if (result.isConfirmed) {
            setActiveTab(tab);
            setHaveChanged(false);
          }
        });
      } else {
        setActiveTab(tab);
      }
    }
  };

  const [isFetching, setIsFetching] = useState({
    semester: true,
    subject: true,
    class: true,
    milestone: true,
    team: true,
    reqEval: false,
    studentEval: false,
    allMileEval: true,
    session: true,
    round: true,
  });
  const [filterForm, setFilterForm] = useState({
    semester: null,
    subject: null,
    class: null,
    milestone: null,
    team: null,
    session: null,
    round: null,
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
  const [sessions, setSessions] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [canEdit, setCanEdit] = useState(false);

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
        toast.error("Error search setting!", {
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
        toast.error("Error search subject!", {
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
        setRounds([]);
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
      toast.error("Error search round!", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, round: false });
    }
  };

  const fetchSessions = async () => {
    try {
      if (!filterForm?.semester?.value || !filterForm?.round?.value) {
        setIsFetching({ ...isFetching, session: false });
        setSessions([]);
        return false;
      }
      setIsFetching({ ...isFetching, session: true });
      const response = await authApi.post("/sessions/search", {
        pageSize: 9999,
        pageIndex: 1,
        semesterId: filterForm?.semester?.value,
        settingId: filterForm?.round?.value,
      });
      console.log("session:", response.data.data);
      if (response.data.statusCode === 200) {
        let rSessions = convertToOptions(response.data.data.sessionDTOs, "id", "name");
        setSessions(rSessions);
        if (rSessions.length > 0) {
          setFilterForm({
            ...filterForm,
            session: rSessions[0],
          });
        } else {
          setFilterForm({
            ...filterForm,
            session: null,
          });
        }
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error search sessions!", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, session: false });
    }
  };
  const fetchClasses = async () => {
    if (!filterForm?.round?.value || !filterForm?.semester?.value) {
      setClasses([]);
      setFilterForm({ ...filterForm, class: null });
      setIsFetching({ ...isFetching, class: false });
      return false;
    }
    try {
      setIsFetching({ ...isFetching, class: true });
      const response = await authApi.post("/class/search-for-grand-final", {
        semesterId: filterForm?.semester?.value,
        roundId: filterForm?.round?.value,
        sessionId: filterForm?.session?.value,
      });
      console.log("class:", response.data.data);
      if (response.data.statusCode === 200) {
        let classList = response.data.data.classList;
        setClasses(convertToOptions(classList, "id", "name"));
        if (classList.length > 0) {
          setFilterForm({
            ...filterForm,
            class: {
              value: classList[0]?.id,
              label: classList[0]?.name,
            },
          });
          setEvaluators(classList);
        } else {
          console.log("chiu");

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
      toast.error("Error search class!", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, class: false });
    }
  };

  const fetchTeams = async () => {
    if (!filterForm?.class?.value || !filterForm?.session?.value) {
      setTeams([]);
      setCanEdit(false);
      setFilterForm({ ...filterForm, team: null });
      setIsFetching((prev) => ({ ...prev, team: false }));
      return;
    }
    try {
      setIsFetching((prev) => ({ ...prev, team: true }));
      const response = await authApi.post("/teams/search-for-grand-final", {
        classId: filterForm?.class?.value,
        sessionId: filterForm?.session?.value,
      });
      console.log("teams:", response.data.data);
      if (response.data.statusCode === 200) {
        let teamOptions = convertToOptions(response.data.data.classList, "id", "name");
        setCanEdit(response.data.data.canEvaluate);
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
          setCanEdit(false);
          setFilterForm({ ...filterForm, team: null });
        }
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

  const fetchEvaluations = async () => {
    if (!filterForm?.team?.value || !filterForm.session?.value) {
      setEvaluations([]);
      setIsFetching({ ...isFetching, studentEval: false });
      setIsFirst(false);
      return;
    }
    try {
      setIsFetching({ ...isFetching, studentEval: true });
      const response = await authApi.post("/evaluation/search-student-eval-for-grand-final", {
        sessionId: filterForm?.session?.value,
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
      toast.error("Error search evaluations!", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFirst(false);
      setIsFetching({ ...isFetching, studentEval: false });
    }
  };

  const fetchWorkEvaluations = async () => {
    if (!filterForm?.team?.value || !filterForm?.session?.value) {
      setWorkEvaluation([]);
      setIsFirst(false);
      setIsFetching({ ...isFetching, reqEval: false });
      return;
    }
    try {
      setIsFetching({ ...isFetching, reqEval: true });
      const response = await authApi.post("/evaluation/search-requirement-eval-for-grand-final", {
        teamId: filterForm?.team?.value,
        sessionId: filterForm?.session?.value,
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
      toast.error("Error search work evaluations!", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetching({ ...isFetching, reqEval: false });
      setIsFirst(false);
    }
  };
  //load first
  useEffect(() => {
    if (isFirst && !isFetching?.subject) {
      fetchRounds();
    }
  }, [isFetching?.subject]);

  useEffect(() => {
    if (isFirst && !isFetching?.round) {
      fetchSessions();
    }
  }, [isFetching?.round]);

  useEffect(() => {
    if (isFirst && !isFetching?.session && !isFetching?.semester) {
      fetchClasses();
    }
  }, [isFetching?.session, isFetching?.semester]);

  useEffect(() => {
    if (isFirst && !isFetching?.class) {
      fetchTeams();
    }
  }, [isFetching?.class]);

  useEffect(() => {
    if (isFirst && !isFetching?.team) {
      if (activeTab === "2") {
        fetchEvaluations();
      } else if (activeTab === "1") {
        fetchWorkEvaluations();
      }
    }
  }, [isFetching?.team]);
  //-----------------------

  //load when select change
  useEffect(() => {
    if (!isFirst && !isFetching?.subject) {
      fetchRounds();
    }
  }, [filterForm?.subject?.value]);

  useEffect(() => {
    if (!isFirst && !isFetching?.round && !isFetching?.semester) {
      fetchSessions();
    }
  }, [filterForm?.round?.value, filterForm?.semester?.value]);

  useEffect(() => {
    if (!isFirst && !isFetching?.semester && !isFetching?.session) {
      fetchClasses();
    }
  }, [filterForm?.session?.value]);

  useEffect(() => {
    if (!isFirst && !isFetching?.class && !isFetching?.session) {
      fetchTeams();
    }
  }, [filterForm?.class?.value, filterForm?.session?.value]);

  useEffect(() => {
    if (!isFirst && !isFetching?.team) {
      if (activeTab === "2") {
        fetchEvaluations();
      } else if (activeTab === "1") {
        fetchWorkEvaluations();
      }
    }
  }, [filterForm?.team?.value, activeTab]);

  // useEffect(() => {
  //   const fetchWorkEvaluations = async () => {
  //     if (isFetching.team || !filterForm?.class?.value || !filterForm?.milestone?.value || activeTab !== "1") {
  //       setIsFetching({ ...isFetching, reqEval: false });
  //       return;
  //     }
  //     try {
  //       setIsFetching({ ...isFetching, reqEval: true });
  //       const response = await authApi.post("/evaluation/search-requirement-evaluation", {
  //         classId: filterForm?.class?.value,
  //         milestoneId: filterForm?.milestone?.value,
  //         teamId: filterForm?.team?.value,
  //       });
  //       console.log("work evaluations:", response.data.data);
  //       if (response.data.statusCode === 200) {
  //         setWorkEvaluation(response.data.data?.workEvaluationResponses);
  //         setComplexity(response.data.data?.complexities);
  //         setQuality(response.data.data?.qualities);
  //       } else {
  //         toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       toast.error("Error search work evaluations!", { position: toast.POSITION.TOP_CENTER });
  //     } finally {
  //       setIsFetching({ ...isFetching, reqEval: false });
  //     }
  //   };

  //   fetchWorkEvaluations();
  // }, [filterForm.team, activeTab]);

  // useEffect(() => {
  //   const fetchMilestonesEvaluations = async () => {
  //     if (!filterForm?.class?.value || activeTab !== "3") {
  //       setIsFetching({ ...isFetching, allMileEval: false });
  //       return;
  //     }
  //     try {
  //       setIsFetching({ ...isFetching, allMileEval: true });
  //       const response = await authApi.get(
  //         `/evaluation/search-student-evaluation-by-class/${filterForm?.class?.value}`
  //       );
  //       console.log("milestone evaluations:", response.data.data);
  //       if (response.data.statusCode === 200) {
  //         let requirements = response.data.data;
  //         setMilestoneEvaluations(requirements);
  //       } else {
  //         toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       toast.error("Error search evaluations!", { position: toast.POSITION.TOP_CENTER });
  //     } finally {
  //       setIsFetching({ ...isFetching, allMileEval: false });
  //     }
  //   };

  //   fetchMilestonesEvaluations();
  // }, [filterForm.class, activeTab, classes]);

  return (
    <>
      <Head title="Evaluation"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>Final Evaluations</BlockTitle>
              <BlockDes></BlockDes>
            </BlockHeadContent>
            <BlockHeadContent></BlockHeadContent>
          </BlockBetween>
        </BlockHead>
        <Row className=" d-flex justify-content-around">
          <Col size="3">
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
          <Col size="3">
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
              <label className="form-label">Round</label>
              {isFetching?.round ? (
                <div>
                  <Spinner />
                </div>
              ) : (
                <RSelect
                  options={rounds}
                  value={filterForm.round}
                  onChange={(e) => setFilterForm({ ...filterForm, round: e })}
                />
              )}
            </div>
          </Col>
        </Row>
        <Row className="mt-3 d-flex justify-content-around">
          <Col size="3">
            <div className="form-group">
              <label className="form-label">Session</label>
              {isFetching?.session ? (
                <div>
                  <Spinner />
                </div>
              ) : (
                <RSelect
                  options={sessions}
                  value={filterForm.session}
                  onChange={(e) => {
                    if (
                      !isFetching?.class &&
                      !isFetching.team &&
                      ((!isFetching.studentEval && activeTab === "2") || (activeTab === "1" && !isFetching.reqEval))
                    ) {
                      setFilterForm({ ...filterForm, session: e });
                    }
                  }}
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
          <Col size="3">
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
        </Row>
        {true && (
          <>
            <Nav tabs>
              {/* <NavItem>
                <NavLink
                  tag="a"
                  href="#tab"
                  className={classnames({ active: activeTab === "3" })}
                  onClick={(ev) => {
                    ev.preventDefault();
                    toggle("3");
                  }}
                >
                  Classes
                </NavLink>
              </NavItem> */}
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
                  Milestones
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
                  LOC
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
                {activeTab === "1" ? (
                  <RequirementEvaluations
                    evaluations={workEvaluation}
                    setEvaluations={setWorkEvaluation}
                    milestone={10}
                    filterForm={filterForm}
                    teams={teams}
                    complexities={complexity}
                    qualities={quality}
                    role={role}
                    user={user}
                    loadings={isFetching?.reqEval}
                    canEdit={canEdit}
                    setHaveChanged={setHaveChanged}
                  />
                ) : (
                  <></>
                )}
              </TabPane>
              <TabPane tabId="2">
                {activeTab === "2" ? (
                  <GFStudentEvaluations
                    evaluations={evaluations}
                    setEvaluations={setEvaluations}
                    milestone={10}
                    filterForm={filterForm}
                    teams={teams}
                    role={role}
                    user={user}
                    loadings={isFetching?.studentEval}
                    canEdit={canEdit}
                    setHaveChanged={setHaveChanged}
                  />
                ) : (
                  <></>
                )}
              </TabPane>
              <TabPane tabId="3">
                {activeTab === "3" ? (
                  <>No data available</>
                ) : (
                  // <EvaluationsByMilestones
                  //   evaluations={milestoneEvaluations}
                  //   setEvaluations={setMilestoneEvaluations}
                  //   role={role}
                  //   loadings={isFetching?.allMileEval}
                  // />
                  <></>
                )}
              </TabPane>
            </TabContent>
          </>
        )}
        {role === "STUDENT" && (
          <Block>
            <>No data available</>
            {/* <ViewStudentEval
              data={milestoneEvaluations}
              classId={filterForm?.class?.value}
              loadings={isFetching?.allMileEval}
            /> */}
          </Block>
        )}
      </Content>
      <ToastContainer />
    </>
  );
}
