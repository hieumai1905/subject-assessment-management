import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Icon, Button, Col, RSelect } from "../../components/Component";
import { typeList, statusList, managerList } from "./SubjectData";
import { Modal, ModalBody, Form } from "reactstrap";
import { useForm } from "react-hook-form";
import useQueryUser from "../../hooks/UseQuerryUser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import authApi from "../../utils/ApiAuth";
import { transformToOptions } from "../../utils/Utils";

const FormModal = ({ modal, closeModal, onSubmit, 
  formData, setFormData, modalType, users,
  selectedManager, setSelectedManager, changeSelectedManager }) => {

  useEffect(() => {
    reset(formData);
  }, [formData]);



  const {
    reset,
    register,
    handleSubmit,
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
            {modalType === "add" && "Add Subject"} {modalType === "edit" && "Update Subject"}
          </h5>
          <div className="mt-4">
            <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Subject Name</label>
                  <input
                    type="text"
                    {...register("name", { required: "This field is required" })}
                    value={formData.name}
                    placeholder="Enter name"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-control"
                  />
                  {errors.name && <span className="invalid">{errors.name.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Subject Code</label>
                  <input
                    type="text"
                    {...register("code", { required: "This field is required" })}
                    value={formData.code}
                    placeholder="Enter code"
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="form-control"
                  />
                  {errors.code && <span className="invalid">{errors.code.message}</span>}
                </div>
              </Col>
              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Manager</label>
                  <RSelect
                    options={transformToOptions(users)}
                    value={formData.managerIds}
                    isMulti
                    onChange={(e) => {
                      setFormData({ ...formData, managerIds: e })
                    }}
                  />
                </div>
              </Col>
              {/* <Col md="6">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <RSelect
                    options={statusList}
                    value={[{ value: formData.isActive, label: formData.isActive }]}
                    onChange={(e) => setFormData({ ...formData, isActive: e.value })}
                  />
                </div>
              </Col> */}
              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Status</label><br/>
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
                          defaultChecked={formData.isActive === "Active" || modalType === "add"}
                          value={"Active"}
                          onClick={(e) => {
                            setFormData({ ...formData, isActive: e.target.value });
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
                          defaultChecked={formData.isActive === "InActive"}
                          value={"InActive"}
                          onClick={(e) => {
                            setFormData({ ...formData, isActive: e.target.value });
                          }}
                        />
                        <label className="custom-control-label" htmlFor="btnRadioControl5">
                          Inactive
                        </label>
                      </div>
                    </li>
                  </ul>
                </div>
              </Col>
              <Col size="12">
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    // {...register("description", { required: "This field is required" })}
                    value={formData.description}
                    placeholder="Your description"
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-control-xl form-control no-resize"
                  />
                  {/* {errors.description && <span className="invalid">{errors.description.message}</span>} */}
                </div>
              </Col>
              <Col size="12">
                <ul className="text-end">
                  <li>
                    <Button color="primary" size="md" type="submit">
                      {modalType === "add" && "Add Subject"} {modalType === "edit" && "Update Subject"}
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
