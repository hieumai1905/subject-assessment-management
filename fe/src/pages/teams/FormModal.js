import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Icon, Button, Col, RSelect } from "../../components/Component";
import { Modal, ModalBody, Form, Spinner } from "reactstrap";
import { useForm } from "react-hook-form";
import "react-toastify/dist/ReactToastify.css";

const FormModal = ({ modal, closeModal, onSubmit, formData, setFormData, modalType, users, isSubmitting }) => {
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
            {modalType === "add" && "Add Team"} {modalType === "edit" && "Update Team"}
          </h5>
          <div className="mt-4">
            <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Team Name*</label>
                  <input
                    type="text"
                    {...register("teamName", { required: "This field is required" })}
                    value={formData.teamName}
                    placeholder="Enter team name"
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    className="form-control"
                  />
                  {errors.teamName && <span className="invalid">{errors.teamName.message}</span>}
                </div>
              </Col>
              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Topic Name</label>
                  <input
                    type="text"
                    value={formData.topicName}
                    placeholder="Enter topic name"
                    onChange={(e) => setFormData({ ...formData, topicName: e.target.value })}
                    className="form-control"
                  />
                </div>
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
                <ul className="text-end">
                  <li>
                    {isSubmitting ? (
                      <Button disabled color="primary">
                        <Spinner size="sm" />
                        <span> Saving... </span>
                      </Button>
                    ) : (
                      <Button color="primary" size="md" type="submit">
                        {modalType === "add" && "Add Team"} {modalType === "edit" && "Update Team"}
                      </Button>
                    )}
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