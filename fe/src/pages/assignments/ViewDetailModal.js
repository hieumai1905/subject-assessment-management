import React, { useEffect, useState } from "react";
import { Icon, Button, Col, RSelect } from "../../components/Component";
// import { settingTypeList, statusList } from "./SettingData";
import { Modal, ModalBody, Form, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import { useForm } from "react-hook-form";
import { evaluationTypes } from "../../data/ConstantData";
import { isNullOrEmpty } from "../../utils/Utils";

const ViewDetailModal = ({ modal, setModal, updateData }) => {
  const initialAsm = {
    title: "",
    evalWeight: 1,
    expectedLoc: 1,
    typeEvaluator: null,
    displayOrder: 1,
    active: "Active",
    note: "",
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
          <h4 className="title">Chi tiết bài kiểm tra</h4>
          <div className="mt-4">
            <Form className="row gy-4">
              <Col size={12}>
                <h5>Tiêu đề: {formData?.title}</h5>
                <span className="fw-bold">Trọng số:</span> {formData?.evalWeight}%
                {/* <span className="ms-3 fw-bold">Số dòng mã dự kiến:</span> {formData?.expectedLoc} */}
                <p>
                  <span className="fw-bold">Loại đánh giá:</span> {formData?.typeEvaluator?.label}{" "}
                </p>
                <p>
                  <span className="fw-bold">Ghi chú:</span> {formData?.note}
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
