import React, { useEffect, useState } from "react";
import { Icon, Button, Col, RSelect } from "../../components/Component";
import { Modal, ModalBody, Form, Row, PopoverBody } from "reactstrap";
import { useForm } from "react-hook-form";
import { formatDate, isNullOrEmpty, shortenString } from "../../utils/Utils";
import { Popover } from "@mui/material";

const FinalEvalModal = ({
  id,
  setId,
  modal,
  setModal,
  evaluation,
  complexities,
  qualities,
  evaluations,
  setEvaluations,
  changedFields,
  setChangedFields,
  role,
  canEdit,
}) => {
  const [formData, setFormData] = useState({});
  const [complexityOptions, setComplexityOptions] = useState([]);
  const [qualityOptions, setQualityOptions] = useState([]);
  const [selectedComplexity, setSelectedComplexity] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [LOC, setLOC] = useState("");
  const [comment, setComment] = useState("");
  const [lastEval, setLastEval] = useState({
    LOC: 0,
    complexity: "",
    quality: "",
    comment: "",
  });

  const closeModal = () => {
    setModal({ evaluate: false });
    setFormData({});
    setId();
  };

  const onSubmit = () => {
    let updateChanges = [...changedFields];
    let updateEval = [...evaluations];
    let index = updateChanges.findIndex((item) => item.reqId === id && item.isUpdateEval === true);
    let evalIdx = updateEval.findIndex((item) => item.id === id);
    updateEval[evalIdx] = {
      ...updateEval[evalIdx],
      updateRequirementEval: {
        complexityId: selectedComplexity?.value,
        qualityId: selectedQuality?.value,
        comment: comment,
        grade: LOC,
      },
    };

    if (index !== -1) {
      updateChanges[index] = {
        ...updateChanges[index],
        complexityId: selectedComplexity?.value,
        qualityId: selectedQuality?.value,
        comment: comment,
        grade: LOC,
      };
    } else {
      let newChange = {
        reqId: id,
        complexityId: selectedComplexity?.value,
        qualityId: selectedQuality?.value,
        comment: comment,
        grade: LOC,
        isUpdateEval: true,
      };
      updateChanges.push(newChange);
    }
    setEvaluations(updateEval);
    setChangedFields(updateChanges);
    closeModal();
  };

  useEffect(() => {
    if (evaluation) {
      setFormData(evaluation);
      if (evaluation?.updateRequirementEval && evaluation?.updateRequirementEval?.grade) {
        setLOC(evaluation?.updateRequirementEval?.grade);
      } else {
        // setLOC("");
        if (qualities && complexities && qualities.length > 0 && complexities.length > 0) {
          evaluateLoc(complexities[0]?.id, qualities[0]?.id);
        } else {
          setLOC("");
        }
      }
      if (evaluation?.updateRequirementEval && evaluation?.updateRequirementEval?.comment) {
        setComment(evaluation?.updateRequirementEval?.comment);
      } else {
        setComment("");
      }
      if (evaluation?.updateRequirementEval && complexities) {
        let complexity = complexities.find((item) => item.id === evaluation?.updateRequirementEval?.complexityId);
        if (complexity) {
          setSelectedComplexity({
            value: complexity.id,
            label: complexity.name,
          });
        }
      } else {
        // setSelectedComplexity(null);
        if (complexities && complexities.length > 0) {
          setSelectedComplexity({
            value: complexities[0]?.id,
            label: complexities[0]?.name,
          });
        } else {
          setSelectedComplexity(null);
        }
      }
      console.log("t", evaluation?.requirementEval);
      if (evaluation?.updateRequirementEval && qualities) {
        let quality = qualities.find((item) => item.id === evaluation?.updateRequirementEval?.qualityId);
        if (quality) {
          setSelectedQuality({
            value: quality.id,
            label: quality.name,
          });
        }
      } else {
        // setSelectedQuality(null);
        if (qualities && qualities.length > 0) {
          setSelectedQuality({
            value: qualities[0]?.id,
            label: qualities[0]?.name,
          });
        } else {
          setSelectedQuality(null);
        }
      }
      let lastLOC = 0,
        lastComment = "",
        lastComplexity = "",
        lastQuality = "";
      if (evaluation?.requirementEval && evaluation?.requirementEval?.grade) {
        lastLOC = evaluation?.requirementEval?.grade;
      } else {
        lastLOC = 0;
      }
      if (evaluation?.requirementEval && evaluation?.requirementEval?.comment) {
        lastComment = evaluation?.requirementEval?.comment;
      } else {
        lastComment = "N/A";
      }
      if (evaluation?.requirementEval && complexities) {
        let lComplexity = complexities.find((item) => item.id === evaluation?.requirementEval?.complexityId);
        if (lComplexity) {
          lastComplexity = lComplexity.name;
        }
      } else {
        lastComplexity = "N/A";
      }
      if (evaluation?.requirementEval && qualities) {
        let lQuality = qualities.find((item) => item.id === evaluation?.requirementEval?.qualityId);
        if (lQuality) {
          lastQuality = lQuality.name;
        }
      } else {
        lastQuality = "N/A";
      }
      setLastEval({
        LOC: lastLOC,
        comment: lastComment,
        complexity: lastComplexity,
        quality: lastQuality,
      });
    }
  }, [evaluation]);

  useEffect(() => {
    if (complexities && complexities.length > 0) {
      let complexityOpts = complexities.map((item) => ({
        value: item.id,
        label: item.name,
      }));
      setComplexityOptions(complexityOpts);
    }
  }, [complexities]);

  useEffect(() => {
    if (qualities && qualities.length > 0) {
      setQualityOptions(
        qualities.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    }
  }, [qualities]);

  const evaluateLoc = (complexityId, qualityId) => {
    let weight = qualities?.find((item) => item.id == qualityId)?.extValue;
    let loc = complexities?.find((item) => item.id == complexityId)?.extValue;

    if (!weight || !loc) return false;

    weight = parseInt(weight);
    loc = parseInt(loc);
    let evalLOC = parseFloat(((weight * loc) / 100).toFixed(0));
    setLOC(evalLOC);
  };

  const {
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [popoverOpen, setPopoverOpen] = useState(false);
  const togglePopover = () => setPopoverOpen(!popoverOpen);

  return (
    <Modal
      isOpen={modal}
      toggle={() => closeModal()}
      className="modal-dialog-centered"
      size="xl"
      aria-labelledby="finalEvaluationModal"
    >
      <ModalBody>
        <a
          href="#cancel"
          onClick={(ev) => {
            ev.preventDefault();
            closeModal();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-4" style={{ height: "663px" }}>
          <h3 className="title mb-2 text-center">Đánh giá hội đồng</h3>
          <Row className="student-info">
            <Col md="4">
              <div>
                <strong>Sinh viên:</strong> {formData?.studentFullname || "N/A"}
              </div>
            </Col>
            <Col md="4">
              <div>
                <strong>Nhóm:</strong> {formData?.teamTeamName || "N/A"}
              </div>
            </Col>
          </Row>
          <Row className="evaluation-details mb-1">
            <Col md="6">
              <div>
                <strong>Yêu cầu:</strong> {isNullOrEmpty(formData.reqTitle) ? "N/A" : formData.reqTitle}
              </div>
            </Col>
            <Col md="6">
              <div>
                {/* <strong>Note:</strong> {isNullOrEmpty(formData.note) ? "Note is not available" : formData.note} */}
              </div>
            </Col>
            <Col md="4">
              <div>
                <strong>Độ khó lần 1:</strong> {lastEval?.complexity}
              </div>
            </Col>
            <Col md="4">
              <div>
                <strong>Mức độ hoàn thiện lần 1:</strong> {lastEval?.quality}
              </div>
            </Col>
            <Col md="4">
              <div>
                <strong>LOC lần 1:</strong> {lastEval?.LOC}
              </div>
            </Col>
            <Col md="12">
              <div className="form-group">
                <strong>Nhận xét</strong>
                <textarea
                  id="lcomment"
                  disabled={true}
                  value={lastEval?.comment}
                  placeholder="nhận xét"
                  className="form-control form-control-xl no-resize"
                  aria-label="Comment"
                />
              </div>
            </Col>
            <div>
              <Button id="Popover1" type="button" className="text-primary" onClick={togglePopover}>
                Xem thông tin cập nhật theo dõi
              </Button>

              <Popover
                open={popoverOpen}
                anchorEl={document.getElementById("Popover1")}
                onClose={togglePopover}
                anchorOrigin={{
                  vertical: "center",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "center",
                  horizontal: "left",
                }}
                PaperProps={{
                  style: {
                    maxWidth: "600px",
                    overflowX: "auto",
                  },
                }}
              >
                <PopoverBody>
                  {isNullOrEmpty(formData?.updateTrackings) || formData?.updateTrackings?.length === 0 ? (
                    <div className="p-3">Không có dữ liệu</div>
                  ) : (
                    <div style={{ width: "600px", height: "200px", overflowY: "auto", overflowX: "hidden" }}>
                      {formData?.updateTrackings?.map((item, index) => {
                        return (
                          <div key={index} className="p-3 mb-1">
                            <strong>{formatDate(item.updatedDate)}</strong>
                            <p className="ms-3" style={{ whiteSpace: "pre-wrap" }}>
                              {item.note}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </PopoverBody>
              </Popover>
            </div>
          </Row>
          <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
            <Col md="4">
              <div className="form-group">
                <label htmlFor="complexity" className="form-label">
                  Độ khó
                </label>
                {!canEdit ? (
                  <input
                    type="text"
                    id="complexity"
                    disabled
                    value={selectedComplexity?.label}
                    placeholder="độ khó"
                    className="form-control"
                  />
                ) : (
                  <RSelect
                    id="complexity"
                    options={complexityOptions}
                    value={selectedComplexity}
                    placeholder="độ khó"
                    onChange={(e) => {
                      setSelectedComplexity(e);
                      if (e && selectedQuality) {
                        evaluateLoc(e?.value, selectedQuality?.value);
                      }
                    }}
                    classNamePrefix="select"
                  />
                )}
              </div>
            </Col>
            <Col md="4">
              <div className="form-group">
                <label htmlFor="quality" className="form-label">
                  Mức độ hoàn thiện
                </label>
                {!canEdit ? (
                  <input
                    type="text"
                    id="quality"
                    disabled
                    value={selectedQuality?.label}
                    placeholder="mức độ hoàn thiện"
                    className="form-control"
                  />
                ) : (
                  <RSelect
                    id="quality"
                    options={qualityOptions}
                    value={selectedQuality}
                    placeholder="mức độ hoàn thiện"
                    onChange={(e) => {
                      setSelectedQuality(e);
                      if (e && selectedComplexity) {
                        evaluateLoc(selectedComplexity?.value, e?.value);
                      }
                    }}
                    classNamePrefix="select"
                  />
                )}
              </div>
            </Col>
            <Col md="4">
              <div className="form-group">
                <label htmlFor="loc" className="form-label">
                  LOC
                </label>
                <input
                  id="loc"
                  disabled={!canEdit}
                  type="number"
                  value={LOC}
                  placeholder="Nhập LOC"
                  className="form-control"
                  onChange={(e) => {
                    if (e.target.value === "" || e.target.value >= 0) setLOC(e.target.value);
                  }}
                  aria-describedby="locHelp"
                />
                <small id="locHelp" className="form-text text-muted">
                  Line of Code (LOC) estimation
                </small>
              </div>
            </Col>
            <Col size="12">
              <div className="form-group" style={{ marginTop: "-30px" }}>
                <label htmlFor="comment" className="form-label">
                  Nhận xét
                </label>
                <textarea
                  id="comment"
                  disabled={!canEdit}
                  value={comment}
                  placeholder="nhập nhận xét"
                  className="form-control form-control-xl no-resize"
                  onChange={(e) => {
                    setComment(e.target.value);
                  }}
                  aria-label="Comment"
                />
              </div>
            </Col>
            <Col size="12" className="text-end">
              {canEdit && (
                <Button color="primary" size="md" type="submit">
                  <Icon name="check-circle" className="me-2" />
                  Đánh giá
                </Button>
              )}
            </Col>
          </Form>
        </div>
      </ModalBody>
    </Modal>
  );
};

const getFileNameFromURL = (url) => {
  return url.split("/").pop().split("?")[0];
};

const renderSubmission = (item) => {
  let note = isNullOrEmpty(item.note) ? "" : item.note;
  if (item.submitType === "file") {
    const fileName = getFileNameFromURL(item.submission);
    return (
      <>
        <span className="me-2 fw-bold">{formatDate(item?.updatedDate)}</span>
        <a href={item.submission} download={item.submission}>
          Download {shortenString(fileName, 150)}
        </a>
        <div className="ms-2">{note}</div>
      </>
    );
  } else if (item.submitType === "link") {
    return (
      <>
        <span className="me-2 fw-bold">{formatDate(item?.updatedDate)}</span>
        <a href={item.submission} target="_blank" rel="noopener noreferrer">
          {shortenString(item.submission, 150)}
        </a>
        <div className="ms-2">{note}</div>
      </>
    );
  } else {
    return <span>No submission</span>;
  }
};

export default FinalEvalModal;
