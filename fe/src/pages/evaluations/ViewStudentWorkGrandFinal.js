import React, { useEffect, useState } from "react";
import { Icon, Button, Row, Col } from "../../components/Component";
import { Modal, ModalBody, Form } from "reactstrap";
import { useForm } from "react-hook-form";

const ViewStudentWorkGrandFinal = ({ modal, setModal, complexities, qualities, evaluations, mileTitle }) => {
  const [formData, setFormData] = useState({});
  const [LOC, setLOC] = useState("");

  const closeModal = () => {
    setModal({ grand_final: false });
    setFormData({});
  };

  const onSubmit = () => {};

  useEffect(() => {
    if (evaluations && evaluations.length > 0) {
      console.log("Evaluations data:", evaluations);
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
      isOpen={modal.grand_final}
      toggle={() => closeModal()}
      className="modal-dialog-centered"
      size="lg"
      style={{ maxWidth: "70%", padding: "1rem" }}
    >
      <ModalBody
        style={{
          padding: "2rem",
          background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="d-flex justify-content-between align-items-center mb-4"
          style={{ borderBottom: "2px solid #dee2e6", paddingBottom: "1rem" }}
        >
          <h4
            className="mb-0"
            style={{
              fontSize: "1.75rem",
              fontWeight: "bold",
              color: "#333",
              letterSpacing: "0.7px",
            }}
          >
            <Icon name="file-text" style={{ marginRight: "10px", color: "#0056B3" }} />
            Đánh giá yêu cầu lần cuối
          </h4>
          <Button
            close
            onClick={closeModal}
            className="p-0 border-0 bg-transparent"
            style={{
              fontSize: "1.5rem",
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
            className="text-center p-5"
            style={{
              color: "#999",
              fontSize: "1.1rem",
              backgroundColor: "#f4f4f4",
              borderRadius: "10px",
              marginTop: "2rem",
            }}
          >
            <Icon name="info" style={{ marginRight: "10px", color: "#777" }} />
            <h6>Không có dữ liệu trong {mileTitle}</h6>
          </div>
        ) : (
          <>
            <h5
              className="text-muted mb-4"
              style={{
                fontSize: "1.2rem",
                color: "#555",
                padding: "0.75rem 1rem",
                backgroundColor: "#f4f4f4",
                borderRadius: "10px",
              }}
            >
              <Icon name="user" style={{ marginRight: "10px", color: "#0056B3" }} />
              Sinh viên: {evaluations[0]?.studentFullname} trong {mileTitle}
            </h5>
            <div
              className="mt-4"
              style={{
                maxHeight: "450px",
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: "15px",
                scrollbarWidth: "thin",
                scrollbarColor: "#888 #e4e6ef",
              }}
            >
              <Form className="row gy-3" onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  {evaluations.map((item, idx) => (
                    <Col md="12" key={idx} className="mt-5">
                      <div
                        style={{
                          border: "1px solid #dee2e6",
                          borderRadius: "10px",
                          backgroundColor: "#fff",
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                          transition: "transform 0.3s ease, box-shadow 0.3s ease",
                          transform: "translateY(0)",
                          padding: "20px",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = "translateY(-5px)";
                          e.currentTarget.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.2)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)";
                        }}
                      >
                        <h6
                          className="mb-3"
                          style={{
                            fontSize: "1.3rem",
                            fontWeight: "600",
                            color: "#333",
                            borderBottom: "1px solid #ddd",
                            paddingBottom: "0.5rem",
                          }}
                        >
                          <Icon name="layers" style={{ marginRight: "10px", color: "#0056B3" }} />
                          {idx + 1}. {item.reqTitle}
                        </h6>
                        {item.gradeEvaluatorList && item.gradeEvaluatorList.length > 0 ? (
                          item.gradeEvaluatorList.map((evaluator, evIdx) => (
                            <div
                              key={evIdx}
                              className="ms-2 mb-3"
                              style={{
                                fontSize: "1rem",
                                color: "#555",
                                borderTop: evIdx > 0 ? "1px solid #eee" : "none",
                                paddingTop: evIdx > 0 ? "15px" : "0",
                                marginTop: evIdx > 0 ? "15px" : "0",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                                <Icon name="user" style={{ marginRight: "8px", color: "#0056B3" }} />
                                <span style={{ fontWeight: "600", color: "#333" }}>Người đánh giá:</span>{" "}
                                <span style={{ marginLeft: "6px", color: "#000" }}>{evaluator.fullname}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                                <Icon name="check-circle" style={{ marginRight: "8px", color: "#0056B3" }} />
                                <span style={{ fontWeight: "600", color: "#333" }}>Độ khó:</span>{" "}
                                <span style={{ marginLeft: "6px", color: "#000" }}>{evaluator.complexityName}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                                <Icon name="check-circle" style={{ marginRight: "8px", color: "#0056B3" }} />
                                <span style={{ fontWeight: "600", color: "#333" }}>Mức độ hoàn thiện:</span>{" "}
                                <span style={{ marginLeft: "6px", color: "#000" }}>{evaluator.qualityName}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center" }}>
                                <Icon name="check-circle" style={{ marginRight: "8px", color: "#0056B3" }} />
                                <span style={{ fontWeight: "600", color: "#333" }}>Điểm:</span>{" "}
                                <span style={{ marginLeft: "6px", color: "#000" }}>{evaluator.grade}</span>
                              </div>
                              <div className="mt-1" style={{ width: "100%" }}>
                                <span className="fw-bold me-1">Nhận xét:</span>{" "}
                                {evaluator?.comment || "Không có"}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="ms-2 mb-3" style={{ fontSize: "1rem", color: "#555" }}>
                            <div className="mt-2" style={{ fontSize: "0.95rem", color: "#666" }}>
                              <Icon name="message-square" style={{ marginRight: "8px", color: "#999" }} />
                              Không có dữ liệu
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

export default ViewStudentWorkGrandFinal;
