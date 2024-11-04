import React, { useEffect, useState } from "react";
import { Icon, Button, Row, Col } from "../../components/Component";
import { Modal, ModalBody, Form } from "reactstrap";
import { useForm } from "react-hook-form";

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
      console.log("ádasdsad");
      
      
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
    <Modal
      isOpen={modal.detail}
      toggle={() => closeModal()}
      className="modal-dialog-centered"
      size="lg"
      style={{ maxWidth: "70%", padding: "1rem" }}
    >
      <ModalBody
        style={{
          padding: "1.5rem",
          backgroundColor: "#f9f9f9",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="d-flex justify-content-between align-items-center mb-3"
          style={{ borderBottom: "1px solid #ddd", paddingBottom: "0.75rem" }}
        >
          <h4
            className="mb-0"
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#333",
              letterSpacing: "0.5px",
            }}
          >
            <Icon name="file-text" style={{ marginRight: "8px", color: "#666" }} />
            Work Evaluation
          </h4>
          <Button
            close
            onClick={closeModal}
            className="p-0 border-0 bg-transparent"
            style={{
              fontSize: "1.25rem",
              color: "#999",
              cursor: "pointer",
              transition: "color 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.color = "#d9534f")}
            onMouseOut={(e) => (e.target.style.color = "#999")}
          >
            <Icon name="cross-sm" />
          </Button>
        </div>
        {!evaluations || evaluations.length === 0 ? (
          <div
            className="text-center p-4"
            style={{
              color: "#999",
              fontSize: "1rem",
              backgroundColor: "#f4f4f4",
              borderRadius: "8px",
              marginTop: "1.5rem",
            }}
          >
            <Icon name="info" style={{ marginRight: "8px", color: "#777" }} />
            <h6>No work evaluation available in {mileTitle}</h6>
          </div>
        ) : (
          <>
            <h5
              className="text-muted mb-3"
              style={{
                fontSize: "1.1rem",
                color: "#555",
                padding: "0.5rem 0.75rem",
                backgroundColor: "#f4f4f4",
                borderRadius: "8px",
              }}
            >
              <Icon name="user" style={{ marginRight: "8px", color: "#666" }} />
              Student: {evaluations[0]?.studentFullname}, Team: {evaluations[0]?.teamTeamName} in {mileTitle}
            </h5>
            <div
              className="mt-3"
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                overflowX: "hidden", // Disable horizontal scrollbar
                paddingRight: "12px",
                scrollbarWidth: "thin",
                scrollbarColor: "#888 #e4e6ef",
              }}
            >
              <Form className="row gy-3" onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  {evaluations.map((item, idx) => (
                    <Col md="12" key={idx} className="mb-3">
                      {" "}
                      {/* Đổi Col md="6" thành md="12" để chiếm hết chiều rộng */}
                      <div
                        style={{
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          backgroundColor: "#fff",
                          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
                          transition: "transform 0.3s ease, box-shadow 0.3s ease",
                          transform: "translateY(0)",
                          padding: "15px",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = "translateY(-3px)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.12)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.08)";
                        }}
                      >
                        <h6
                          className="mb-2"
                          style={{
                            fontSize: "1.2rem",
                            fontWeight: "500",
                            color: "#333",
                            borderBottom: "1px solid #eee",
                            paddingBottom: "0.4rem",
                          }}
                        >
                          <Icon name="layers" style={{ marginRight: "8px", color: "#888" }} />
                          {idx + 1}. Function: {item.reqTitle}
                        </h6>
                        {item.requirementEval && (
                          <div className="ms-2 mb-2" style={{ fontSize: "0.95rem", color: "#555" }}>
                            <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                              <Icon name="check-circle" style={{ marginRight: "6px", color: "#5cb85c" }} />
                              <span style={{ fontWeight: "600", color: "#333" }}>Complexity:</span>{" "}
                              <span style={{ marginLeft: "4px", color: "#000" }}>
                                {complexities.find((c) => c.id === item?.requirementEval?.complexityId)?.name}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                              <Icon name="check-circle" style={{ marginRight: "6px", color: "#5cb85c" }} />
                              <span style={{ fontWeight: "600", color: "#333" }}>Quality:</span>{" "}
                              <span style={{ marginLeft: "4px", color: "#000" }}>
                                {qualities.find((c) => c.id === item?.requirementEval?.qualityId)?.name}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <Icon name="check-circle" style={{ marginRight: "6px", color: "#5cb85c" }} />
                              <span style={{ fontWeight: "600", color: "#333" }}>LOC Grade:</span>{" "}
                              <span style={{ marginLeft: "4px", color: "#000" }}>{item?.requirementEval?.grade}</span>
                            </div>
                            <div className="mt-1" style={{ fontSize: "0.9rem", color: "#666" }}>
                              <Icon name="message-square" style={{ marginRight: "6px", color: "#999" }} />
                              Comment: {item?.requirementEval?.comment || "No comment"}
                            </div>
                          </div>
                        )}
                        {item.updateRequirementEval && (
                          <div
                            className="ms-2 mb-2"
                            style={{
                              backgroundColor: "#f7f7f7",
                              padding: "10px",
                              borderRadius: "8px",
                              color: "#444",
                              fontSize: "0.95rem",
                              border: "1px solid #ddd",
                            }}
                          >
                            <Icon name="refresh-cw" style={{ marginRight: "6px", color: "#5bc0de" }} />
                            <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                              <span style={{ fontWeight: "600", color: "#333" }}>Complexity:</span>{" "}
                              <span style={{ marginLeft: "4px", color: "#000" }}>
                                {complexities.find((c) => c.id === item?.updateRequirementEval?.complexityId)?.name}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                              <span style={{ fontWeight: "600", color: "#333" }}>Quality:</span>{" "}
                              <span style={{ marginLeft: "4px", color: "#000" }}>
                                {qualities.find((c) => c.id === item?.updateRequirementEval?.qualityId)?.name}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <span style={{ fontWeight: "600", color: "#333" }}>LOC Grade:</span>{" "}
                              <span style={{ marginLeft: "4px", color: "#000" }}>
                                {item?.updateRequirementEval?.grade}
                              </span>
                            </div>
                            <div className="mt-1" style={{ fontSize: "0.9rem", color: "#666" }}>
                              <Icon name="message-square" style={{ marginRight: "6px", color: "#999" }} />
                              Comment: {item?.updateRequirementEval?.comment || "No comment"}
                            </div>
                          </div>
                        )}
                      </div>
                    </Col>
                  ))}
                </Row>
              </Form>
            </div>
          </>
        )}
      </ModalBody>
    </Modal>
  );
};

export default ViewStudentWorkEval;
