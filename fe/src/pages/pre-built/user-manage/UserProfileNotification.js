import React from "react";
import { ToastContainer } from "react-toastify";
import { Col, Icon, Row } from "../../../components/Component";
import { Modal, ModalBody } from "reactstrap";

export default function ViewDetailReq({ requirement, modal, setModal }) {
  const closeModal = () => {
    setModal({ detail: false });
  };

  const modalStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
  };

  const headerStyle = {
    borderBottom: "2px solid #f0f0f0",
    paddingBottom: "15px",
    marginBottom: "25px",
    textAlign: "center",
  };

  const closeButtonStyle = {
    position: "absolute",
    top: "20px",
    right: "20px",
    cursor: "pointer",
    color: "#a0a0a0",
  };

  const titleStyle = {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#333333",
  };

  const detailRowStyle = {
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
  };

  const detailLabelStyle = {
    fontWeight: "600",
    color: "#555555",
    marginRight: "10px",
  };

  const detailValueStyle = {
    color: "#888888",
  };

  const highlightStyle = {
    color: "#000000",
    fontWeight: "700",
  };

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="lg">
      <ModalBody style={modalStyle}>
        <ToastContainer />
        <div style={closeButtonStyle} onClick={closeModal}>
          <Icon name="cross-sm" />
        </div>
        <div style={headerStyle}>
          <h5 style={titleStyle}>View Requirement Detail</h5>
        </div>
        <div>
          <Row className="m-2 p-2">
            <Col sm="6">
              <div style={detailRowStyle}>
                <Icon name="menu-alt-r" size={20} />
                <span style={detailLabelStyle}>Title:</span>
                <span style={{ ...detailValueStyle, ...highlightStyle }}>{requirement?.reqTitle}</span>
              </div>
              <div style={detailRowStyle}>
                <Icon name="users" size={20} />
                <span style={detailLabelStyle}>Team Name:</span>
                <span style={detailValueStyle}>{requirement?.teamTeamName}</span>
              </div>
              <div style={detailRowStyle}>
                <Icon name="grid-alt" size={20} />
                <span style={detailLabelStyle}>Complexity:</span>
                <span style={detailValueStyle}>{requirement?.complexityName}</span>
              </div>
            </Col>
            <Col sm="6">
              <div style={detailRowStyle}>
                <Icon name="check-circle" size={20} />
                <span style={detailLabelStyle}>Status:</span>
                <span style={detailValueStyle}>{requirement?.status}</span>
              </div>
              <div style={detailRowStyle}>
                <Icon name="user" size={20} />
                <span style={detailLabelStyle}>Student Name:</span>
                <span style={detailValueStyle}>{requirement?.studentFullname}</span>
              </div>
              <div style={detailRowStyle}>
                <Icon name="flag" size={20} />
                <span style={detailLabelStyle}>Milestone:</span>
                <span style={detailValueStyle}>{requirement?.milestoneTitle}</span>
              </div>
              <div style={detailRowStyle}>
                <Icon name="note" size={20} />
                <span style={detailLabelStyle}>Note:</span>
                <span style={detailValueStyle}>{requirement?.note || "No note available"}</span>
              </div>
            </Col>
          </Row>
        </div>
      </ModalBody>
    </Modal>
  );
}
