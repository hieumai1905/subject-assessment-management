import React, { useState } from "react";
import { Badge, Collapse, Progress } from "reactstrap";
import { PreviewCard } from "../../components/preview/Preview";
import Icon from "../../components/icon/Icon";
import { Button } from "../../components/Component";
import { formatDate } from "../../utils/Utils";
import { Link } from "react-router-dom";
import authApi from "../../utils/ApiAuth";
import { toast, ToastContainer } from "react-toastify";
import useAuthStore from "../../store/Userstore";
import { canModify, canModifyMilestone } from "../../utils/CheckPermissions";
import Swal from "sweetalert2";

const MilestonesAccordion = ({ milestones, setMilestones, teacherId, onEditClick, className, variation, ...props }) => {
  const [isOpen, setIsOpen] = useState("0");
  const [teamsProgression, setTeamsProgression] = useState([]);
  const { role } = useAuthStore((state) => state);
  const { user } = useAuthStore((state) => state);

  const toggleCollapse = (param) => {
    if (param.milestone?.id === isOpen) {
      setIsOpen("0");
    } else {
      setIsOpen(param.milestone?.id);
      fetchTeamsProgression(param.milestone?.id);
    }
  };

  const fetchTeamsProgression = async (milestoneId) => {
    try {
      const response = await authApi.get(`/teams/get-teams-progression-by-milestone/${milestoneId}`);
      console.log("teams progression: ", response.data.data);
      if (response.data.statusCode === 200) {
        setTeamsProgression(response.data.data);
      } else {
        toast.error(response.data.data, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch {
      toast.error("Error while getting teams progression!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  const getColorProgression = (progress) => {
    if (progress === 0) return "gray";
    if (progress <= 50) {
      return "warning";
    } else if (progress <= 80) {
      return "primary";
    } else return "success";
  };

  const onChangeStatusClick = async (milestone) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Are you sure to ${milestone?.active ? "close" : "open"} ${milestone?.title}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${milestone?.active ? "close" : "open"} it!`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await authApi.put(
            `/milestone/change-status?id=${milestone?.id}&active=${!milestone?.active}`
          );
          if (response.data.statusCode === 200) {
            toast.success(`${milestone?.active ? "Close" : "Open"} ${milestone?.title} successfully!`, {
              position: toast.POSITION.TOP_CENTER,
            });
            let updatedMilestone = [...milestones];
            let index = updatedMilestone.findIndex((item) => item.id === milestone?.id);
            if (index !== -1) {
              updatedMilestone[index].active = !milestone?.active;
              setMilestones(updatedMilestone);
            }
          } else {
            toast.error(response.data.data, {
              position: toast.POSITION.TOP_CENTER,
            });
          }
        } catch (error) {
          console.error(`Error ${milestone?.active ? "Close" : "Open"} ${milestone?.title} :`, error);
          toast.error(`Error ${milestone?.active ? "Closing" : "Opening"} ${milestone?.title}!`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      }
    });
  };

  return (
    <div className="p-3">
      <ToastContainer />
      {milestones.length > 0 ? (
        milestones.map((milestone) => (
          <PreviewCard key={milestone?.id} className="mb-4 shadow-sm">
            <div className="border-bottom p-3">
              <div className="row mb-2 align-items-center">
                <div className="col-md-6">
                  <h3 className="text-dark">{milestone?.title}</h3>
                </div>
                <div className="col-md-6 text-end">
                  <Link
                    to={`/milestone-list/milestone-details/` + milestone?.id}
                    className="text-primary me-3 d-inline-flex align-items-center"
                  >
                    <Icon name="eye" className="me-1" />
                    View Details
                  </Link>
                  {canModifyMilestone(user, role, teacherId) && (
                    <Button
                      color="link"
                      className="text-warning d-inline-flex align-items-center"
                      onClick={() => onChangeStatusClick(milestone)}
                    >
                      <Icon name={`${milestone?.active ? "lock-alt" : "unlock"}`} className="me-1" />
                      {milestone?.active ? "Close" : "Open"}
                    </Button>
                  )}
                </div>
              </div>
              <div className="text-muted mb-3">
                <span className="ms-1">
                  <Badge className="badge-dot" color={milestone?.active ? "success" : "danger"}>
                    {milestone?.active ? "Open" : "Close"}
                  </Badge>
                </span>
              </div>
              <div className="mt-3" style={{ cursor: "pointer" }} onClick={() => toggleCollapse({ milestone })}>
                <Icon style={{ fontSize: "20px" }} name={`chevron-${isOpen === milestone?.id ? "up" : "down"}`}></Icon>
              </div>
            </div>
            <Collapse className="accordion-body" isOpen={isOpen === milestone?.id ? true : false}>
              <div className="accordion-inner p-3">
                <h5 className="mb-3">Progress Requirements of Teams:</h5>
                {teamsProgression.map((te, index) => (
                  <div key={te.teamName} className={`row mb-4 ${index % 2 === 0 ? "bg-light" : ""}`}>
                    <div className="col-md-2 font-weight-bold">{te.teamName}</div>
                    <div className="col-md-10">
                      {["Waiting for approval", "To do", "Doing", "Submitted", "Evaluated"].map((stage, index) => (
                        <div className="row mb-2 align-items-center" key={stage}>
                          <div className="col-md-3 d-flex align-items-center">
                            <Icon name={getStageIcon(stage)} className="me-2 text-info" />
                            <span>{stage}:</span>
                          </div>
                          <div className="col-md-9">
                            <Progress
                              color={getColorProgression(te.completionProgress[index])}
                              className="progress-lg"
                              value={te.completionProgress[index]}
                              striped
                              animated
                            >
                              {te.completionProgress[index]}%
                            </Progress>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Collapse>
          </PreviewCard>
        ))
      ) : (
        <div className="d-flex justify-content-center align-items-center my-5">
          <Icon style={{ fontSize: "30px" }} name="inbox">
            No data found!
          </Icon>
        </div>
      )}
    </div>
  );
};

const getStageIcon = (stage) => {
  switch (stage) {
    case "Waiting for approval":
      return "clock"; // icon for Waiting for approval
    case "To do":
      return "list"; // icon for To do
    case "Doing":
      return "book"; // ensure this is the icon for Doing
    case "Submitted":
      return "check-circle"; // icon for Submitted
    case "Evaluated":
      return "star"; // icon for Evaluated
    default:
      return "circle"; // default icon
  }
};

export default MilestonesAccordion;
