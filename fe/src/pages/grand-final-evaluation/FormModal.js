import React, { useEffect, useState } from "react";
import { Icon, Button, Col, RSelect } from "../../components/Component";
import { Modal, ModalBody, Form, Row } from "reactstrap";
import { useForm } from "react-hook-form";
import { isNullOrEmpty, shortenString } from "../../utils/Utils";

const FormModal = ({
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

  const closeModal = () => {
    setModal({ evaluate: false });
    setFormData({});
    setId();
  };

  const onSubmit = () => {
    let updateChanges = [...changedFields];
    let updateEval = [...evaluations];
    let index = updateChanges.findIndex((item) => item.reqId === id && item.isUpdateEval === false);
    let evalIdx = updateEval.findIndex((item) => item.id === id);
    updateEval[evalIdx] = {
      ...updateEval[evalIdx],
      requirementEval: {
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
        isUpdateEval: false,
        complexityId: selectedComplexity?.value,
        qualityId: selectedQuality?.value,
        comment: comment,
        grade: LOC,
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
      if (evaluation?.requirementEval && evaluation?.requirementEval?.grade) {
        setLOC(evaluation?.requirementEval?.grade);
      } else {
        setLOC("");
      }
      if (evaluation?.requirementEval && evaluation?.requirementEval?.comment) {
        setComment(evaluation?.requirementEval?.comment);
      } else {
        setComment("");
      }
      if (evaluation?.requirementEval && complexities) {
        let complexity = complexities.find((item) => item.id === evaluation?.requirementEval?.complexityId);
        if (complexity) {
          setSelectedComplexity({
            value: complexity.id,
            label: complexity.name,
          });
        }
      } else {
        setSelectedComplexity(null);
      }
      if (evaluation?.requirementEval && qualities) {
        let quality = qualities.find((item) => item.id === evaluation?.requirementEval?.qualityId);
        if (quality) {
          setSelectedQuality({
            value: quality.id,
            label: quality.name,
          });
        }
      } else {
        setSelectedQuality(null);
      }
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
    let weight = qualities?.find((item) => item.id === qualityId)?.extValue;
    let loc = complexities?.find((item) => item.id === complexityId)?.extValue;

    if (!weight || !loc) return false;

    weight = parseInt(weight);
    loc = parseInt(loc);
    let evalLOC = parseFloat(((weight * loc) / 100).toFixed(0));
    setLOC(evalLOC);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <Modal isOpen={modal} toggle={closeModal} className="modal-dialog-centered" size="xl" aria-labelledby="formModal">
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
        <div className="p-4">
          <h3 className="title mb-4 text-center">Work Evaluation</h3>
          <Row className="student-info mb-4">
            <Col md="6">
              <div>
                <strong>Student:</strong> {formData?.studentFullname || "N/A"}
              </div>
            </Col>
            <Col md="6">
              <div>
                <strong>Team:</strong> {formData?.teamTeamName || "N/A"}
              </div>
            </Col>
            <Col md="6" className="mt-2">
              <div>
                <strong>Function:</strong> {isNullOrEmpty(formData.reqTitle) ? "N/A" : formData.reqTitle}
              </div>
            </Col>
            <Col md="6" className="mt-3">
              <div>
                <strong>Status:</strong> <span className="badge bg-info">{formData?.status}</span>
              </div>
            </Col>
            {/* <Col md="6" className="mt-3">
              <div>
                <strong>Submission:</strong>{" "}
                {isNullOrEmpty(formData?.submission) ? (
                  <span className="text-danger">No submission</span>
                ) : (
                  renderSubmission(formData, false)
                )}
              </div>
            </Col> */}
            {/* <Col md="6" className="mt-3">
              <div>
                <strong>Note:</strong>
                {isNullOrEmpty(formData.note) ? (
                  <span className="text-muted">Note is not available</span>
                ) : (
                  formData.note
                )}
              </div>
            </Col> */}
          </Row>
          <Form className="row gy-3" onSubmit={handleSubmit(onSubmit)}>
            <Col md="4">
              <div className="form-group">
                <label className="form-label">Complexity</label>
                {!canEdit ? (
                  <input
                    type="text"
                    disabled
                    value={selectedComplexity?.label}
                    placeholder="Any complexity"
                    className="form-control"
                  />
                ) : (
                  <RSelect
                    options={complexityOptions}
                    value={selectedComplexity}
                    placeholder="Select complexity"
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
                <label className="form-label">Quality</label>
                {!canEdit ? (
                  <input
                    type="text"
                    disabled
                    value={selectedQuality?.label}
                    placeholder="Any quality"
                    className="form-control"
                  />
                ) : (
                  <RSelect
                    options={qualityOptions}
                    value={selectedQuality}
                    placeholder="Select quality"
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
                <label className="form-label">LOC</label>
                <input
                  disabled={!canEdit}
                  type="number"
                  value={LOC}
                  placeholder="Enter LOC"
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
              <div className="form-group" style={{marginTop: '-30px'}}>
                <label className="form-label">Comment</label>
                <textarea
                  disabled={!canEdit}
                  value={comment}
                  placeholder="Enter your comment"
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
                  Evaluate
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

export default FormModal;