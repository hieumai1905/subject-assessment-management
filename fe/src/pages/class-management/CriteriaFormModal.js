import React, { useEffect, useState } from "react";
import { Icon, Button, Col, RSelect } from "../../components/Component";
// import { settingTypeList, statusList } from "./SettingData";
import { Modal, ModalBody, Form } from "reactstrap";
import { useForm } from "react-hook-form";
import { isNullOrEmpty } from "../../utils/Utils";

const CriteriaFormModal = ({ id, modal, setModal, modalType, criterias, setCriterias, updateData }) => {
  const ininialCriteria = {
    criteriaName: "",
    evalWeight: 1,
    locEvaluation: criterias.find((item) => item.locEvaluation && item.id !== id) !== undefined ? "InActive" : "Active",
    active: "Active",
    note: "",
  };
  const [formData, setFormData] = useState(modalType === "add" ? ininialCriteria : updateData);

  const closeModal = () => {
    setModal({ add: false, edit: false });
    setFormData(ininialCriteria);
  };

  const validateInput = (sData) => {
    const { criteriaName, evalWeight, locEvaluation, active, note } = sData;
    let existByName = criterias.find(
      (criteria) => criteria.criteriaName.toLowerCase() === criteriaName.trim().toLowerCase() && criteria.id !== id
    );
    if (isNullOrEmpty(criteriaName.trim())) {
      setError("criteriaName", { type: "manual", message: "Tên tiêu chí không được để trống" });
      return false;
    } else if (existByName) {
      setError("criteriaName", { type: "manual", message: "Tên tiêu chí đã tồn tại" });
      return false;
    }
    if (evalWeight < 0) {
      setError("evalWeight", { type: "manual", message: "Tỷ trọng đánh giá phải lớn hơn 0" });
      return false;
    }
    return true;
  };

  const onSubmit = (sData) => {
    if (!validateInput(sData)) {
      return false;
    }
    console.log("sData", sData);
    let updateCriterias = [...criterias];
    let updateCriteria = {
      id: id,
      criteriaName: sData.criteriaName,
      evalWeight: sData.evalWeight,
      locEvaluation: sData.locEvaluation === "Active",
      active: sData.active === "Active",
      note: sData.note,
      updatedDate: new Date(),
      canEdit: true,
    };
    if (modalType === "add") {
      updateCriterias.push(updateCriteria);
    } else if (modalType === "edit") {
      let index = updateCriterias.findIndex((item) => item.id === id);
      updateCriterias[index] = updateCriteria;
    }
    setCriterias(updateCriterias);
    closeModal();
  };

  useEffect(() => {
    reset(formData);
  }, [formData]);

  const {
    reset,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

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
          <h5 className="title">
            {modalType === "add" && "Thêm tiêu chí"} {modalType === "edit" && "Cập nhật tiêu chí"}
          </h5>
          <div className="mt-4">
            <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Tên tiêu chí*</label>
                  <input
                    type="text"
                    {...register("criteriaName", { required: "Trường này là bắt buộc" })}
                    value={formData.criteriaName}
                    placeholder="Nhập tên tiêu chí"
                    onChange={(e) => setFormData({ ...formData, criteriaName: e.target.value })}
                    className="form-control"
                  />
                  {errors.criteriaName && <span className="invalid">{errors.criteriaName.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Tỷ trọng đánh giá (%)*</label>
                  <input
                    type="number"
                    {...register("evalWeight", { required: "Trường này là bắt buộc" })}
                    value={formData.evalWeight}
                    placeholder="Nhập tỷ trọng đánh giá"
                    onChange={(e) => setFormData({ ...formData, evalWeight: e.target.value })}
                    className="form-control"
                  />
                  {errors.evalWeight && <span className="invalid">{errors.evalWeight.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Đánh giá LOC</label>
                  <br />
                  <ul className="custom-control-group">
                    <li>
                      <div
                        style={{ height: 40 }}
                        className="custom-control custom-control-sm custom-radio custom-control-pro checked"
                      >
                        <input
                          disabled={true}
                          type="radio"
                          className="custom-control-input"
                          name="btnRadioControlLOC"
                          id="btnRadioControl1LOC"
                          defaultChecked={formData.locEvaluation === "Active"}
                          value={"Active"}
                          onClick={(e) => {
                            setFormData({ ...formData, locEvaluation: e.target.value });
                          }}
                        />
                        <label className="custom-control-label" htmlFor="btnRadioControl1LOC">
                          Có
                        </label>
                      </div>
                    </li>
                    <li>
                      <div
                        style={{ height: 40 }}
                        className="custom-control custom-control-sm custom-radio custom-control-pro"
                      >
                        <input
                          disabled={true}
                          type="radio"
                          className="custom-control-input"
                          name="btnRadioControlLOC"
                          id="btnRadioControl5LOC"
                          defaultChecked={formData.locEvaluation === "InActive"}
                          value={"InActive"}
                          onClick={(e) => {
                            setFormData({ ...formData, locEvaluation: e.target.value });
                          }}
                        />
                        <label className="custom-control-label" htmlFor="btnRadioControl5LOC">
                          Không
                        </label>
                      </div>
                    </li>
                  </ul>
                </div>
              </Col>
              <Col size="12">
                <div className="form-group">
                  <label className="form-label">Ghi chú</label>
                  <textarea
                    value={formData.note}
                    placeholder="Nhập ghi chú"
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="form-control-xl form-control no-resize"
                  />
                </div>
              </Col>
              <Col size="12">
                <ul className=" text-end">
                  <li>
                    <Button color="primary" size="md" type="submit">
                      {modalType === "add" && "Thêm tiêu chí"} {modalType === "edit" && "Cập nhật"}
                    </Button>
                  </li>
                </ul>
              </Col>
            </Form>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
export default CriteriaFormModal;
