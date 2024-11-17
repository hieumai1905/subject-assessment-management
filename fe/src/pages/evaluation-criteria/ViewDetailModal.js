import React, { useEffect, useState } from "react";
import { Icon, Button, Col, RSelect } from "../../components/Component";
// import { settingTypeList, statusList } from "./SettingData";
import { Modal, ModalBody, Form, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import { useForm } from "react-hook-form";
import { evaluationTypes } from "../../data/ConstantData";
import { isNullOrEmpty } from "../../utils/Utils";

const ViewDetailModal = ({ modal, setModal, updateData }) => {
  const initialAsm = {
    criteriaName: '',
    evalWeight: 1,
    locEvaluation: 'Hoạt động',
    active: 'Hoạt động',
    guides: '',
  };
  const [formData, setFormData] = useState(updateData);
  const closeModal = () => {
    setModal({ detail: false });
    setFormData(initialAsm);
  };

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="lg">
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
        <div className="p-2">
          <h4 className="title">Chi tiết tiêu chí</h4>
          <div className="mt-4">
            <Form className="row gy-4">
              <Col size={12}>
                <h5>Tiêu đề: {formData?.criteriaName}</h5>
                <span className="fw-bold">Trọng số:</span> {formData?.evalWeight}%
                <p>
                  <span className="fw-bold">Hướng dẫn:</span> {formData?.guides}
                </p>
              </Col>
            </Form>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
export default ViewDetailModal;
