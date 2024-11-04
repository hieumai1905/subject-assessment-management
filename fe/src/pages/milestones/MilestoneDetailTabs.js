import React, { useEffect, useState } from "react";
import Head from "../../layout/head/Head";
import Content from "../../layout/content/Content";
import { Block, BlockBetween, BlockDes, BlockHeadContent, BlockTitle, Button, Icon } from "../../components/Component";
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
} from "reactstrap";
import classnames from "classnames";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import authApi from "../../utils/ApiAuth";
import CriteriaList from "../evaluation-criteria/CriteriaList";
import TeamList from "../teams/TeamList";
import FormModal from "./FormModal";
import RequirementList from "../requirements/RequirementList";
import useAuthStore from "../../store/Userstore";
import {
  convertExcelTeamToRequest,
  convertToOptions,
  divideIntoTeams,
  isNullOrEmpty,
  shuffleArray,
} from "../../utils/Utils";
import { canModifyMilestone } from "../../utils/CheckPermissions";

export default function MilestoneDetailTabs() {
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
  const [isFetching, setIsFetching] = useState({
    import: false,
    importReq: false,
    updateCriterias: false,
    team: false,
    detail: true,
    students: false,
  });
  const [importFormData, setImportFormData] = useState([]);
  const [random, setRandom] = useState(5);
  const [cloneMilestone, setCloneMilestone] = useState(null);
  const [typeImport, setTypeImport] = useState("file");
  const closeImportModal = () => {
    setModal({ import: false });
    setImportFormData([]);
    setRandom(5);
    setTypeImport("file");
  };
  const [activeTab, setActiveTab] = useState("3");
  const navigate = useNavigate();

  const toggle = (tab) => {
    if (activeTab !== tab && !isFetching?.detail) setActiveTab(tab);
  };

  const { id } = useParams();
  const [milestone, setMilestone] = useState({});
  const [randomTeams, setRandomTeams] = useState([]);
  const [students, setStudents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [milestoneCriterias, setMilestoneCriterias] = useState([]);
  const [selectedParent, setSelectedParent] = useState({});
  const [reload, setReload] = useState(false);
  const { role } = useAuthStore((state) => state);
  const { user } = useAuthStore((state) => state);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [inputFile, setInputFile] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updatedMilestone, setUpdatedMilestone] = useState({
    title: "",
    dueDate: "",
    note: "",
  });
  const [subjectName, setSubjectName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [reset, setReset] = useState({
    team: false,
  });

  const toggleUpdateModal = () => {
    setUpdatedMilestone({
      title: milestone.title,
      dueDate: milestone.dueDate,
      note: milestone.note,
    });
    setIsUpdateModalOpen(!isUpdateModalOpen);
  };

  const fetchSubjectName = async (subjectId) => {
    try {
      const response = await authApi.get(`/subjects/get-by-id/${subjectId}`);
      if (response.data.statusCode === 200) {
        setSubjectName(response.data.data.subjectName);
      } else {
        toast.error("Error fetching subject name!", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error fetching subject name:", error);
    }
  };

  const fetchTeacherName = async (teacherId) => {
    try {
      const response = await authApi.get(`/user/get-detail/${teacherId}`);
      if (response.data.statusCode === 200) {
        setTeacherName(response.data.data.fullname);
      } else {
        toast.error("Error fetching teacher name!", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error fetching teacher name:", error);
    }
  };

  useEffect(() => {
    if (milestone.subjectId) fetchSubjectName(milestone.subjectId);
    if (milestone.teacherId) fetchTeacherName(milestone.teacherId);
  }, [milestone]);

  const handleUpdateSubmit = async () => {
    try {
      const response = await authApi.put(`/milestone/update/${milestone.id}`, updatedMilestone);
      if (response.data.statusCode === 200) {
        toast.success("Milestone updated successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        setMilestone({
          ...milestone,
          title: updatedMilestone?.title,
          dueDate: updatedMilestone?.dueDate,
          note: updatedMilestone?.note,
        });
        toggleUpdateModal();
      } else {
        toast.error(response.data.data, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error updating milestone:", error);
      toast.error("Error updating milestone!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  useEffect(() => {
    const fetchMilestone = async () => {
      try {
        setIsFetching({ ...isFetching, detail: true });
        const response = await authApi.get("/milestone/get-by-id/" + id);
        console.log("milestone:", response.data.data);
        if (response.data.statusCode === 200) {
          setMilestone(response.data.data.milestone);
        } else {
          toast.error(response.data.data, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch {
        toast.error("Error while getting milestone!", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching({ ...isFetching, detail: false });
      }
    };
    fetchMilestone();
  }, [id]);

  const onImportSubmit = async (sData) => {
    setIsFetching({ ...isFetching, import: true });
    if (typeImport === "clone") {
      cloneTeams();
      return false;
    }
    if (sData.length === 0 && typeImport === "file") {
      toast.info(`No team to import!`, {
        position: "top-center",
      });
      setIsFetching({ ...isFetching, import: false });
      return false;
    }
    let importTeamsForm = {};
    if (typeImport === "random") {
      if (isNullOrEmpty(random) || random <= 0) {
        toast.info(`Number of members for each team must be > 0!`, {
          position: "top-center",
        });
        setIsFetching({ ...isFetching, import: false });
        return false;
      }
      let shuffledData = shuffleArray(students);
      sData = divideIntoTeams(shuffledData, random);
      console.log("students", students);
      importTeamsForm = {
        milestoneId: milestone?.id,
        teams: convertExcelTeamToRequest(sData),
      };
    } else if (typeImport === "file") {
      importTeamsForm = {
        milestoneId: milestone?.id,
        teams: convertExcelTeamToRequest(sData),
      };
    }
    console.log("import form:", importTeamsForm);
    try {
      const response = await authApi.post("/teams/import-teams", importTeamsForm);
      console.log("import teams:", response.data.data);
      if (response.data.statusCode === 200) {
        toast.success("Import teams successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        setModal({ import: false });
        setImportFormData([]);
        setRandom(5);
        setCloneMilestone(null);
        setTypeImport("file");
        setIsFetching({ ...isFetching, import: false });
        setTeams(response.data.data.teamDTOs);
      } else {
        toast.error(`${response.data.data}`, {
          position: "top-center",
        });
        setIsFetching({ ...isFetching, import: false });
        setInputFile("");
      }
    } catch (error) {
      console.error("Error import teams:", error);
      toast.error("Error import teams!", {
        position: toast.POSITION.TOP_CENTER,
      });
      setIsFetching({ ...isFetching, import: false });
      setInputFile("");
    }
  };

  const cloneTeams = async () => {
    console.log("clone: ", milestone, cloneMilestone);
    if (isNullOrEmpty(cloneMilestone)) {
      toast.info(`Please select a milestone to clone!`, {
        position: "top-center",
      });
      setIsFetching({ ...isFetching, import: false });
      return false;
    }
    try {
      const response = await authApi.get(
        `/teams/clone-from?milestoneId=${milestone?.id}&cloneMilestoneId=${cloneMilestone?.value}`
      );
      console.log("clone teams:", response.data.data);
      if (response.data.statusCode === 200) {
        toast.success("Clone teams successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        setModal({ import: false });
        setImportFormData([]);
        setRandom(5);
        setCloneMilestone(null);
        setTypeImport("file");
        setIsFetching({ ...isFetching, import: false });
        setTeams(response.data.data.teamDTOs);
      } else {
        toast.error(`${response.data.data}`, {
          position: "top-center",
        });
        setIsFetching({ ...isFetching, import: false });
      }
    } catch (error) {
      console.error("Error clone teams:", error);
      toast.error("Error clone teams!", {
        position: toast.POSITION.TOP_CENTER,
      });
      setIsFetching({ ...isFetching, import: false });
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      if (activeTab !== "1") return false;
      try {
        setIsFetching({ ...isFetching, students: true });
        const response = await authApi.post("/class/search-students", {
          classId: milestone?.classesId,
          roleId: 4,
          pageSize: 9999,
        });
        console.log("search student:", response.data.data);
        if (response.data.statusCode === 200) {
          let transformedData = response.data.data.classUserSuccessDTOS.map((item) => ({
            id: item.userId,
            fullname: item.fullname,
            gender: item.gender,
            email: item.email,
            isLeader: "",
            teamName: "",
            topicName: "",
          }));
          setStudents(transformedData);
        } else {
          toast.error(`${response.data.data}`, {
            position: "top-center",
          });
        }
      } catch (error) {
        console.error("Error random team:", error);
        toast.error("Error random team!", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching({ ...isFetching, students: false });
      }
    };
    fetchStudents();
  }, [activeTab]);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!milestone || activeTab === "3") return false;
      try {
        setIsFetching({ ...isFetching, team: true });
        const response = await authApi.post("/teams/search", {
          milestoneId: milestone?.id,
        });
        console.log("team", response.data.data);
        if (response.data.statusCode === 200) {
          let teams = response.data.data.teamDTOs;
          let currentTeam = teams.find(
            (team) =>
              team.members !== undefined &&
              team.members !== null &&
              team.teamName !== 'Wish List' &&
              team.members.findIndex((member) => member.id === user.id) !== -1
          );
          console.log('cur', currentTeam , user.id);
          setTeams(teams);
          if (currentTeam) {
            setCurrentTeam({
              value: currentTeam.id,
              label: currentTeam.teamName,
            });
          }
        } else {
          toast.error(response.data.data, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch {
        toast.error("Error while getting teams!", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching({ ...isFetching, team: false });
      }
    };

    fetchTeams();
  }, [milestone, activeTab, reset?.team]);

  return (
    <>
      <Head title="Milestone Detail"></Head>
      <Content>
        <Block>
          <Nav tabs className="mb-4">
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
                General
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
                Teams
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
                Requirements
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              {activeTab === "1" && (
                <TeamList
                  teams={teams}
                  milestone={milestone}
                  setTeams={setTeams}
                  modal={modal}
                  setModal={setModal}
                  isFetching={isFetching?.team || isFetching?.students}
                  reset={reset?.team}
                  setReset={setReset}
                />
              )}
            </TabPane>
            <TabPane tabId="2">
              {activeTab === "2" && (
                <RequirementList
                  teams={convertToOptions(
                    teams.filter((item) => item.id !== null && item.id !== undefined),
                    "id",
                    "teamName"
                  )}
                  milestone={milestone}
                  setTeams={setTeams}
                  modal={modal}
                  setModal={setModal}
                  currentTeam={currentTeam}
                />
              )}
            </TabPane>
            <TabPane tabId="3">
              {activeTab === "3" && (
                <>
                  <BlockBetween
                    className="align-items-center"
                    style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "8px" }}
                  >
                    <BlockHeadContent>
                      <BlockTitle
                        page
                        className="text-primary d-flex align-items-center mb-3"
                        style={{ fontSize: "18px" }}
                      >
                        <Icon name="flag" className="me-2"></Icon>
                        {milestone.title}
                        {canModifyMilestone(user, role, milestone?.teacherId) && milestone?.active && <Button
                          color="primary"
                          onClick={toggleUpdateModal}
                          style={{
                            fontSize: "12px",
                            padding: "6px 12px",
                            marginLeft: "auto",
                          }}
                        >
                          <Icon name="edit" className="me-2"></Icon>
                          Update
                        </Button>}
                      </BlockTitle>

                      <Row className="gx-3 gy-2">
                        {/* <Col xs="12" sm="6" md="4">
                          <BlockDes className="text-muted" style={{ fontSize: "16px" }}>
                            <Icon name="calendar" className="fs-5 me-2"></Icon>
                            <strong>Start Date:</strong> {milestone.startDate && milestone?.startDate.split("T")[0]}
                          </BlockDes>
                        </Col> */}
                        <Col xs="12" sm="6" md="4">
                          <BlockDes className="text-muted" style={{ fontSize: "16px" }}>
                            <Icon name="calendar" className="fs-5 me-2"></Icon>
                            <strong>Due Date:</strong> {milestone.dueDate && milestone?.dueDate.split("T")[0]}
                          </BlockDes>
                        </Col>

                        <Col xs="12" sm="6" md="4">
                          <BlockDes className="text-muted" style={{ fontSize: "16px" }}>
                            <Icon name="tag" className="fs-5 me-2"></Icon>
                            <strong>Class Code:</strong> {milestone.classesCode}
                          </BlockDes>
                        </Col>
                        <Col xs="12" sm="6" md="4">
                          <BlockDes className="text-muted" style={{ fontSize: "16px" }}>
                            <Icon name="user" className="fs-5 me-2"></Icon>
                            <strong>Teacher:</strong> {teacherName}
                          </BlockDes>
                        </Col>
                        <Col xs="12" sm="6" md="4">
                          <BlockDes className="text-muted" style={{ fontSize: "16px" }}>
                            <Icon name="book" className="fs-5 me-2"></Icon>
                            <strong>Subject:</strong> {subjectName}
                          </BlockDes>
                        </Col>
                        <Col xs="12" sm="6" md="4">
                          <BlockDes className="text-muted" style={{ fontSize: "16px" }}>
                            <Icon name="briefcase" className="fs-5 me-2"></Icon>
                            <strong>Type Evaluator:</strong> {milestone.typeEvaluator}
                          </BlockDes>
                        </Col>

                        <Col xs="12" sm="6" md="4">
                          <BlockDes className="text-muted" style={{ fontSize: "16px" }}>
                            <Icon name="check-circle" className="fs-5 me-2"></Icon>
                            <strong>Active:</strong> {milestone.active ? "Open" : "Close"}
                          </BlockDes>
                        </Col>
                      </Row>

                      <BlockDes
                        className="border-top mt-4 pt-3"
                        style={{ fontSize: "16px", backgroundColor: "#2d3748", padding: "15px", borderRadius: "8px" }}
                      >
                        <Icon name="file-text" className="fs-5 me-2"></Icon>
                        <strong>Note:</strong>
                        <p className="mt-2 mb-0">{milestone.note}</p>
                      </BlockDes>
                    </BlockHeadContent>
                  </BlockBetween>
                </>
              )}
            </TabPane>
          </TabContent>
        </Block>
        <FormModal
          modal={modal.import}
          modalType="import"
          formData={importFormData}
          setFormData={setImportFormData}
          closeModal={closeImportModal}
          onSubmit={onImportSubmit}
          isFetching={isFetching.import}
          milestone={milestone}
          random={random}
          setRandom={setRandom}
          setTypeImport={setTypeImport}
          cloneMilestone={cloneMilestone}
          setCloneMilestone={setCloneMilestone}
          inputFile={inputFile}
          setInputFile={setInputFile}
        />
      </Content>

      <Modal isOpen={isUpdateModalOpen} toggle={toggleUpdateModal} style={{ maxWidth: "800px" }}>
        <ModalHeader toggle={toggleUpdateModal}>Update Milestone</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="milestoneTitle">Title*</Label>
              <Input
                type="text"
                id="milestoneTitle"
                value={updatedMilestone.title}
                onChange={(e) => setUpdatedMilestone({ ...updatedMilestone, title: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label for="milestoneDueDate">Due Date*</Label>
              <Input
                type="date"
                id="milestoneDueDate"
                value={updatedMilestone.dueDate}
                onChange={(e) => setUpdatedMilestone({ ...updatedMilestone, dueDate: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label for="milestoneDescription">Note</Label>
              <Input
                type="textarea"
                id="milestoneDescription"
                value={updatedMilestone.note}
                onChange={(e) => setUpdatedMilestone({ ...updatedMilestone, note: e.target.value })}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleUpdateSubmit}>
            Save Changes
          </Button>
          <Button color="secondary" onClick={toggleUpdateModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
      <ToastContainer />
    </>
  );
}
