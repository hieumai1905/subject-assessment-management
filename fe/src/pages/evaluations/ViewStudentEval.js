import React, { useEffect, useState } from "react";
import { Button, Popover, TextareaAutosize } from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import { toast, ToastContainer } from "react-toastify";
import useAuthStore from "../../store/Userstore";
import ViewStudentWorkEval from "./ViewStudentWorkEval";
import { Spinner } from "reactstrap";
import authApi from "../../utils/ApiAuth";
import ViewStudentWorkGrandFinal from "./ViewStudentWorkGrandFinal";

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
};

const headerCellStyle = {
  border: "1px solid #ccc",
  padding: "12px",
  backgroundColor: "#0056b3", // Darker blue
  color: "white",
  textAlign: "center",
  fontWeight: "bold",
};

const cellStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "center",
  fontSize: "14px",
  backgroundColor: "#f0f0f0", // Light gray background for contrast
};

const buttonStyle = {
  padding: "6px 12px",
  backgroundColor: "#0056b3", // Darker blue
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
};

const commentIconStyle = {
  color: "#0056b3", // Darker blue
  cursor: "pointer",
  transition: "color 0.3s ease",
};

const popoverContentStyle = {
  padding: 10,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  width: 500, // Maintain the increased width for readability
};

export const ViewStudentEval = ({ data, classId, loadings }) => {
  const { user } = useAuthStore((state) => state);
  const [studentComment, setStudentComment] = React.useState({
    fullname: "",
    title: "",
  });
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [comment, setComment] = React.useState("");
  const [modal, setModal] = React.useState({
    detail: false,
    grand_final:false
  });
  const [isFetching, setIsFetching] = React.useState({
    reqEval: false,
  });
  const [workEvaluation, setWorkEvaluation] = React.useState([]);
  const [complexity, setComplexity] = React.useState([]);
  const [quality, setQuality] = React.useState([]);
  const [mileTitle, setMileTitle] = React.useState("");

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const onCommentClick = (event, title, sComment) => {
    setAnchorEl(event.currentTarget);
    setStudentComment({
      title: title,
    });
    setComment(sComment || "");
  };

  const fetchWorkEvaluations = async (milestoneId, milestone) => {
    if (!classId || !milestoneId) return;
    try {
      setIsFetching({ ...isFetching, [`reqEval-${milestoneId}`]: true });
      const response = await authApi.post("/evaluation/search-requirement-evaluation", {
        classId: classId,
        milestoneId: milestoneId,
        teamId: null,
      });
      console.log("work evaluations:", response.data.data);
      if (response.data.statusCode === 200) {
        let workEval = response.data.data?.workEvaluationResponses;
        if (workEval && workEval.length > 0) {
          workEval = workEval.filter(
            (item) =>
              item.studentId === user.id &&
              ((item.requirementEval && item.requirementEval.grade) ||
                (item.updateRequirementEval && item.updateRequirementEval.grade))
          );
          setWorkEvaluation(workEval);
        } else{
          setWorkEvaluation([]);
        }
        setComplexity(response.data.data?.complexities);
        setQuality(response.data.data?.qualities);
      } else {
        toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi tìm kiếm đánh giá yêu cầu", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetching({ ...isFetching, [`reqEval-${milestoneId}`]: false });
      setModal({ detail: true });
      setMileTitle(milestone);
    }
  };

  const fetchWorkEvaluationsForFinal = async (teamId, sessionId, milestoneId, milestone) => {
    if (!teamId || !sessionId || !milestoneId) {
      return;
    }
    try {
      setIsFetching({ ...isFetching, [`reqEval-${milestoneId}`]: true });
      const response = await authApi.post("/evaluation/search-requirement-eval-for-grand-final", {
        teamId: teamId,
        sessionId: sessionId,
      });
      console.log("work evaluations:", response.data.data);
      if (response.data.statusCode === 200) {
        let workEval = response.data.data?.workEvaluationResponses;
        if (workEval && workEval.length > 0) {
          // workEval = workEval.filter(
          //   (item) =>
          //     item.studentId === user.id &&
          //     ((item.requirementEval && item.requirementEval.grade) ||
          //       (item.updateRequirementEval && item.updateRequirementEval.grade))
          // );
          setWorkEvaluation(workEval);
        } else{
          setWorkEvaluation([]);
        }
      } else {
        toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi tìm kiếm đánh giá yêu cầu", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsFetching({ ...isFetching, [`reqEval-${milestoneId}`]: false });
      setModal({ grand_final: true });
      setMileTitle(milestone);
    }
  };

  return (
    <div>
      <ToastContainer />
      {loadings ? (
        <div className="d-flex justify-content-center" style={{ marginTop: "50px" }}>
          <Spinner style={{ width: "3rem", height: "3rem" }} />
        </div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headerCellStyle}>Cột mốc</th>
              <th style={headerCellStyle}>Tiêu chí</th>
              <th style={headerCellStyle}>Điểm</th>
              <th style={headerCellStyle}>Nhận xét</th>
              <th style={headerCellStyle}>Tổng LOC</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((item) => {
                const { title, weight, evalGrade, comment, totalLOC, criteriaList } = item;
                const milestone = `${title} (${weight}%)`;

                if (criteriaList && criteriaList.length > 0) {
                  const weight = (item.weight * criteriaList[0].weight) / 100;
                  return (
                    <React.Fragment key={item.id}>
                      <tr>
                        <td rowSpan={criteriaList.length + 1} style={cellStyle}>
                          {milestone}
                        </td>
                        <td style={cellStyle}>
                          {criteriaList[0].title} ({weight.toFixed(2)}%)
                        </td>
                        <td style={cellStyle}>{criteriaList[0].evalGrade}</td>
                        <td style={cellStyle}>
                          <CommentIcon
                            style={commentIconStyle}
                            onClick={(event) => onCommentClick(event, criteriaList[0].title, criteriaList[0].comment)}
                          />
                        </td>
                        <td rowSpan={criteriaList.length + 1} style={cellStyle}>
                          {isFetching[`reqEval-${item.id}`] ? (
                            <Button disabled color="primary">
                              <Spinner size="sm" />
                              <span> Đang tải... </span>
                            </Button>
                          ) : (
                            <button
                              style={buttonStyle}
                              onClick={() => {
                                if (item?.teamId && item?.sessionId) {
                                  fetchWorkEvaluationsForFinal(item.teamId, item.sessionId, item.id, milestone);
                                } else {
                                  fetchWorkEvaluations(item.id, milestone);
                                }
                              }}
                            >
                              {totalLOC || 0} - Xem chi tiết
                            </button>
                          )}
                        </td>
                      </tr>
                      {criteriaList.slice(1).map((criteria, idx) => (
                        <tr key={idx}>
                          <td style={cellStyle}>
                            {criteria.title} ({((item.weight * criteria.weight) / 100).toFixed(2)}%)
                          </td>
                          <td style={cellStyle}>{criteria.evalGrade}</td>
                          <td style={cellStyle}>
                            <CommentIcon
                              style={commentIconStyle}
                              onClick={(event) => onCommentClick(event, criteria.title, criteria.comment)}
                            />
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td style={cellStyle}>Tổng ({item.weight}%)</td>
                        <td style={cellStyle}>{evalGrade}</td>
                        <td style={cellStyle}>
                          <CommentIcon
                            style={commentIconStyle}
                            onClick={(event) => onCommentClick(event, milestone, comment)}
                          />
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                } else {
                  return (
                    <tr key={item.id}>
                      <td style={cellStyle}>{milestone}</td>
                      <td style={cellStyle}>Total ({item.weight}%)</td>
                      <td style={cellStyle}>{evalGrade}</td>
                      <td style={cellStyle}>
                        {item.status ? (
                          <span className={`text-${item.status === "Pass" ? "success" : "danger"} fw-bold`}>
                            {item.status}
                          </span>
                        ) : (
                          <CommentIcon
                            style={commentIconStyle}
                            onClick={(event) => onCommentClick(event, milestone, comment)}
                          />
                        )}
                      </td>
                      <td style={cellStyle}>
                        {isFetching[`reqEval-${item.id}`] ? (
                          <Button disabled color="primary" variant="contained">
                            <Spinner size="sm" />
                            <span> Đang tải... </span>
                          </Button>
                        ) : (
                          !item.status && (
                            <button
                              style={buttonStyle}
                              onClick={() => {
                                if (item?.teamId && item?.sessionId) {
                                  fetchWorkEvaluationsForFinal(item.teamId, item.sessionId, item.id, milestone);
                                } else {
                                  fetchWorkEvaluations(item.id, milestone);
                                }
                              }}
                            >
                              {totalLOC || 0} - Xem chi tiết
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                }
              })
            ) : (
              <tr>
                <td colSpan="5" style={cellStyle}>
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
      >
        <div style={popoverContentStyle}>
          <p className="fw-bold">Nhận xét trong {studentComment?.title}</p>
          <TextareaAutosize
            readOnly
            minRows={3}
            maxRows={5}
            placeholder="nhận xét"
            style={{ width: "100%", overflow: "auto" }}
            value={comment}
          />
        </div>
      </Popover>
      {modal.detail && (
        <ViewStudentWorkEval
          modal={modal}
          setModal={setModal}
          evaluations={workEvaluation}
          complexities={complexity}
          qualities={quality}
          mileTitle={mileTitle}
        />
      )}

      {modal.grand_final && (
        <ViewStudentWorkGrandFinal
          modal={modal}
          setModal={setModal}
          evaluations={workEvaluation}
          complexities={complexity}
          qualities={quality}
          mileTitle={mileTitle}
        />
      )}
    </div>
  );
};
