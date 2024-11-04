import React from "react";
import { ToastContainer } from "react-toastify";
import { Modal, ModalBody } from "reactstrap";
import { Col, Row, Icon } from "../../components/Component";
import styled from "styled-components";

const ModalWrapper = styled(ModalBody)`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
`;

const Header = styled.div`
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
  margin-bottom: 20px;
  text-align: center;
`;

const CloseButton = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: #888888;
`;

const Title = styled.h5`
  font-size: 1.75rem; /* Increased font size */
  font-weight: 700;
  color: #333333;
`;

const DetailRow = styled.div`
  margin-bottom: 15px;
  display: flex;
  align-items: center;
`;

const DetailLabel = styled.span`
  font-size: 1rem; /* Increased font size */
  font-weight: 600;
  color: #333333;
  margin-right: 8px;
`;

const DetailValue = styled.span`
  font-size: 1rem; /* Increased font size */
  color: #666666;
`;

const HighlightValue = styled(DetailValue)`
  color: #000000;
  font-weight: 700;
`;

const IconWrapper = styled(Icon)`
  margin-right: 8px;
  color: #007bff;
`;

export default function ViewDetailReq({ requirement, modal, setModal }) {
  const closeModal = () => {
    setModal({ detail: false });
  };

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="lg">
      <ModalWrapper>
        <ToastContainer />
        <CloseButton onClick={closeModal}>
          <Icon name="cross-sm" />
        </CloseButton>
        <Header>
          <Title>Requirement Details</Title>
        </Header>
        <div>
          <Row className="m-2 p-2">
            <Col sm="6">
              <DetailRow>
                <IconWrapper name="menu-alt-r" size={20} />
                <DetailLabel>Title:</DetailLabel>
                <HighlightValue>{requirement?.reqTitle}</HighlightValue>
              </DetailRow>
              <DetailRow>
                <IconWrapper name="users" size={20} />
                <DetailLabel>Team Name:</DetailLabel>
                <DetailValue>{requirement?.teamTeamName}</DetailValue>
              </DetailRow>
              <DetailRow>
                <IconWrapper name="grid-alt" size={20} />
                <DetailLabel>Complexity:</DetailLabel>
                <DetailValue>{requirement?.complexityName}</DetailValue>
              </DetailRow>
              <DetailRow>
                <IconWrapper name="book-read" size={20} />
                <DetailLabel>Note:</DetailLabel>
                <DetailValue>{requirement?.note || "No note available"}</DetailValue>
              </DetailRow>
            </Col>
            <Col sm="6">
              <DetailRow>
                <IconWrapper name="check-circle" size={20} />
                <DetailLabel>Status:</DetailLabel>
                <DetailValue>{requirement?.status}</DetailValue>
              </DetailRow>
              <DetailRow>
                <IconWrapper name="user" size={20} />
                <DetailLabel>Student Name:</DetailLabel>
                <DetailValue>{requirement?.studentFullname}</DetailValue>
              </DetailRow>
              <DetailRow>
                <IconWrapper name="flag" size={20} />
                <DetailLabel>Milestone:</DetailLabel>
                <DetailValue>{requirement?.milestoneTitle}</DetailValue>
              </DetailRow>
            </Col>
          </Row>
        </div>
      </ModalWrapper>
    </Modal>
  );
}
