import React, { useEffect, useState } from "react";
import Head from "../../layout/head/Head";
import Content from "../../layout/content/Content";
import { Block, BlockBetween, BlockHead, BlockHeadContent, BlockTitle, Button, Icon } from "../../components/Component";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import authApi from "../../utils/ApiAuth";
import ClassDetail from "./ClassDetails";
import StudentInClass from "./StudentInClass";
import { canModify } from "../../utils/CheckPermissions";
import useAuthStore from "../../store/Userstore";
import MilestoneCriterias from "./MilestoneCriterias";
import TeamList from "../teams/TeamList";
import FormModal from "../milestones/FormModal";
import { convertExcelTeamToRequest, divideIntoTeams, isNullOrEmpty, shuffleArray } from "../../utils/Utils";

export default function ClassDetailTabs() {
  const [activeTab, setActiveTab] = useState("1");
  const navigate = useNavigate();
  const [isFetching, setIsFetching] = useState({
    semester: true,
    subject: true,
    teacher: true,
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const [classes, setClasses] = useState({});
  const { role } = useAuthStore((state) => state);
  const [teams, setTeams] = useState([]);
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
  const [reset, setReset] = useState({
    team: false,
  });
  const [students, setStudents] = useState([]);
  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };
  const [importFormData, setImportFormData] = useState([]);
  const [random, setRandom] = useState(5);
  const [cloneMilestone, setCloneMilestone] = useState(null);
  const [typeImport, setTypeImport] = useState("file");
  const [inputFile, setInputFile] = useState("");
  const closeImportModal = () => {
    setModal({ import: false });
    setImportFormData([]);
    setRandom(5);
    setTypeImport("file");
  };

  useEffect(() => {
    const fetchClassById = async () => {
      try {
        const response = await authApi.get("/class/get-by-id/" + id);
        console.log(response);
        if (response.data.statusCode === 200) {
          setClasses(response.data.data);
          setError(null); // Xóa lỗi trước đó (nếu có)
        } else {
          setError(response.data.data);
        }
      } catch (error) {
        setError("Có lỗi xảy ra khi lấy thông tin lớp học.");
      }
    };
    fetchClassById();
  }, [id]);

  
  useEffect(() => {
    const fetchStudents = async () => {
      if (activeTab !== "4") return false;
      try {
        setIsFetching({ ...isFetching, students: true });
        const response = await authApi.post("/class/search-students", {
          classId: classes?.id,
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
            code: item.code,
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
        toast.error("Xảy ra lỗi khi tìm kiếm học sinh!", {
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
      if (!classes || activeTab !== "4") return false;
      try {
        setIsFetching({ ...isFetching, team: true });
        const response = await authApi.post("/teams/search", {
          classId: classes?.id,
        });
        console.log("team", response.data.data);
        if (response.data.statusCode === 200) {
          let teams = response.data.data.teamDTOs;
          // let currentTeam = teams.find(
          //   (team) =>
          //     team.members !== undefined &&
          //     team.members !== null &&
          //     team.teamName !== 'Wish List' &&
          //     team.members.findIndex((member) => member.id === user.id) !== -1
          // );
          setTeams(teams);
          // if (currentTeam) {
          //   setCurrentTeam({
          //     value: currentTeam.id,
          //     label: currentTeam.teamName,
          //   });
          // }
        } else {
          toast.error(response.data.data, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch {
        toast.error("Xảy ra lỗi khi tìm kiếm nhóm", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching({ ...isFetching, team: false });
      }
    };

    fetchTeams();
  }, [classes, activeTab, reset?.team]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const onImportSubmit = async (sData) => {
    setIsFetching({ ...isFetching, import: true });
    if (typeImport === "clone") {
      cloneTeams();
      return false;
    }
    if (sData.length === 0 && typeImport === "file") {
      toast.info(`Không có nhóm nào để nhập!`, {
        position: "top-center",
      });
      setIsFetching({ ...isFetching, import: false });
      return false;
    }
    let importTeamsForm = {};
    if (typeImport === "random") {
      if (isNullOrEmpty(random) || random <= 0) {
        toast.info(`Số thành viên trong một nhóm phải > 0!`, {
          position: "top-center",
        });
        setIsFetching({ ...isFetching, import: false });
        return false;
      }
      let shuffledData = shuffleArray(students);
      sData = divideIntoTeams(shuffledData, random);
      console.log("students", students);
      importTeamsForm = {
        classId: classes?.id,
        teams: convertExcelTeamToRequest(sData),
      };
    } else if (typeImport === "file") {
      importTeamsForm = {
        classId: classes?.id,
        teams: convertExcelTeamToRequest(sData),
      };
    }
    console.log("import form:", importTeamsForm);
    try {
      const response = await authApi.post("/teams/import-teams", importTeamsForm);
      console.log("import teams:", response.data.data);
      if (response.data.statusCode === 200) {
        toast.success("Nhập nhóm thành công!", {
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
      toast.error("Xảy ra lỗi khi nhập nhóm!", {
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

  return (
    <>
      <Head title="Chi Tiết Lớp Học"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>Chi Tiết Lớp Học</BlockTitle>
              <p>Thông tin chi tiết về lớp học và các thuộc tính của nó.</p>
            </BlockHeadContent>
            <BlockHeadContent>
              <Button color="primary" outline className="d-none d-sm-inline-flex" onClick={() => navigate(-1)}>
                <Icon name="arrow-left"></Icon>
                <span>Quay lại</span>
              </Button>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>
        <Block>
          <Nav tabs>
            <NavItem>
              <NavLink
                tag="a"
                href="#tab"
                className={classnames({ active: activeTab === "1" })}
                onClick={(ev) => {
                  ev.preventDefault();
                  if (classes?.id) toggle("1");
                }}
              >
                <Icon name="dashboard-fill" className="me-1"></Icon>
                Thông Tin Chung
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag="a"
                href="#tab"
                className={classnames({ active: activeTab === "2" })}
                onClick={(ev) => {
                  ev.preventDefault();
                  if (classes?.id) toggle("2");
                }}
              >
                <Icon name="users-fill" className="me-1"></Icon>
                Học Sinh
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag="a"
                href="#tab"
                className={classnames({ active: activeTab === "4" })}
                onClick={(ev) => {
                  ev.preventDefault();
                  if (classes?.id)
                    toggle("4");
                }}
              >
                <Icon name="users-fill" className="me-1"></Icon>
                Nhóm
              </NavLink>
            </NavItem>
            {/* {role !== "STUDENT" && (
              <NavItem>
                <NavLink
                  tag="a"
                  href="#tab"
                  className={classnames({ active: activeTab === "3" })}
                  onClick={(ev) => {
                    ev.preventDefault();
                    if (classes?.id) toggle("3");
                  }}
                >
                  <Icon name="note-add-fill" className="me-1"></Icon>
                  Tiêu Chí Đánh Giá
                </NavLink>
              </NavItem>
            )} */}
          </Nav>

          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">{activeTab === "1" ? <ClassDetail classes={classes} /> : <></>}</TabPane>
            <TabPane tabId="2">
              {activeTab === "2" && <StudentInClass classes={classes} users={users} setUsers={setUsers} />}
            </TabPane>
            <TabPane tabId="3">
              {activeTab === "3" && <MilestoneCriterias classes={classes} users={users} setUsers={setUsers} />}
            </TabPane>
            <TabPane tabId="4">
              {activeTab === "4" && (
                <TeamList
                  classes={classes}
                  teams={teams}
                  milestone={{}}
                  setTeams={setTeams}
                  modal={modal}
                  setModal={setModal}
                  isFetching={isFetching?.team || isFetching?.students}
                  reset={reset?.team}
                  setReset={setReset}
                />
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
          milestone={{}}
          classId={classes?.id}
          random={random}
          setRandom={setRandom}
          setTypeImport={setTypeImport}
          cloneMilestone={cloneMilestone}
          setCloneMilestone={setCloneMilestone}
          inputFile={inputFile}
          setInputFile={setInputFile}
        />
      </Content>
      <ToastContainer />
    </>
  );
}
