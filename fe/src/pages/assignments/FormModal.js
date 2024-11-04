import React, { useEffect, useState } from "react";
import { Icon, Button, Col, RSelect } from "../../components/Component";
// import { settingTypeList, statusList } from "./SettingData";
import { Modal, ModalBody, Form, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import { useForm } from "react-hook-form";
import { evaluationTypes } from "../../data/ConstantData";
import { isNullOrEmpty, isNumber } from "../../utils/Utils";

const FormModal = ({ id, modal, setModal, assignments, setAssignments, modalType, updateData }) => {
  const initialAsm = {
    title: "",
    evalWeight: 1,
    expectedLoc: 1,
    typeEvaluator: null,
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
    const { title, evalWeight, expectedLoc, typeEvaluator, displayOrder, active, note } = sData;
    let existByTitle = assignments.find(
      (assignment) => assignment.title.toLowerCase() === title.trim().toLowerCase() && assignment.id !== id
    );
    if (isNullOrEmpty(title.trim())) {
      setError("title", { type: "manual", message: "Title can't be blank" });
      return false;
    } else if (existByTitle) {
      setError("title", { type: "manual", message: "Title already exists" });
      return false;
    }
    if (evalWeight < 0) {
      setError("evalWeight", { type: "manual", message: "Eval Weight must be greater than zero" });
      return false;
    }
    if (expectedLoc < 0) {
      setError("expectedLoc", { type: "manual", message: "Expected LOC must be greater than zero" });
      return false;
    }
    if (displayOrder < 0) {
      setError("displayOrder", { type: "manual", message: "Priority must be greater than zero" });
      return false;
    }
    if (assignments && assignments.length > 0) {
      let sortedAssignments = [...assignments].sort((a, b) => a.displayOrder - b.displayOrder);
      let message = "";
      sortedAssignments.forEach((a) => {
        let p1 = isNumber(a.displayOrder, 'int'), p2 = isNumber(displayOrder, 'int');
        if (
          typeEvaluator?.value === evaluationTypes[2].value &&
          p1 >= p2 &&
          (a.typeEvaluator === evaluationTypes[1].value || a.typeEvaluator === evaluationTypes[0].value)
        ) {
          message = "Priority must be greater than priority of " + a.title + ` (${a.displayOrder})`;
          return false;
        } else if (
          typeEvaluator?.value === evaluationTypes[1].value &&
          p1 >= p2 &&
          a.typeEvaluator === evaluationTypes[0].value
        ) {
          message = "Priority must be greater than priority of " + a.title + ` (${a.displayOrder})`;
          return false;
        } else if (
          typeEvaluator?.value === evaluationTypes[1].value &&
          p1 <= p2 &&
          a.typeEvaluator === evaluationTypes[2].value
        ) {
          message = "Priority must be less than priority of " + a.title + ` (${a.displayOrder})`;
          return false;
        } else if (
          typeEvaluator?.value === evaluationTypes[0].value &&
          p1 <= p2 &&
          (a.typeEvaluator === evaluationTypes[1].value || a.typeEvaluator === evaluationTypes[2].value)
        ) {
          message = "Priority must be less than priority of " + a.title + ` (${a.displayOrder})`;
          return false;
        }
      });
      if (message !== "") {
        setError("displayOrder", { type: "manual", message: message });
        return false;
      }
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
      typeEvaluator: sData?.typeEvaluator?.value,
    };

    if (modalType === "add") {
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
            {modalType === "add" && "Add Assignment"} {modalType === "edit" && "Update Assignment"}
          </h5>
          <div className="mt-4">
            <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Title*</label>
                  <input
                    type="text"
                    {...register("title", { required: "This field is required" })}
                    value={formData.title}
                    placeholder="Enter title"
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
                  <label className="form-label">Evaluation Weight* (%)</label>
                  <input
                    type="number"
                    {...register("evalWeight", { required: "This field is required" })}
                    value={formData.evalWeight}
                    placeholder="Enter evaluation weight"
                    onChange={(e) => setFormData({ ...formData, evalWeight: e.target.value })}
                    className="form-control"
                  />
                  {errors.evalWeight && <span className="invalid">{errors.evalWeight.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Expected LOC*</label>
                  <input
                    type="number"
                    value={formData.expectedLoc}
                    {...register("expectedLoc", { required: "This field is required" })}
                    placeholder="Enter expected loc"
                    onChange={(e) => setFormData({ ...formData, expectedLoc: e.target.value })}
                    className="form-control"
                  />
                  {errors.expectedLoc && <span className="invalid">{errors.expectedLoc.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Evaluation Type*</label>
                  <RSelect
                    options={evaluationTypes.filter((item) => {
                      const hasGrandFinal = assignments.some(
                        (assignment) => assignment.typeEvaluator === "Grand Final"
                      );
                      const hasFinal = assignments.some((assignment) => assignment.typeEvaluator === "Final");
                      if (hasGrandFinal && item.value === "Grand Final") {
                        return false;
                      }
                      if (hasFinal && item.value === "Final") {
                        return false;
                      }
                      return true;
                    })}
                    value={formData.typeEvaluator}
                    {...register("typeEvaluator", { required: "This field is required" })}
                    onChange={(e) => {
                      setFormData({ ...formData, typeEvaluator: e });
                    }}
                  />
                  {errors.typeEvaluator && <span className="invalid text-danger">{errors.typeEvaluator.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <input
                    type="number"
                    {...register("displayOrder", { required: "This field is required" })}
                    value={formData.displayOrder}
                    placeholder="Enter priority"
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="form-control"
                  />
                  {errors.displayOrder && <span className="invalid text-danger">{errors.displayOrder.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <label className="form-label">Status</label>
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
                        id="btnActiveAss"
                        defaultChecked={formData.active === "Active" || modalType === "add"}
                        value={"Active"}
                        onClick={(e) => setFormData({ ...formData, active: e.target.value })}
                      />
                      <label className="custom-control-label" htmlFor="btnActiveAss">
                        Active
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
                        id="btnInActiveAss"
                        defaultChecked={formData.active === "InActive"}
                        value={"InActive"}
                        onClick={(e) => setFormData({ ...formData, active: e.target.value })}
                      />
                      <label className="custom-control-label" htmlFor="btnInActiveAss">
                        InActive
                      </label>
                    </div>
                  </li>
                </ul>
              </Col>
              <Col size="12">
                <div className="form-group">
                  <label className="form-label">Note</label>
                  <textarea
                    value={formData.note}
                    placeholder="Your note"
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="form-control-xl form-control no-resize"
                  />
                </div>
              </Col>
              <Col size="12">
                <ul className=" text-end">
                  <li>
                    <Button color="primary" size="md" type="submit">
                      {modalType === "add" && "Add Assignment"} {modalType === "edit" && "Update Assignment"}
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
