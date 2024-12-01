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
  Icon,
  RSelect,
} from "../../components/Component";
import {
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Row,
  Col,
  Spinner,
  ButtonGroup,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
} from "reactstrap";
import classnames from "classnames";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAuthStore from "../../store/Userstore";
import authApi from "../../utils/ApiAuth";
import { canModifySessionCouncil } from "../../utils/CheckPermissions";
import { convertToOptions, getAllOptions } from "../../utils/Utils";
import EvaluatedTeamsInClass from "./EvaluatedTeamsInClass";
import EvaluatedTeamsInTeam from "./EvaluatedTeamsInTeam";

export default function EvaluatedTeamsTabs() {
  const [modal, setModal] = useState({
    edit: false,
    add: false,
    import: false,
    importReq: false,
    addTeam: false,
    addReq: false,
    editReq: false,
    editTeam: false,
  });
  const [activeTab, setActiveTab] = useState("1");
  const navigate = useNavigate();

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      if (tab === "1") {
        setFilterForm({
          ...filterForm,
          classes: getAllOptions("All classes"),
        });
      }
    }
  };

  const [sm, updateSm] = useState(false);
  const { role } = useAuthStore((state) => state);
  const { user } = useAuthStore((state) => state);
  const [isFetching, setIsFetching] = useState({
    semester: true,
    round: true,
    subject: true,
    council: true,
    classes: true,
    team: true,
  });
  const [filterForm, setFilterForm] = useState({
    semester: null,
    subject: null,
    round: null,
    classes: null,
    team: null,
  });
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("id");
  const [orderBy, setOrderBy] = useState("desc");
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [councils, setCouncils] = useState([]);
  const [councilTeams, setCouncilTeams] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isFist, setIsFist] = useState(true);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
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
        setFilterForm({ ...filterForm, round: undefined });
        setIsFetching({ ...isFetching, round: false });
        return false;
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
          setFilterForm({ ...filterForm, round: null });
        }
        setRounds(rounds);
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi tìm kiếm lần chấm", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, round: false });
    }
  };
  const fetchClass = async () => {
    try {
      if (!filterForm?.semester?.value || !filterForm?.subject?.value) {
        setClasses([]);
        setFilterForm({ ...filterForm, classes: null });
        setIsFetching({ ...isFetching, classes: false });
        return;
      }
      setIsFetching({ ...isFetching, classes: true });
      const response = await authApi.get(
        "/council-team/search-class/" + filterForm?.semester?.value + `/${filterForm?.subject?.value}`
      );
      console.log("classes:", response.data.data);
      if (response.data.statusCode === 200) {
        let classList = convertToOptions(response.data.data, "id", "name");
        if (activeTab === "1") {
          classList.unshift(getAllOptions("All classes"));
        }
        setFilterForm({
          ...filterForm,
          classes: classList && classList[0],
        });
        setClasses(classList);
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
      setIsFetching({ ...isFetching, classes: false });
    }
  };
  const fetchTeams = async () => {
    try {
      if (!filterForm?.semester?.value || !filterForm?.subject?.value) {
        setTeams([]);
        setIsFetching({ ...isFetching, team: false });
        return;
      }
      setIsFetching({ ...isFetching, team: true });
      let url =
        "/council-team/search-teams?semesterId=" +
        filterForm?.semester?.value +
        `&subjectId=${filterForm?.subject?.value}`;
      if (filterForm?.classes?.value) {
        url += `&classId=${filterForm?.classes?.value}`;
      }
      const response = await authApi.get(url);
      console.log("teams:", response.data.data);
      if (response.data.statusCode === 200) {
        let teams = convertToOptions(response.data.data, "id", "name");
        teams.unshift(getAllOptions("All teams"));
        if (teams && teams.length > 0) {
          setFilterForm({ ...filterForm, team: teams[0] });
        }
        setTeams(teams);
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi tìm kiếm nhóm", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, team: false });
    }
  };
  const fetchData = async () => {
    try {
      if (!filterForm?.semester?.value || !filterForm?.round?.value) {
        setIsFist(false);
        setIsFetching({ ...isFetching, council: false });
        return;
      }
      setIsFetching({ ...isFetching, council: true });
      const response = await authApi.post("/council-team/search", {
        pageSize: itemPerPage,
        pageIndex: currentPage,
        semesterId: filterForm?.semester?.value,
        roundId: filterForm?.round?.value,
        classId: filterForm?.classes?.value,
        subjectId: filterForm?.subject?.value,
        teamId: filterForm?.team?.value,
        isSearchClass: activeTab === "1",
        sortBy: "id",
        orderBy: "ASC",
      });
      console.log("council teams:", response.data.data);
      if (response.data.statusCode === 200) {
        setCouncilTeams(response.data.data.councilTeams);
        setCouncils(response.data.data.councilDTOs);
        setSessions(response.data.data.sessionDTOs);
        setTotalElements(response.data.data.totalElements);
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi tìm kiếm phân công hội đồng", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFist(false);
      setIsFetching({ ...isFetching, council: false });
    }
  };

  //fisrt time
  useEffect(() => {
    if (!isFetching?.subject && isFist) {
      fetchRounds();
    }
  }, [isFetching.subject]);
  useEffect(() => {
    if (!isFetching.round && isFist) {
      fetchClass();
    }
  }, [isFetching?.round]);
  useEffect(() => {
    if (!isFetching.classes && isFist) {
      fetchTeams();
    }
  }, [isFetching?.classes]);
  useEffect(() => {
    if (!isFetching?.team && isFist) {
      fetchData();
    }
  }, [isFetching?.team]);
  //-------------------

  //load when select change
  // useEffect(() => {
  //   if (!isFist) {
  //     fetchRounds();
  //   }
  // }, [filterForm?.subject?.value]);
  useEffect(() => {
    if (!isFist) {
      fetchRounds();
    }
  }, [filterForm?.subject?.value]);
  useEffect(() => {
    if (!isFist && !isFetching?.semester && !isFetching?.round) {
      fetchClass();
    }
  }, [filterForm?.semester?.value, filterForm?.round?.value]);
  useEffect(() => {
    if (!isFist && !isFetching?.classes && activeTab === "2") {
      fetchTeams();
    }
  }, [filterForm?.classes?.value]);

  // tab1
  useEffect(() => {
    if (!isFist && !isFetching.round && !isFetching.classes && activeTab === "1") {
      fetchData();
    }
  }, [currentPage, filterForm?.classes?.value, filterForm?.round?.value, isFetching?.classes, activeTab]);

  // tab2
  useEffect(() => {
    if (!isFist && !isFetching.round && !isFetching.classes && !isFetching.team && activeTab === "2") {
      fetchData();
    }
  }, [
    currentPage,
    isFetching?.team,
    filterForm?.round?.value,
    filterForm?.team?.value,
    filterForm?.classes?.value,
    activeTab,
  ]);
  //-------------------

  return (
    <>
      <Head title="Phân công hội đồng"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page> Phân công hội đồng</BlockTitle>
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
                            <span className="sub-title dropdown-title">Lọc phân công hội đồng</span>
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
                            <div className="d-flex flex-wrap justify-content-between">
                              <div className="form-group mb-0" style={{ minWidth: "48%" }}>
                                <label className="form-label">Học kỳ</label>
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
                              <div className="form-group mb-0" style={{ minWidth: "48%" }}>
                                <label className="form-label">Môn học</label>
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
                            </div>
                            <div className="d-flex flex-wrap justify-content-between mt-2">
                              <div className="form-group mb-0" style={{ minWidth: "48%" }}>
                                <label className="form-label">Lần chấm</label>
                                {isFetching?.round ? (
                                  <div>
                                    <Spinner />
                                  </div>
                                ) : (
                                  <RSelect
                                    options={rounds}
                                    value={filterForm.round || null}
                                    onChange={(e) => setFilterForm({ ...filterForm, round: e })}
                                    styles={{ control: (base) => ({ ...base, width: "100%" }) }}
                                  />
                                )}
                              </div>
                              <div className="form-group mb-0" style={{ minWidth: "48%" }}>
                                <label className="form-label">Lớp học</label>
                                {isFetching?.classes ? (
                                  <div>
                                    <Spinner />
                                  </div>
                                ) : (
                                  <RSelect
                                    options={classes}
                                    value={filterForm.classes}
                                    onChange={(e) => setFilterForm({ ...filterForm, classes: e })}
                                    styles={{ control: (base) => ({ ...base, width: "100%" }) }}
                                  />
                                )}
                              </div>
                            </div>
                            <div className="d-flex flex-wrap justify-content-between mt-2">
                              <div className="form-group mb-0" style={{ minWidth: "48%" }}>
                                <label className="form-label">Nhóm</label>
                                {isFetching?.team ? (
                                  <div>
                                    <Spinner />
                                  </div>
                                ) : (
                                  <RSelect
                                    options={teams}
                                    value={filterForm.team}
                                    onChange={(e) => setFilterForm({ ...filterForm, team: e })}
                                    styles={{ control: (base) => ({ ...base, width: "100%" }) }}
                                  />
                                )}
                              </div>
                            </div>
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
        <Block>
          <Nav tabs className="mb-4">
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
                Phân công theo lớp
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
                Phân công theo nhóm
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              {activeTab === "1" &&
                (!isFetching?.council ? (
                  <EvaluatedTeamsInClass
                    filterForm={filterForm}
                    councils={councils}
                    setCouncils={setCouncils}
                    currentPage={currentPage}
                    itemPerPage={itemPerPage}
                    totalElements={totalElements}
                    paginate={paginate}
                    councilTeams={councilTeams}
                    setCouncilTeams={setCouncilTeams}
                    sessions={sessions}
                    setSessions={setSessions}
                  />
                ) : (
                  <div className="d-flex justify-content-center">
                    <Spinner style={{ width: "3rem", height: "3rem" }} />
                  </div>
                ))}
            </TabPane>
            <TabPane tabId="2">
              {activeTab === "2" &&
                (!isFetching?.council ? (
                  <EvaluatedTeamsInTeam
                    filterForm={filterForm}
                    councils={councils}
                    setCouncils={setCouncils}
                    currentPage={currentPage}
                    itemPerPage={itemPerPage}
                    totalElements={totalElements}
                    paginate={paginate}
                    councilTeams={councilTeams}
                    setCouncilTeams={setCouncilTeams}
                    sessions={sessions}
                    setSessions={setSessions}
                  />
                ) : (
                  <div className="d-flex justify-content-center">
                    <Spinner style={{ width: "3rem", height: "3rem" }} />
                  </div>
                ))}
            </TabPane>
          </TabContent>
        </Block>
      </Content>
      <ToastContainer />
    </>
  );
}
