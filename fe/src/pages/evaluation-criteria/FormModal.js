import React, { useEffect, useState } from "react";
import { Icon, Button, Col, RSelect } from "../../components/Component";
// import { settingTypeList, statusList } from "./SettingData";
import { Modal, ModalBody, Form } from "reactstrap";
import { useForm } from "react-hook-form";
import { isNullOrEmpty } from "../../utils/Utils";

const FormModal = ({ id, modal, setModal, modalType, criterias, setCriterias, updateData }) => {
  const ininialCriteria = {
    criteriaName: '',
    evalWeight: 1,
    locEvaluation: criterias.find(item => item.locEvaluation && item.id !== id) !== undefined ? 'InActive' : 'Active',
    active: 'Active',
    guides: '',
  };
  const [formData, setFormData] = useState(modalType === 'add' ? ininialCriteria : updateData);

  const closeModal = () => {
    setModal({add: false, edit: false});
    setFormData(ininialCriteria);
  }

  const validateInput = (sData) => {
    const { criteriaName, evalWeight, locEvaluation, active, guides } = sData;
    let existByName = criterias.find(criteria => 
      criteria.criteriaName.toLowerCase() === criteriaName.trim().toLowerCase()
      && criteria.id !== id
    );
    if(isNullOrEmpty(criteriaName.trim())){
      setError("criteriaName", { type: "manual", message: "Criteria name can't be blank" });
      return false;
    }
    else if(existByName) {
      setError("criteriaName", { type: "manual", message: "Criteria name already exists" });
      return false;
    }
    if(evalWeight < 0){
      setError("evalWeight", { type: "manual", message: "Eval Weight must be greater than zero" });
      return false;
    }
    return true;
  }

  const onSubmit = (sData) => {
    if(!validateInput(sData)){
      return false;
    }
    console.log('sData', sData);
    let updateCriterias = [...criterias];
    let updateCriteria = {
      id: id,
      criteriaName: sData.criteriaName,
      evalWeight: sData.evalWeight,
      locEvaluation: sData.locEvaluation === "Active",
      active: sData.active === "Active",
      guides: sData.guides, 
    };
    if(modalType === 'add'){
      updateCriterias.push(updateCriteria);
    } else if(modalType === 'edit'){
      let index = updateCriterias.findIndex(item => item.id === id);
      updateCriterias[index] = updateCriteria;
    }
    setCriterias(updateCriterias);
    closeModal();
  }

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
            {modalType === "add" && "Add Criteria"} {modalType === "edit" && "Update Criteria"}
          </h5>
          <div className="mt-4">
            <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Criteria Name*</label>
                  <input
                    type="text"
                    {...register("criteriaName", { required: "This field is required" })}
                    value={formData.criteriaName}
                    placeholder="Enter criteria name"
                    onChange={(e) => setFormData({ ...formData, criteriaName: e.target.value })}
                    className="form-control"
                  />
                  {errors.criteriaName && <span className="invalid">{errors.criteriaName.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Evaluation Weight (%)*</label>
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
                  <label className="form-label">LOC Evaluation</label>
                  <br />
                  <ul className="custom-control-group">
                    <li>
                      <div
                        style={{ height: 40 }}
                        className="custom-control custom-control-sm custom-radio custom-control-pro checked"
                      >
                        <input
                          disabled={criterias.find(item => item.locEvaluation) !== undefined}
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
                          Yes
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
                          name="btnRadioControlLOC"
                          id="btnRadioControl5LOC"
                          defaultChecked={formData.locEvaluation === "InActive"}
                          value={"InActive"}
                          onClick={(e) => {
                            setFormData({ ...formData, locEvaluation: e.target.value });
                          }}
                        />
                        <label className="custom-control-label" htmlFor="btnRadioControl5LOC">
                          No
                        </label>
                      </div>
                    </li>
                  </ul>
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
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
                          id="btnRadioControl1"
                          defaultChecked={formData.active === "Active" || modalType === "add"}
                          value={"Active"}
                          onClick={(e) => {
                            setFormData({ ...formData, active: e.target.value });
                          }}
                        />
                        <label className="custom-control-label" htmlFor="btnRadioControl1">
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
                          id="btnRadioControl5"
                          defaultChecked={formData.active === "InActive"}
                          value={"InActive"}
                          onClick={(e) => {
                            setFormData({ ...formData, active: e.target.value });
                          }}
                        />
                        <label className="custom-control-label" htmlFor="btnRadioControl5">
                          InActive
                        </label>
                      </div>
                    </li>
                  </ul>
                </div>
              </Col>
              <Col size="12">
                <div className="form-group">
                  <label className="form-label">Guides</label>
                  <textarea
                    value={formData.guides}
                    placeholder="Your guides"
                    onChange={(e) => setFormData({ ...formData, guides: e.target.value })}
                    className="form-control-xl form-control no-resize"
                  />
                </div>
              </Col>
              <Col size="12">
                <ul className=" text-end">
                  <li>
                    <Button color="primary" size="md" type="submit">
                      {modalType === "add" && "Add Criteria"} {modalType === "edit" && "Update Criteria"}
                    </Button>
                  </li>
                  {/* <li>
                    <Button
                      onClick={(ev) => {
                        ev.preventDefault();
                        closeModal();
                      }}
                      className="link link-light"
                    >
                      Cancel
                    </Button>
                  </li> */}
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
