import React, { useEffect, useState } from "react";
import { Icon, Button, Col, RSelect } from "../../components/Component";
import { Modal, ModalBody, Form } from "reactstrap";
import { useForm } from "react-hook-form";
import { isNullOrEmpty } from "../../utils/Utils";
import { TextareaAutosize } from "@mui/material";

const ViewStudentWorkEval = ({ modal, setModal, complexities, qualities, evaluations, mileTitle }) => {
  const [formData, setFormData] = useState({});
  const [LOC, setLOC] = useState("");

  const closeModal = () => {
    setModal({ detail: false });
    setFormData({});
  };

  const onSubmit = () => {};

  useEffect(() => {
    if (evaluations && evaluations.length > 0) {
    }
  }, [evaluations]);

  const {
    reset,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  return (
    <Modal isOpen={modal.detail} toggle={() => closeModal()} className="modal-dialog-centered" size="xl">
      <ModalBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            Work Evaluation
          </h3>
          <Button close onClick={closeModal} className="p-0 border-0 bg-transparent" style={{ padding: "5px" }}>
            <Icon name="cross-sm" />
          </Button>
        </div>
        {!evaluations || evaluations.length === 0 ? (
          <div className="text-center p-5">
            <h5>No work evaluation available in {mileTitle}</h5>
          </div>
        ) : (
          <>
            <h4 className="text-muted mb-4">
              Student: <strong>{evaluations[0]?.studentFullname}</strong>, Team:{" "}
              <strong>{evaluations[0]?.teamTeamName}</strong> in {mileTitle}
            </h4>
            <div
              className="mt-4"
              style={{
                maxHeight: "500px",
                overflowY: "auto",
                paddingRight: "10px",
                scrollbarWidth: "thin",
                scrollbarColor: "#888 #e4e6ef",
              }}
            >
              <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
                {evaluations.map((item, idx) => (
                  <Col
                    md="12"
                    key={idx}
                    className="mb-3 p-3"
                    style={{
                      border: "1px solid #e4e6ef",
                      borderRadius: "8px",
                      backgroundColor: "#f8f9fa",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <h5 className="mb-3" style={{ fontSize: "1.25rem" }}>
                      <span className="fw-bold">{idx + 1}. Function:</span> {item.reqTitle}
                    </h5>
                    {item.requirementEval && (
                      <div className="ms-2 mb-3">
                        <span className="fw-bold me-3">- Evaluation:</span>
                        <span className="fw-bold me-1">Complexity:</span>
                        <span className="me-2">
                          {complexities.find((c) => c.id === item?.requirementEval?.complexityId)?.name}
                        </span>
                        <span className="fw-bold me-1">Quality:</span>
                        <span className="me-2">
                          {qualities.find((c) => c.id === item?.requirementEval?.qualityId)?.name}
                        </span>
                        <span className="fw-bold me-1">LOC Grade:</span>
                        <span>{item?.requirementEval?.grade}</span>
                        <div className="mt-1" style={{ width: "100%" }}>
                          <span className="fw-bold me-1">Comment:</span>{" "}
                          {item?.requirementEval?.comment || "No comment"}
                        </div>
                      </div>
                    )}
                    {item.updateRequirementEval && (
                      <div
                        className="ms-2 mb-3"
                        style={{ backgroundColor: "#e9ecef", padding: "10px", borderRadius: "5px" }}
                      >
                        <span className="fw-bold me-3">- Update Evaluation:</span>
                        <span className="fw-bold me-1">Complexity:</span>
                        <span className="me-2">
                          {complexities.find((c) => c.id === item?.updateRequirementEval?.complexityId)?.name}
                        </span>
                        <span className="fw-bold me-1">Quality:</span>
                        <span className="me-2">
                          {qualities.find((c) => c.id === item?.updateRequirementEval?.qualityId)?.name}
                        </span>
                        <span className="fw-bold me-1">LOC Grade:</span>
                        <span>{item?.updateRequirementEval?.grade}</span>
                        <div className="mt-1" style={{ width: "100%" }}>
                          <span className="fw-bold me-1">Comment:</span>{" "}
                          {item?.updateRequirementEval?.comment || "No comment"}
                        </div>
                      </div>
                    )}
                  </Col>
                ))}
              </Form>
            </div>
          </>
        )}
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
          Download {fileName}
        </a>
        {isUpdate && <span>{note}</span>}
      </>
    );
  } else if (item.submitType === "link") {
    return (
      <>
        <a href={item.submission} target="_blank" rel="noopener noreferrer">
          {item.submission}
        </a>
        {isUpdate && <span>{note}</span>}
      </>
    );
  } else {
    return <span>No submission</span>;
  }
};

export default ViewStudentWorkEval;
