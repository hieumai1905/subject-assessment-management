import React, { useEffect, useState } from "react";
import { Icon, Button, Col, RSelect } from "../../components/Component";
// import { settingTypeList, statusList } from "./SettingData";
import { Modal, ModalBody, Form, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import { useForm } from "react-hook-form";
import { evaluationTypes } from "../../data/ConstantData";
import { isNullOrEmpty, isNumber } from "../../utils/Utils";

const FormModal = ({ id, modal, setModal, assignments, setAssignments, modalType, updateData, subject }) => {
  const initialAsm = {
    title: "",
    evalWeight: 1,
    expectedLoc: 1,
    evaluationType: null,
    displayOrder: 1,
    active: "Active",
    note: "",
  };
  const [formData, setFormData] = useState(modalType === "add" ? initialAsm : updateData);
  const closeModal = () => {
    setModal({ add: false, edit: false });
    setFormData(initialAsm);
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

  const validateInput = (sData) => {
    const { title, evalWeight, expectedLoc, evaluationType, displayOrder, active, note } = sData;
    let existByTitle = assignments.find(
      (assignment) => assignment.title.toLowerCase() === title.trim().toLowerCase() && assignment.id !== id
    );
    if (isNullOrEmpty(title.trim())) {
      setError("title", { type: "manual", message: "Tiêu đề không được để trống" });
      return false;
    } else if (title.length > 250) {
      setError("title", { type: "manual", message: "Tiêu đề phải có độ dài <= 250 ký tự" });
      return false;
    } else if (existByTitle) {
      setError("title", { type: "manual", message: "Tiêu đề đã tồn tại" });
      return false;
    }
    if (evalWeight < 0) {
      setError("evalWeight", { type: "manual", message: "Trọng số đánh giá phải lớn hơn 0" });
      return false;
    }
    if (expectedLoc < 0) {
      setError("expectedLoc", { type: "manual", message: "Dự kiến LOC phải lớn hơn 0" });
      return false;
    }
    if (displayOrder < 0) {
      setError("displayOrder", { type: "manual", message: "Thứ tự xuất hiện phải lớn hơn 0" });
      return false;
    }
    return true;
  };

  const onSubmit = async (sData) => {
    if (!validateInput(sData)) {
      return false;
    }
    console.log("sData", sData);
    let updatedAssignments = [...assignments];
    let updateAsm = {
      ...sData,
      id: id,
      active: sData?.active === "Active",
      evaluationType: sData?.evaluationType?.value,
    };

    if (modalType === "add") {
      const maxDisplayOrder = Math.max(...assignments.map((item) => item.displayOrder), 0);
      updateAsm.displayOrder = maxDisplayOrder + 1;
      updatedAssignments.push(updateAsm);
    } else if (modalType === "edit") {
      let index = assignments?.findIndex((item) => item.id === id);
      updatedAssignments[index] = {
        ...updateAsm,
        updatedDate: updateData?.updatedDate,
      };
    }
    setAssignments(updatedAssignments);
    closeModal();
  };

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="xl">
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
            {modalType === "add" && "Thêm Bài kiểm tra"} {modalType === "edit" && "Cập Nhật Bài kiểm tra"}
          </h5>
          <div className="mt-4">
            <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Tiêu đề*</label>
                  <input
                    type="text"
                    {...register("title", { required: "Trường này là bắt buộc" })}
                    value={formData.title}
                    placeholder="Nhập tiêu đề"
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                    }}
                    className="form-control"
                  />
                  {errors.title && <span className="invalid">{errors.title.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Trọng số* (%)</label>
                  <input
                    type="number"
                    {...register("evalWeight", { required: "Trường này là bắt buộc" })}
                    value={formData.evalWeight}
                    placeholder="Nhập trọng số"
                    onChange={(e) => setFormData({ ...formData, evalWeight: e.target.value })}
                    className="form-control"
                  />
                  {errors.evalWeight && <span className="invalid">{errors.evalWeight.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Dự kiến LOC*</label>
                  <input
                    type="number"
                    value={formData.expectedLoc}
                    {...register("expectedLoc", { required: "Trường này là bắt buộc" })}
                    placeholder="Nhập LOC dự kiến"
                    onChange={(e) => setFormData({ ...formData, expectedLoc: e.target.value })}
                    className="form-control"
                  />
                  {errors.expectedLoc && <span className="invalid">{errors.expectedLoc.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Thứ tự xuất hiện</label>
                  <input
                    type="number"
                    {...register("displayOrder", { required: "Trường này là bắt buộc" })}
                    value={formData.displayOrder}
                    placeholder="Nhập Thứ tự xuất hiện"
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="form-control"
                  />
                  {errors.displayOrder && <span className="invalid text-danger">{errors.displayOrder.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Loại đánh giá*</label>
                  <RSelect
                    options={evaluationTypes.filter((item) => {
                      const hasGrandFinal = assignments.some(
                        (assignment) => assignment.evaluationType === "Grand Final"
                      );
                      const hasFinal = assignments.some((assignment) => assignment.evaluationType === "Final");
                      if ((!subject?.isCouncil || hasGrandFinal) && item.value === "Grand Final") {
                        return false;
                      }
                      if (hasFinal && item.value === "Final") {
                        return false;
                      }
                      return true;
                    })}
                    value={formData.evaluationType}
                    {...register("evaluationType", { required: "Trường này là bắt buộc" })}
                    onChange={(e) => {
                      setFormData({ ...formData, evaluationType: e });
                    }}
                  />
                  {errors.evaluationType && <span className="invalid text-danger">{errors.evaluationType.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Trạng Thái</label>
                  <br />
                  <ul className="custom-control-group">
                    <li>
                      <div
                        style={{ height: 40 }}
                        className="custom-control custom-control-sm custom-radio custom-control-pro checked"
                      >
                        <input
                          type="radio"
                          className="custom-control-input"
                          name="btnRadioControl"
                          id="btnRadioControl1"
                          defaultChecked={formData.active === "Active" || modalType === "add"}
                          value={"Active"}
                          onClick={(e) => {
                            setFormData({ ...formData, active: e.target.value });
                          }}
                        />
                        <label className="custom-control-label" htmlFor="btnRadioControl1">
                          Hoạt Động
                        </label>
                      </div>
                    </li>
                    <li>
                      <div
                        style={{ height: 40 }}
                        className="custom-control custom-control-sm custom-radio custom-control-pro"
                      >
                        <input
                          type="radio"
                          className="custom-control-input"
                          name="btnRadioControl"
                          id="btnRadioControl5"
                          defaultChecked={formData.active === "InActive"}
                          value={"InActive"}
                          onClick={(e) => {
                            setFormData({ ...formData, active: e.target.value });
                          }}
                        />
                        <label className="custom-control-label" htmlFor="btnRadioControl5">
                          Không Hoạt Động
                        </label>
                      </div>
                    </li>
                  </ul>
                </div>
              </Col>
              {/* <Col md="6">
                <div className="form-group mt-4">
                  <label className="form-label">Trạng thái</label>
                  <div className="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="isActiveCheckbox12"
                      checked={formData.active == "Active" || modalType == "add"}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked ? "Active" : "InActive" })}
                    />
                    <label className="custom-control-label" htmlFor="isActiveCheckbox12">
                      Bài kiểm tra này có đang hoạt động?
                    </label>
                  </div>
                </div>
              </Col> */}
              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Ghi chú</label>
                  <textarea
                    {...register("note")}
                    value={formData?.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    rows="3"
                    placeholder="Nhập ghi chú"
                    className="form-control"
                  ></textarea>
                </div>
              </Col>
              {/* <div className="text-end w-25 mt-5">
                <Button type="submit" color="primary" className="btn-block">
                  {modalType === "add" && "Thêm"} {modalType === "edit" && "Cập Nhật"}
                </Button>
              </div> */}
              <Col size="12">
                <ul className="text-end">
                  <li>
                    <Button color="primary" size="md" type="submit">
                      {modalType === "add" && "Thêm"} {modalType === "edit" && "Cập nhật"}
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
export default FormModal;
