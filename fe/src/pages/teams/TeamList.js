import React, { useState } from "react";
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
} from "reactstrap";
import { Icon, PreviewCard } from "../../components/Component";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import useAuthStore from "../../store/Userstore";
import { canModifyMilestone } from "../../utils/CheckPermissions";
import FormModal from "./FormModal";
import { isEqual } from "../../utils/Utils";

export default function TeamList({ teams, milestone, setTeams, modal, setModal, isFetching, reset, setReset }) {
  const { role } = useAuthStore((state) => state);
  const { user } = useAuthStore((state) => state);
  const [editId, setEditedId] = useState();
  const [isOpen, setIsOpen] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    teamName: "",
    topicName: "",
    note: "",
    active: "Active",
  });
  const [editFormData, setEditFormData] = useState({
    teamName: "",
    topicName: "",
    note: "",
    active: "Active",
  });

  const toggleCollapse = (teamId) => {
    setIsOpen((prev) => (teamId === prev ? "0" : teamId));
  };

  const resetForm = () => {
    setFormData({
      teamName: "",
      topicName: "",
      note: "",
      active: "Active",
    });
  };

  const closeModal = () => {
    setModal({ addTeam: false });
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
    const team = teams.find((item) => item.id === id);
    if (team) {
      setEditFormData({
        teamName: team.teamName,
        topicName: team.topicName,
        note: team.note || "",
        active: true,
      });
      setModal({ editTeam: true });
      setEditedId(id);
    }
  };

  const onDeleteClick = (id, teamName) => {
    Swal.fire({
      title: "Are you sure?",
      text: `If you delete ${teamName}, all related information such as members and requirements will be removed!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await authApi.delete(`/teams/${id}`);
          if (response.data.statusCode === 200) {
            toast.success("Delete team successfully!", {
              position: toast.POSITION.TOP_CENTER,
            });
            setTeams((prev) => {
              const newTeams = prev.filter((team) => team.id !== id);
              const deletedTeam = prev.find((team) => team.id === id);
              if (deletedTeam.members.length > 0) {
                const wishList = findTeamByName("Wish List");
                if (wishList) {
                  wishList.members = [...wishList.members, ...deletedTeam.members];
                } else {
                  newTeams.unshift({ id: null, teamName: "Wish List", members: deletedTeam.members });
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
          console.error("Error deleting team:", error);
          toast.error("Error deleting team!", {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      }
    });
  };

  const findTeamByName = (name) => {
    return teams.find((team) => team.teamName === name);
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
    <div className="team-list container">
      {canModifyMilestone(user, role, milestone?.teacherId) &&
        milestone?.active &&
        teams &&
        teams.length > 0 &&
        !teams[0]?.active && (
          <div className="text-end mb-4">
            <Button
              className="ms-2"
              color="primary"
              onClick={() => {
                closeUpdateTeams();
              }}
            >
              <Icon name="lock" className="me-1"></Icon>
              <span>Close Update</span>
            </Button>
            {teams[0]?.teamOfCurrentMilestone && (
              <Button
                className="ms-2"
                color="primary"
                onClick={() => {
                  resetTeams();
                }}
              >
                <Icon name="undo" className="me-1"></Icon>
                <span>Reset</span>
              </Button>
            )}
            <Button className="ms-2" color="primary" onClick={() => setModal({ import: true })}>
              <Icon name="file-xls" className="me-1"></Icon>
              <span>Import</span>
            </Button>
          </div>
        )}
      <ToastContainer />
      {isFetching ? (
        <div className="d-flex justify-content-center align-items-center">
          <Spinner style={{ width: "3rem", height: "3rem" }} />
        </div>
      ) : (
        <>
          {!teams || teams.length === 0 ? (
            <div className="d-flex justify-content-center align-items-center my-5">
              <Icon style={{ fontSize: "30px" }} name="inbox">
                No data found!
              </Icon>
            </div>
          ) : (
            <>
              {teams[0]?.teamName === "Wish List" ? (
                <>
                  <Card key={`te-wish-list`} className="mb-4 shadow border-0" style={{ backgroundColor: "#f8f9fa" }}>
                    <CardHeader
                      className="d-flex justify-content-between align-items-center border-bottom"
                      style={{ backgroundColor: "#e9ecef" }}
                    >
                      <div className="d-flex align-items-center">
                        <Icon name="users" className="me-2" /> {/* Team icon */}
                        <div>
                          <h5 className="mb-1 text-dark">
                            {teams[0].teamName} ({teams[0].members.length} students)
                          </h5>
                          <p className="text-muted">{teams[0].topicName}</p>
                        </div>
                      </div>
                      <div className="text-end">
                        {milestone?.active && canModifyMilestone(user, role, milestone?.teacherId) && (
                          <Button className="ms-2" color="primary" onClick={() => setModal({ addTeam: true })}>
                            <Icon name="plus" className="me-1"></Icon>
                            <span>Create Team</span>
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
                        <div className="accordion-inner p-3">
                          {teams[0].members &&
                            teams[0].members.map((member) => (
                              <div key={`mem-w-${member.id}`} className="mb-4 row align-items-center">
                                <div className="col-md-8">
                                  <h6 className="mb-1 text-dark">
                                    {member.fullname}
                                    {teams[0]?.leaderId === member?.id ? (
                                      <Icon className="ms-2 text-primary" title="Leader" name="star-fill"></Icon>
                                    ) : null}
                                  </h6>
                                  <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                                    {member.email}
                                  </p>
                                </div>
                                {canModifyMilestone(user, role, milestone?.teacherId) && milestone.active && (
                                  <div className="col-md-4 text-end">
                                    <>
                                      <UncontrolledDropdown>
                                        <DropdownToggle tag="a" className="btn btn-lg btn-icon text-soft">
                                          <Icon name="repeat" className="text-primary" title="Change team"></Icon>
                                        </DropdownToggle>
                                        <DropdownMenu end>
                                          <ul className="link-list-opt no-bdr">
                                            {teams
                                              .filter((item) => item.teamName !== "Wish List")
                                              .map((team) => (
                                                <li key={`move-w-${team.teamName}`}>
                                                  <DropdownItem
                                                    tag="a"
                                                    href="#move"
                                                    onClick={(ev) => {
                                                      ev.preventDefault();
                                                      moveToOtherTeam(team.id, null, member.id);
                                                    }}
                                                  >
                                                    <span>{team.teamName}</span>
                                                  </DropdownItem>
                                                </li>
                                              ))}
                                          </ul>
                                        </DropdownMenu>
                                      </UncontrolledDropdown>
                                    </>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </Collapse>
                    </CardBody>
                  </Card>

                  {teams.slice(1).map((team) => (
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
                              {team.teamName} ({team.members.length} students)
                            </h5>
                            <p className="text-muted">{team.topicName}</p>
                          </div>
                        </div>
                        <div className="text-end">
                          {!team.active &&
                          milestone?.active &&
                          team?.teamOfCurrentMilestone &&
                          canModifyMilestone(user, role, milestone?.teacherId) ? (
                            <>
                              <Button size="sm" color="warning" className="me-2" onClick={() => onEditClick(team?.id)}>
                                <Icon name="edit"></Icon>
                              </Button>
                              <Button size="sm" color="danger" onClick={() => onDeleteClick(team?.id, team?.teamName)}>
                                <Icon name="trash"></Icon>
                              </Button>
                            </>
                          ) : null}
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
                            {team.members &&
                              team.members.map((member) => (
                                <div key={`mem-a-${member.id}`} className="mb-4 row align-items-center">
                                  <div className="col-md-8">
                                    <h6 className="mb-1 text-dark">
                                      {member.fullname}
                                      {team?.leaderId === member?.id ? (
                                        <Icon className="ms-2 text-primary" title="Leader" name="star-fill"></Icon>
                                      ) : null}
                                    </h6>
                                    <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                                      {member.email}
                                    </p>
                                  </div>
                                  {(user?.id === team?.leaderId || canModifyMilestone(user, role, milestone?.teacherId)) && (
                                    <div className="col-md-4 text-end">
                                      {team?.leaderId !== member?.id ? (
                                        <>
                                          <Button
                                            size="sm"
                                            color="primary"
                                            className="me-2"
                                            onClick={() => updateTeamLeader(team.id, member.id)}
                                          >
                                            <Icon name="star"></Icon>
                                          </Button>
                                          {!team?.active && team?.teamOfCurrentMilestone && milestone.active && (
                                            <UncontrolledDropdown>
                                              <DropdownToggle tag="a" className="btn btn-lg btn-icon text-soft">
                                                <Icon name="repeat" className="text-primary" title="Change team"></Icon>
                                              </DropdownToggle>
                                              <DropdownMenu end>
                                                <ul className="link-list-opt no-bdr">
                                                  {!findTeamByName("Wish List") ? (
                                                    <li key={`move-wish-list`}>
                                                      <DropdownItem
                                                        tag="a"
                                                        href="#move"
                                                        onClick={(ev) => {
                                                          ev.preventDefault();
                                                          moveToOtherTeam(null, team.id, member.id);
                                                        }}
                                                      >
                                                        <span>Wish List</span>
                                                      </DropdownItem>
                                                    </li>
                                                  ) : null}
                                                  {teams.map((te) =>
                                                    te.teamName !== team.teamName ? (
                                                      <li key={`move-${te.teamName}`}>
                                                        <DropdownItem
                                                          tag="a"
                                                          href="#move"
                                                          onClick={(ev) => {
                                                            ev.preventDefault();
                                                            moveToOtherTeam(te.id, team.id, member.id);
                                                          }}
                                                        >
                                                          <span>{te.teamName}</span>
                                                        </DropdownItem>
                                                      </li>
                                                    ) : null
                                                  )}
                                                </ul>
                                              </DropdownMenu>
                                            </UncontrolledDropdown>
                                          )}
                                        </>
                                      ) : null}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </Collapse>
                      </CardBody>
                    </Card>
                  ))}
                </>
              ) : (
                teams.map((team) => (
                  <Card key={`te-${team?.id}`} className="mb-4 shadow border-0" style={{ backgroundColor: "#f8f9fa" }}>
                    <CardHeader
                      className="d-flex justify-content-between align-items-center border-bottom"
                      style={{ backgroundColor: "#e9ecef" }}
                    >
                      <div className="d-flex align-items-center">
                        <Icon name="users" className="me-2" /> {/* Team icon */}
                        <div>
                          <h5 className="mb-1 text-dark">
                            {team.teamName} ({team.members.length} students)
                          </h5>
                          <p className="text-muted">{team.topicName}</p>
                        </div>
                      </div>
                      <div className="text-end">
                        {team.teamName !== "Wish List" &&
                        !team.active &&
                        milestone?.active &&
                        team?.teamOfCurrentMilestone &&
                        canModifyMilestone(user, role, milestone?.teacherId) ? (
                          <>
                            <Button size="sm" color="warning" className="me-2" onClick={() => onEditClick(team?.id)}>
                              <Icon name="edit"></Icon>
                            </Button>
                            <Button size="sm" color="danger" onClick={() => onDeleteClick(team?.id, team?.teamName)}>
                              <Icon name="trash"></Icon>
                            </Button>
                          </>
                        ) : null}
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
                          {team.members &&
                            team.members.map((member) => (
                              <div key={`mem-b-${member.id}`} className="mb-4 row align-items-center">
                                <div className="col-md-8">
                                  <h6 className="mb-1 text-dark">
                                    {member.fullname}
                                    {team?.leaderId === member?.id ? (
                                      <Icon className="ms-2 text-primary" title="Leader" name="star-fill"></Icon>
                                    ) : null}
                                  </h6>
                                  <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                                    {member.email}
                                  </p>
                                </div>
                                {(user?.id === team?.leaderId || canModifyMilestone(user, role, milestone?.teacherId)) && (
                                  <div className="col-md-4 text-end">
                                    {team?.leaderId !== member?.id && team.teamName !== "Wish List" ? (
                                      <div>
                                        <Button
                                          size="sm"
                                          color="primary"
                                          className="me-2"
                                          onClick={() => updateTeamLeader(team.id, member.id)}
                                        >
                                          <Icon name="star"></Icon>
                                        </Button>
                                        {!team.active && team?.teamOfCurrentMilestone  && milestone.active && canModifyMilestone(user, role, milestone?.teacherId) && (
                                          <>
                                            <UncontrolledDropdown>
                                              <DropdownToggle tag="a" className="btn btn-lg btn-icon text-soft">
                                                <Icon name="repeat" className="text-primary" title="Change team"></Icon>
                                              </DropdownToggle>
                                              <DropdownMenu end>
                                                <ul className="link-list-opt no-bdr">
                                                  {!findTeamByName("Wish List") ? (
                                                    <li key={`move-wish-list`}>
                                                      <DropdownItem
                                                        tag="a"
                                                        href="#move"
                                                        onClick={(ev) => {
                                                          ev.preventDefault();
                                                          moveToOtherTeam(null, team.id, member.id);
                                                        }}
                                                      >
                                                        <span>Wish List</span>
                                                      </DropdownItem>
                                                    </li>
                                                  ) : null}
                                                  {teams.map((te) =>
                                                    te.teamName !== team.teamName ? (
                                                      <li key={`move-${te.teamName}`}>
                                                        <DropdownItem
                                                          tag="a"
                                                          href="#move"
                                                          onClick={(ev) => {
                                                            ev.preventDefault();
                                                            moveToOtherTeam(te.id, team.id, member.id);
                                                          }}
                                                        >
                                                          <span>{te.teamName}</span>
                                                        </DropdownItem>
                                                      </li>
                                                    ) : null
                                                  )}
                                                </ul>
                                              </DropdownMenu>
                                            </UncontrolledDropdown>
                                          </>
                                        )}
                                      </div>
                                    ) : null}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </Collapse>
                    </CardBody>
                  </Card>
                ))
              )}
            </>
          )}
        </>
      )}
      <FormModal
        modal={modal.addTeam}
        modalType="add"
        formData={formData}
        setFormData={setFormData}
        closeModal={closeModal}
        onSubmit={onFormSubmit}
        isSubmitting={isSubmitting}
      />
      <FormModal
        modal={modal.editTeam}
        modalType="edit"
        formData={editFormData}
        setFormData={setEditFormData}
        closeModal={closeEditModal}
        onSubmit={onEditSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
