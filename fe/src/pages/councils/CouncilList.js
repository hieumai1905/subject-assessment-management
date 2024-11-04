import React, { useEffect, useState } from "react";
import authApi from "../../utils/ApiAuth";
import {
  Button,
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Spinner,
  UncontrolledDropdown,
  Card,
  CardBody,
  CardHeader,
  ButtonGroup,
} from "reactstrap";
import { BlockDes, BlockTitle, Icon, PreviewCard, RSelect } from "../../components/Component";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import useAuthStore from "../../store/Userstore";
import { canModifyMilestone, canModifySessionCouncil } from "../../utils/CheckPermissions";
import FormModal from "./FormModal";
import { convertToOptions, isEqual } from "../../utils/Utils";
import Head from "../../layout/head/Head";
import Content from "../../layout/content/Content";
import CouncilModal from "./CouncilModal";

export default function CouncilList() {
  const { role } = useAuthStore((state) => state);
  const { user } = useAuthStore((state) => state);

  const [modal, setModal] = useState({
    edit: false,
    add: false,
  });
  const [editId, setEditedId] = useState();
  const [isOpen, setIsOpen] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [councils, setCouncils] = useState([]);
  const [rCouncils, setRCouncils] = useState([]);
  const [isFetching, setIsFetching] = useState({
    semester: true,
    round: true,
    subject: true,
    council: true,
  });
  const [filterForm, setFilterForm] = useState({
    semester: null,
    subject: null,
    round: null,
  });
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage] = useState(7);
  const [sortBy, setSortBy] = useState("id");
  const [orderBy, setOrderBy] = useState("desc");
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [remainTeachers, setRemainTeachers] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [isFirst, setIsFirst] = useState(true);
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
      if (!filterForm?.subject?.value){
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
        } else{
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
  const fetchData = async () => {
    try {
      if (!filterForm?.semester?.value || !filterForm?.round?.value) {
        setIsFetching({ ...isFetching, council: false });
        setCouncils([]);
        setRCouncils([]);
        setTotalElements(0);
        return;
      }
      setIsFetching({ ...isFetching, council: true });
      const response = await authApi.post("/councils/search", {
        pageSize: 9999,
        pageIndex: 1,
        semesterId: filterForm?.semester?.value,
        settingId: filterForm?.round?.value,
        sortBy: "id",
        orderBy: "ASC",
      });
      console.log("councils:", response.data.data);
      if (response.data.statusCode === 200) {
        setCouncils(response.data.data.councilDTOs);
        setRCouncils(response.data.data.councilDTOs);
        setTotalElements(response.data.data.totalElements);
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error search councils!", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, council: false });
      setIsFirst(false);
    }
  };

  // load first time
  useEffect(() => {
    if(isFirst && !isFetching?.subject){
      fetchRounds();
    }
  }, [isFetching.subject]);
  useEffect(() => {
    if(isFirst && !isFetching?.round){
      fetchData();
    }
  }, [isFetching.round]);
  //-------------------

  // load when select change
  useEffect(() => {
    if(!isFirst && !isFetching?.subject){
      fetchRounds();
    }
  }, [filterForm?.subject?.value]);
  useEffect(() => {
    if(!isFirst && !isFetching?.semester && !isFetching?.round){
      fetchData();
    }
  }, [currentPage, sortBy, orderBy, filterForm?.semester?.value, filterForm?.round?.value]);
  //-------------------

  const [formData, setFormData] = useState([]);
  const [editFormData, setEditFormData] = useState({
    teamName: "",
    topicName: "",
    note: "",
    active: "Active",
  });
  const [searchText, setSearchText] = useState("");

  const toggleCollapse = (teamId) => {
    setIsOpen((prev) => (teamId === prev ? "0" : teamId));
  };

  const resetForm = () => {
    setFormData([]);
  };

  const closeModal = () => {
    setModal({ add: false });
    resetForm();
  };

  const closeEditModal = () => {
    setModal({ editTeam: false });
    resetForm();
  };

  const onFormSubmit = async (sData) => {
    const { teamName, topicName, note } = sData;
    const submittedData = {
      teamName,
      topicName,
      note,
      active: true,
      milestoneId: milestone?.id,
      members: teams[0].members,
    };

    try {
      setIsSubmitting(true);
      const response = await authApi.post("/teams", submittedData);
      if (response.data.statusCode === 200) {
        toast.success("Create team successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        const team = {
          ...response.data.data,
          members: teams[0].members,
          teamOfCurrentMilestone: true,
        };
        let updatedTeam = [...teams];
        updatedTeam = updatedTeam.filter((item) => item.teamName !== "Wish List");
        updatedTeam.push(team);
        setTeams(updatedTeam);
        resetForm();
        closeModal();
      } else {
        toast.error(response.data.data, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Error creating team!", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEditSubmit = async (sData) => {
    const { teamName, topicName, note } = sData;
    try {
      setIsSubmitting(true);
      const response = await authApi.put(`/teams/${editId}`, {
        id: editId,
        teamName,
        topicName,
        note,
        active: true,
        milestoneId: milestone?.id,
      });
      if (response.data.statusCode === 200) {
        toast.success("Update team successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        setTeams((prev) => {
          const updatedTeams = [...prev];
          const index = updatedTeams.findIndex((item) => item.id === editId);
          updatedTeams[index] = {
            ...updatedTeams[index],
            teamName: response.data.data.teamName,
            topicName: response.data.data.topicName,
            note: response.data.data.note,
          };
          return updatedTeams;
        });
        closeEditModal();
      } else {
        toast.error(response.data.data, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error updating team:", error);
      toast.error("Error updating team!", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEditClick = (id) => {
    let council = rCouncils.find((item) => item.id === id);
    setFormData(council.councilMembers.map((item) => item.id));
    let reTeachers = council.councilMembers.map((item) => {
      return { ...item, checked: true };
    });

    if (rCouncils[0].councilName === "Wish List") {
      reTeachers.push(...rCouncils[0].councilMembers);
    }
    setRemainTeachers(reTeachers);
    setModal({ edit: true });
    setEditedId(id);
  };

  const onDeleteClick = (id, teamName) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Are you sure to delete council: ${teamName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await authApi.delete(`/councils/delete/${id}`);
          if (response.data.statusCode === 200) {
            toast.success("Delete council successfully!", {
              position: toast.POSITION.TOP_CENTER,
            });
            setCouncils((prev) => {
              const newTeams = prev.filter((team) => team.id !== id);
              const deletedTeam = prev.find((team) => team.id === id);
              if (deletedTeam.councilMembers.length > 0) {
                const wishList = findTeamByName("Wish List");
                if (wishList) {
                  wishList.councilMembers = [...wishList.councilMembers, ...deletedTeam.councilMembers];
                } else {
                  newTeams.unshift({ id: null, councilName: "Wish List", councilMembers: deletedTeam.councilMembers });
                }
              }
              return newTeams;
            });
          } else {
            toast.error(response.data.data, {
              position: toast.POSITION.TOP_CENTER,
            });
          }
        } catch (error) {
          console.error("Error deleting council:", error);
          toast.error("Error deleting council!", {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      }
    });
  };

  const findTeamByName = (name) => {
    return councils.find((team) => team.councilName === name);
  };

  const moveToOtherTeam = async (newTeamId, oldTeamId, memberId) => {
    try {
      const response = await authApi.put("/team-members", {
        newTeamId,
        oldTeamId,
        memberId,
      });
      if (response.data.statusCode === 200) {
        setTeams((prev) => {
          let updatedTeams = [...prev];
          const oldTeamIndex = updatedTeams.findIndex((item) => isEqual(item.id, oldTeamId));
          let member = {};
          if (oldTeamIndex !== -1) {
            member = updatedTeams[oldTeamIndex].members.find((item) => item.id === memberId);
            updatedTeams[oldTeamIndex].members = updatedTeams[oldTeamIndex].members.filter(
              (item) => item.id !== memberId
            );
          }
          const newTeamIndex = updatedTeams.findIndex((item) => item.id === newTeamId);
          if (newTeamIndex !== -1) {
            updatedTeams[newTeamIndex].members = [...updatedTeams[newTeamIndex].members, member];
          } else {
            const wishList = findTeamByName("Wish List");
            if (wishList) {
              wishList.members.push(member);
            } else {
              updatedTeams.unshift({ teamName: "Wish List", members: [member] });
            }
          }
          if (
            oldTeamId === null &&
            updatedTeams[0].teamName === "Wish List" &&
            (!updatedTeams[0].members || updatedTeams[0].members.length === 0)
          ) {
            updatedTeams = updatedTeams.filter((item) => item.teamName !== "Wish List");
          }
          return updatedTeams;
        });
        toast.success("Move member successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        toast.error(response.data.data, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error moving member:", error);
      toast.error("Error moving member!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  const updateTeamLeader = async (teamId, leaderId) => {
    try {
      const response = await authApi.put(`/teams/update-team-leader?teamId=${teamId}&leaderId=${leaderId}`);
      if (response.data.statusCode === 200) {
        setTeams((prev) => {
          const updatedTeams = [...prev];
          const teamIndex = updatedTeams.findIndex((item) => item.id === teamId);
          if (teamIndex !== -1) {
            updatedTeams[teamIndex].leaderId = leaderId;
          }
          return updatedTeams;
        });
        toast.success("Update team leader successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        toast.error(response.data.data, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error updating team leader:", error);
      toast.error("Error updating team leader!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  const closeUpdateTeams = async () => {
    if (!milestone?.id) return;
    Swal.fire({
      title: "Are you sure?",
      text: `If you close the team update option, you won't be able to update any information about the team or its members.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, close it!`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await authApi.put(`/teams/close-update/${milestone?.id}`);
          if (response.data.statusCode === 200) {
            toast.success(`Close update teams successfully!`, {
              position: toast.POSITION.TOP_CENTER,
            });
            let updatedTeams = [...teams];
            updatedTeams.map((item) => {
              item.active = true;
              return item;
            });
            setTeams(updatedTeams);
          } else {
            toast.error(response.data.data, {
              position: toast.POSITION.TOP_CENTER,
            });
          }
        } catch (error) {
          console.error(`Error close teams :`, error);
          toast.error(`Error closing teams!`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      }
    });
  };

  const resetTeams = async () => {
    if (!milestone?.id) return;
    Swal.fire({
      title: "Are you sure?",
      text: `If you reset the teams at this milestone, the system will use the teams from the previous milestone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, reset it!`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await authApi.put(`/teams/reset-teams/${milestone?.id}`);
          console.log("reset teams:", response.data.data);
          if (response.data.statusCode === 200) {
            toast.success(`Reset teams successfully!`, {
              position: toast.POSITION.TOP_CENTER,
            });
            setReset(!reset);
          } else {
            toast.error(response.data.data, {
              position: toast.POSITION.TOP_CENTER,
            });
          }
        } catch (error) {
          console.error(`Error reset teams :`, error);
          toast.error(`Error reset teams!`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      }
    });
  };

  return (
    <>
      <Head title="Council List" />
      <Content>
        <div className="team-list container">
          <BlockTitle page>Council List</BlockTitle>
          <BlockDes>You have total {councils.length} councils</BlockDes>
          <div className="d-flex justify-content-between align-items-end w-100 mb-3 mt-4">
            <div className="d-flex align-items-end" style={{ gap: "20px" }}>
              <div className="form-group mb-0" style={{ minWidth: "150px" }}>
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
                    styles={{ control: (base) => ({ ...base, width: "100%" }) }}
                  />
                )}
              </div>
              <div className="form-group mb-0" style={{ minWidth: "150px" }}>
                <label className="form-label">Subject</label>
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
              <div className="form-group mb-0" style={{ minWidth: "150px" }}>
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
                    styles={{ control: (base) => ({ ...base, width: "100%" }) }}
                  />
                )}
              </div>
              <div className="form-group mb-0 ms-5 text-end" style={{ minWidth: "350px" }}>
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
                      // setFilterForm({ ...filterForm, title: searchText });
                      setCouncils(
                        rCouncils.filter((item) =>
                          item.councilName.toLowerCase().includes(searchText.toLowerCase().trim())
                        )
                      );
                    }}
                  >
                    <Icon className="text-white" name="search"></Icon>
                  </Button>
                </ButtonGroup>
              </div>
            </div>
            <div className="text-end"></div>
          </div>
          <ToastContainer />
          {isFetching.council ? (
            <div className="d-flex justify-content-center align-items-center">
              <Spinner style={{ width: "3rem", height: "3rem" }} />
            </div>
          ) : (
            <>
              {!councils || councils.length === 0 ? (
                <div className="d-flex justify-content-center align-items-center my-5">
                  <Icon style={{ fontSize: "30px" }} name="inbox">
                    No data found!
                  </Icon>
                </div>
              ) : (
                <div className="mt-5">
                  {councils[0]?.councilName === "Wish List" ? (
                    <>
                      <Card
                        key={`te-wish-list`}
                        className="mb-4 shadow border-0"
                        style={{ backgroundColor: "#f8f9fa" }}
                      >
                        <CardHeader
                          className="d-flex justify-content-between align-items-center border-bottom"
                          style={{ backgroundColor: "#e9ecef" }}
                        >
                          <div className="d-flex align-items-center">
                            <Icon name="users" className="me-2" /> {/* Team icon */}
                            <div>
                              <h5 className="mb-1 text-dark">
                                {councils[0].councilName} ({councils[0].councilMembers.length} teachers)
                              </h5>
                              <p className="text-muted">{councils[0].topicName}</p>
                            </div>
                          </div>
                          <div className="text-end">
                            {canEdit && (
                              <Button
                                className="ms-2"
                                color="primary"
                                onClick={() => {
                                  setModal({ add: true });
                                  setRemainTeachers(councils[0].councilMembers);
                                }}
                              >
                                <Icon name="plus" className="me-1"></Icon>
                                <span>Create Council</span>
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardBody>
                          <div
                            className="d-flex justify-content-center align-items-center p-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => toggleCollapse(-1)}
                          >
                            <Button color="link">
                              <Icon name={`chevron-${isOpen === -1 ? "up" : "down"}`}></Icon>
                            </Button>
                          </div>
                          <Collapse className="accordion-body" isOpen={isOpen === -1}>
                            <div className="accordion-inner p-3" style={{ overflow: "auto", height: "300px" }}>
                              {councils[0].councilMembers &&
                                councils[0].councilMembers.map((member) => (
                                  <div key={`mem-w-${member.id}`} className="mb-4 row align-items-center">
                                    <div className="col-md-8">
                                      <h6 className="mb-1 text-dark">{member.fullname}</h6>
                                      <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                                        {member.email}
                                      </p>
                                    </div>
                                    <div className="col-md-4 text-end"></div>
                                  </div>
                                ))}
                            </div>
                          </Collapse>
                        </CardBody>
                      </Card>

                      {councils.slice(1).map((team) => (
                        <Card
                          key={`te-${team?.id}`}
                          className="mb-4 shadow border-0"
                          style={{ backgroundColor: "#f8f9fa" }}
                        >
                          <CardHeader
                            className="d-flex justify-content-between align-items-center border-bottom"
                            style={{ backgroundColor: "#e9ecef" }}
                          >
                            <div className="d-flex align-items-center">
                              <Icon name="users" className="me-2" />
                              <div>
                                <h5 className="mb-1 text-dark">
                                  {team.councilName} ({team.councilMembers.length} teachers)
                                </h5>
                              </div>
                            </div>
                            <div className="text-end">
                              {canEdit && (
                                <>
                                  <Button
                                    size="sm"
                                    color="warning"
                                    className="me-2"
                                    onClick={() => onEditClick(team?.id)}
                                  >
                                    <Icon name="edit"></Icon>
                                  </Button>
                                  {team.canDelete && (
                                    <Button
                                      size="sm"
                                      color="danger"
                                      onClick={() => onDeleteClick(team?.id, team?.councilName)}
                                    >
                                      <Icon name="trash"></Icon>
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </CardHeader>
                          <CardBody>
                            <div
                              className="d-flex justify-content-center align-items-center p-2"
                              style={{ cursor: "pointer" }}
                              onClick={() => toggleCollapse(team.id)}
                            >
                              <Button color="link">
                                <Icon name={`chevron-${isOpen === team?.id ? "up" : "down"}`}></Icon>
                              </Button>
                            </div>
                            <Collapse className="accordion-body" isOpen={isOpen === team?.id}>
                              <div className="accordion-inner p-3">
                                {team.councilMembers &&
                                  team.councilMembers.map((member) => (
                                    <div key={`mem-a-${member.id}`} className="mb-4 row align-items-center">
                                      <div className="col-md-8">
                                        <h6 className="mb-1 text-dark">{member.fullname}</h6>
                                        <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                                          {member.email}
                                        </p>
                                      </div>
                                      <div className="col-md-4 text-end"></div>
                                    </div>
                                  ))}
                              </div>
                            </Collapse>
                          </CardBody>
                        </Card>
                      ))}
                    </>
                  ) : (
                    councils.map((team) => (
                      <Card
                        key={`te-${team?.id}`}
                        className="mb-4 shadow border-0"
                        style={{ backgroundColor: "#f8f9fa" }}
                      >
                        <CardHeader
                          className="d-flex justify-content-between align-items-center border-bottom"
                          style={{ backgroundColor: "#e9ecef" }}
                        >
                          <div className="d-flex align-items-center">
                            <Icon name="users" className="me-2" /> {/* Team icon */}
                            <div>
                              <h5 className="mb-1 text-dark">
                                {team.councilName} ({team.councilMembers.length} teachers)
                              </h5>
                            </div>
                          </div>
                          <div className="text-end">
                            {canEdit && (
                              <>
                                <Button
                                  size="sm"
                                  color="warning"
                                  className="me-2"
                                  onClick={() => onEditClick(team?.id)}
                                >
                                  <Icon name="edit"></Icon>
                                </Button>
                                {team.canDelete && (
                                  <Button
                                    size="sm"
                                    color="danger"
                                    onClick={() => onDeleteClick(team?.id, team?.councilName)}
                                  >
                                    <Icon name="trash"></Icon>
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </CardHeader>
                        <CardBody>
                          <div
                            className="d-flex justify-content-center align-items-center p-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => toggleCollapse(team.id)}
                          >
                            <Button color="link">
                              <Icon name={`chevron-${isOpen === team?.id ? "up" : "down"}`}></Icon>
                            </Button>
                          </div>
                          <Collapse className="accordion-body" isOpen={isOpen === team?.id}>
                            <div className="accordion-inner p-3">
                              {team.councilMembers &&
                                team.councilMembers.map((member) => (
                                  <div key={`mem-b-${member.id}`} className="mb-4 row align-items-center">
                                    <div className="col-md-8">
                                      <h6 className="mb-1 text-dark">{member.fullname}</h6>
                                      <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                                        {member.email}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </Collapse>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </>
          )}
          {modal?.add && (
            <CouncilModal
              modal={modal?.add}
              setModal={setModal}
              modalType="add"
              closeModal={closeModal}
              formData={formData}
              setFormData={setFormData}
              councils={councils}
              setCouncils={setCouncils}
              filterForm={filterForm}
              data={remainTeachers}
              rCouncils={rCouncils}
              setRCouncils={setRCouncils}
            />
          )}
          {modal?.edit && (
            <CouncilModal
              id={editId}
              modal={modal?.edit}
              setModal={setModal}
              modalType="edit"
              closeModal={closeModal}
              formData={formData}
              setFormData={setFormData}
              councils={councils}
              setCouncils={setCouncils}
              filterForm={filterForm}
              data={remainTeachers}
              rCouncils={rCouncils}
              setRCouncils={setRCouncils}
            />
          )}
        </div>
      </Content>
    </>
  );
}
