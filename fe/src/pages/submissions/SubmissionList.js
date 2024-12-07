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
  Row,
  RSelect,
  TooltipComponent,
} from "../../components/Component";
import authApi from "../../utils/ApiAuth";
import { convertToOptions, formatDate, getAllOptions, isNullOrEmpty, shortenString } from "../../utils/Utils";
import { ButtonGroup, DropdownItem, DropdownMenu, DropdownToggle, Spinner, UncontrolledDropdown } from "reactstrap";
import { evaluationTypes, requirementStatuses } from "../../data/ConstantData";
import SubmitWorkModal from "../requirements/SubmitWorkModal";
import useAuthStore from "../../store/Userstore";
import SubmitReqModal from "./SubmitReqModal";
import { canSubmitWork } from "../../utils/CheckPermissions";
import { useNavigate } from "react-router-dom";

export default function SubmissionList() {
  const [sm, updateSm] = useState(false);
  const [tablesm, updateTableSm] = useState(false);
  const [onSearch, setonSearch] = useState(true);
  const [onSearchText, setSearchText] = useState("");
  const [modal, setModal] = useState({
    edit: false,
    add: false,
    submit: false,
  });
  const [isFetching, setIsFetching] = useState({
    semester: true,
    subject: true,
    class: true,
    milestone: true,
    team: true,
    requirement: true,
  });
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
  const [actionText, setActionText] = useState("");
  const [teamMembers, setTeamMembers] = useState({});
  const [formData, setFormData] = useState({
    requirements: [],
    submitType: "file",
    file: null,
    link: null,
    note: "",
  });
  const onActionText = (e) => {
    setActionText(e.value);
  };
  const toggle = () => setonSearch(!onSearch);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const [permission, setPermission] = useState({});
  const [canSubmit, setCanSubmit] = useState(false);
  const navigate = useNavigate();

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
      toast.error("Xảy ra lỗi khi tìm kiếm học kỳ", { position: toast.POSITION.TOP_CENTER });
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
      toast.error("Xảy ra lỗi khi tìm kiếm môn học", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetching((prev) => ({ ...prev, subject: false }));
    }
  };

  const fetchClasses = async () => {
    if (isFetching.subject || isFetching.semester) return;
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
        const classOptions = convertToOptions(response.data.data.classesDTOS, "id", "classCode");
        setClasses(classOptions);
        if (response.data.data.totalElements > 0) {
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
      toast.error("Xảy ra lỗi khi tìm kiếm lớp học", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetching((prev) => ({ ...prev, class: false }));
    }
  };

  const fetchMilestones = async () => {
    if (isFetching.class) return;
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
        // rMilestones = rMilestones.filter(milestone => milestone.evaluationType !== evaluationTypes[2].value);
        const milestoneOptions = convertToOptions(rMilestones, "id", "title");
        setMilestones(milestoneOptions);
        if (response.data.data.totalElements > 0) {
          const milestone = {
            value: rMilestones[0]?.id,
            label: rMilestones[0]?.title,
          };
          let nPermission = {};
          rMilestones.forEach((item) => {
            nPermission = {
              ...nPermission,
              [`m-${item?.id}`]: item?.active || item.evaluationType === evaluationTypes[2].value,
            };
          });
          setPermission({
            ...permission,
            ...nPermission,
          });
          setFilterForm((prev) => ({
            ...prev,
            milestone: milestone,
          }));
          setSearchForm((prev) => ({
            ...prev,
            milestone: milestone,
          }));
        } else {
          setFilterForm((prev) => ({ ...prev, milestone: null }));
          setSearchForm((prev) => ({ ...prev, milestone: null }));
        }
      } else {
        toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi tìm kiếm cột mốc", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetching((prev) => ({ ...prev, milestone: false }));
    }
  };

  const fetchTeams = async () => {
    if (isFetching.milestone) return;
    if (!filterForm.milestone) {
      setFilterForm({ ...filterForm, team: null });
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
        let rTeams = response.data.data.teamDTOs;
        let teamOptions = convertToOptions(rTeams, "id", "teamName");
        teamOptions = teamOptions?.filter((team) => team.label !== "Wish List");
        if (role !== "STUDENT") {
          teamOptions.unshift(getAllOptions("Tất cả"));
        }
        if (teamOptions.length > 0) {
          let nTeamMembers = {},
            nPermission = {};
          rTeams
            .filter((item) => item.teamName !== "Wish List")
            .forEach((item) => {
              nTeamMembers = {
                ...nTeamMembers,
                [`${item.id}`]: item.members,
              };
              nPermission = {
                ...nPermission,
                [`t-${item.id}`]: item.leaderId,
              };
            });
          setPermission({
            ...permission,
            ...nPermission,
          });
          setTeamMembers(nTeamMembers);
          const team = {
            value: teamOptions[0]?.value,
            label: teamOptions[0]?.label,
          };
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
      toast.error("Xảy ra lỗi khi tìm kiếm nhóm", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetching((prev) => ({ ...prev, team: false }));
    }
  };

  const fetchSubmissions = async () => {
    if (isFetching.milestone || isFetching.team) return;
    if (!filterForm?.milestone?.value) {
      setIsFetching({ ...isFetching, requirement: false });
      setData([]);
      return;
    }
    try {
      setIsFetching({ ...isFetching, requirement: true });
      const response = await authApi.post("/submission/search", {
        pageSize: 9999,
        pageIndex: 1,
        milestoneId: filterForm?.milestone?.value,
        teamId: filterForm?.team?.value,
        // title: filterForm?.title,
        // isCurrentRequirements: role === "STUDENT",
      });
      console.log("submissions:", response.data.data);
      if (response.data.statusCode === 200) {
        // let requirements = response.data.data.requirementDTOs;
        // requirements = requirements.filter((item) => item.status !== "WAITING FOR APPROVAL");
        // setData(requirements);

        setCanSubmit(
          canSubmitWork(user, role, permission[`t-${filterForm?.team?.value}`]) &&
            permission[`m-${filterForm?.milestone?.value}`]
        );
        let submissions = response.data.data.submissionDTOS;
        setData(submissions);
      } else {
        toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi tìm kiếm bài nộp", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetching({ ...isFetching, requirement: false });
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [isFetching.semester]);

  useEffect(() => {
    fetchClasses();
  }, [filterForm.subject, filterForm.semester]);

  useEffect(() => {
    fetchMilestones();
  }, [filterForm.class, isFetching?.class]);

  useEffect(() => {
    fetchTeams();
  }, [filterForm.milestone, isFetching?.milestone]);

  useEffect(() => {
    fetchSubmissions();
  }, [filterForm.team, filterForm.title, isFetching.team]);

  const selectorCheck = (e) => {
    let newData;
    newData = data.map((item) => {
      item.checked = e.currentTarget.checked;
      return item;
    });
    setData([...newData]);
  };

  const onActionClick = (e, type) => {
    let checkedReqs = data.filter((item) => item.checked === true);
    if (checkedReqs.length === 0) {
      toast.info("Please select at least one item", {
        position: toast.POSITION.TOP_CENTER,
      });
      return false;
    }
    setModal({ submit: true });
    setFormData({
      requirements: checkedReqs,
      submitType: type,
    });
  };

  const onSelectChange = (e, id) => {
    let newData = data;
    let index = newData.findIndex((item) => item.id === id);
    newData[index].checked = e.currentTarget.checked;
    setData([...newData]);
  };

  const closeSubmitModal = () => {
    setModal({ submit: false });
    setFormData({
      requirements: [],
      submitType: "file",
      file: null,
      link: null,
    });
  };

  return (
    <>
      <Head title="Danh sách bài nộp" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page> Danh sách bài nộp</BlockTitle>
              {/* <BlockDes className="text-soft">You have total 0 submissions</BlockDes> */}
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
                            <span className="sub-title dropdown-title">Lọc bài nộp</span>
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
                                  <label className="overline-title overline-title-alt">Mốc</label>
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
                                      placeholder="Chọn mốc"
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
        <Block>
          {isFetching?.requirement ? (
            <div className="d-flex justify-content-center">
              <Spinner style={{ width: "3rem", height: "3rem" }} />
            </div>
          ) : (
            <DataTable className="card-stretch">
              <div className="card-inner position-relative card-tools-toggle">
                <div className="card-title-group">
                  <div className="card-tools">
                    {role === "STUDENT" && <div className="form-inline flex-nowrap gx-3"></div>}
                  </div>
                  <div className="card-tools me-n1">
                    <ul className="btn-toolbar gx-1">
                      <li>
                        {(!data || data.length === 0) && canSubmit && (
                          <Button
                            color="primary"
                            onClick={() => {
                              if (!filterForm?.milestone?.value || !filterForm.team.value) {
                                toast.info("Không tìm thấy cột mốc hoặc nhóm nào!", {
                                  position: toast.POSITION.TOP_CENTER,
                                });
                                return;
                              }
                              navigate(
                                `/submissions/submit-detail?mId=${filterForm?.milestone?.value}&tId=${filterForm?.team?.value}`
                              );
                            }}
                          >
                            <Icon name="plus"></Icon>
                            Nộp bài
                          </Button>
                        )}
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
                  <DataTableRow>
                    <span className="sub-text">Cột mốc</span>
                  </DataTableRow>
                  <DataTableRow size="sm">
                    <span className="sub-text">Nhóm</span>
                  </DataTableRow>
                  <DataTableRow>
                    <span className="sub-text">Nộp bài</span>
                  </DataTableRow>
                  <DataTableRow>
                    <span className="sub-text">Thời gian nộp</span>
                  </DataTableRow>
                  <DataTableRow>
                    <span className="sub-text">Người nộp</span>
                  </DataTableRow>
                  {/* <DataTableRow>
                    <span className="sub-text">Trạng thái</span>
                  </DataTableRow> */}
                  <DataTableRow>
                    <span className="sub-text">Hành động</span>
                  </DataTableRow>
                </DataTableHead>
                {data && data.length > 0
                  ? data.map((item) => {
                      return (
                        <DataTableItem key={item.id}>
                          <DataTableRow>
                            <span>{item.mileName}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span style={{ cursor: "pointer" }}>{item.teamName}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <p>
                              {!isNullOrEmpty(item.submitFile) && (
                                <p>
                                  Tệp:{" "}
                                  <a href={item.submitFile} download={getFileNameFromURL(item.submitFile)}>
                                    {shortenString(getFileNameFromURL(item.submitFile), 50)}
                                  </a>
                                </p>
                              )}
                            </p>
                            <p>
                              {!isNullOrEmpty(item.submitLink) && (
                                <p>
                                  Liên kết:{" "}
                                  <a href={item.submitLink} target="_blank">
                                    {shortenString(item.submitLink, 50)}
                                  </a>
                                </p>
                              )}
                            </p>
                          </DataTableRow>
                          <DataTableRow>
                            <span>{formatDate(item.submitAt)}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span style={{ cursor: "pointer" }}>{item.updateBy}</span>
                          </DataTableRow>
                          {/* <DataTableRow>{item.status}</DataTableRow> */}
                          <DataTableRow>
                            <Button
                              color="primary"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                navigate(
                                  `/submissions/submit-detail?mId=${filterForm?.milestone?.value}&tId=${item?.teamId}`
                                );
                              }}
                            >
                              {canSubmit ? "Cập nhật" : "Xem"}
                            </Button>
                          </DataTableRow>
                        </DataTableItem>
                      );
                    })
                  : null}
              </DataTableBody>
              <div className="card-inner">
                {data.length === 0 && (
                  <div className="text-center">
                    <span className="text-silent">Không tìm thấy dữ liệu</span>
                  </div>
                )}
              </div>
            </DataTable>
          )}
        </Block>
        {modal?.submit && (
          <SubmitReqModal
            modal={modal.submit}
            modalType="add"
            formData={formData}
            setFormData={setFormData}
            data={data}
            setData={setData}
            closeModal={closeSubmitModal}
            teamMembers={teamMembers}
            milestoneId={filterForm?.milestone?.value}
            teamId={filterForm?.team?.value}
            role={role}
            canSubmit={canSubmit}
          />
        )}
        {modal?.edit && (
          <SubmitReqModal
            modal={modal.edit}
            modalType="edit"
            formData={formData}
            setFormData={setFormData}
            data={data}
            setData={setData}
            closeModal={closeSubmitModal}
            teamMembers={teamMembers}
            milestoneId={filterForm?.milestone?.value}
            teamId={filterForm?.team?.value}
            role={role}
            canSubmit={canSubmit}
          />
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
