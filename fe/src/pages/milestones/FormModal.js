import React, { forwardRef, useEffect, useState } from "react";
import { Icon, Button, Col, RSelect, Row } from "../../components/Component";
// import { settingTypeList, statusList } from "./SettingData";
import { Modal, ModalBody, Form, Nav, NavItem, NavLink, TabContent, TabPane, Label, Input } from "reactstrap";
import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import { convertToOptions, exportToExcel, generateExcel } from "../../utils/Utils";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import authApi from "../../utils/ApiAuth";
import ImportTeamsForm from "./ImportTeamsForm";

const ExampleCustomInput = forwardRef(({ value, onClick, onChange }, ref) => (
  <div onClick={onClick} ref={ref}>
    <div className="form-icon form-icon-left">
      <Icon name="calendar"></Icon>
    </div>
    <input className="form-control date-picker" type="text" value={value} onChange={onChange} />
  </div>
));

const FormModal = ({
  modal,
  closeModal,
  onSubmit,
  formData,
  setFormData,
  modalType,
  assignments,
  classId,
  isFetching,
  milestone,
  random,
  setRandom,
  setTypeImport,
  cloneMilestone,
  setCloneMilestone,
  inputFile,
  setInputFile,
}) => {
  useEffect(() => {
    reset(formData);
  }, [formData]);

  const setDateToFormData = (date, type, isStart) => {
    const newDate = new Date(isStart ? formData.startDate : formData.dueDate);
    if (type === "date") {
      newDate.setFullYear(date.getFullYear());
      newDate.setMonth(date.getMonth());
      newDate.setDate(date.getDate());
    } else if (type === "time") {
      newDate.setHours(date.getHours());
      newDate.setMinutes(date.getMinutes());
    }
    if (isStart)
      setFormData({
        ...formData,
        startDate: newDate,
      });
    else
      setFormData({
        ...formData,
        dueDate: newDate,
      });
  };

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="lg">
      <ModalBody>
        <ToastContainer />
        <a
          href="#cancel"
          onClick={(ev) => {
            if (isFetching) return false;
            ev.preventDefault();
            closeModal();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-2">
          <h5 className="title">
            {modalType === "add" && "Add Milestone"} {modalType === "edit" && "Update Milestone"}
            {modalType === "import" && "Nhập nhóm"}
          </h5>
          {/* {modalType === "import" && <p className="text-danger">If you change the set of teams, the set of teams for this milestone will differ from the set of teams for the previous milestone.</p>} */}
          <div className="mt-4">
            {modalType === "import" ? (
              <ImportTeamsForm
                milestone={{}}
                classId={classId}
                onSubmit={onSubmit}
                isFetching={isFetching}
                setFormData={setFormData}
                handleSubmit={handleSubmit}
                register={register}
                errors={errors}
                random={random}
                setRandom={setRandom}
                setTypeImport={setTypeImport}
                cloneMilestone={cloneMilestone}
                setCloneMilestone={setCloneMilestone}
                inputFile={inputFile}
                setInputFile={setInputFile}
              />
            ) : (
              <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
                {/* <Col md="12">
                  <div className="form-group">
                    <label className="form-label">Title*</label>
                    <input
                      type="text"
                      {...register("title", { required: "This field is required" })}
                      value={formData.title}
                      readOnly={true}
                      placeholder="Enter title"
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="form-control"
                    />
                    {errors.title && <span className="invalid">{errors.title.message}</span>}
                  </div>
                </Col> */}
                <Col md="6">
                  <Row>
                    <Col sm="6">
                      <div className="form-group">
                        <Label>Start Date*</Label>
                        <div className="form-control-wrap has-timepicker focused">
                          <DatePicker
                            style={{ zindex: "1050" }}
                            selected={formData.startDate}
                            className="form-control date-picker"
                            onChange={(date) => setDateToFormData(date, "date", true)}
                            customInput={<ExampleCustomInput />}
                          />
                        </div>
                      </div>
                    </Col>
                    <Col sm="6">
                      <div className="form-group">
                        <Label>Start Time*</Label>
                        <div className="form-control-wrap has-timepicker focused">
                          <DatePicker
                            selected={formData.startDate}
                            onChange={(date) => setDateToFormData(date, "time", true)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Time"
                            dateFormat="h:mm aa"
                            className="form-control date-picker"
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Col>
                <Col md="6">
                  <Row>
                    <Col sm="6">
                      <div className="form-group">
                        <Label>Due Date*</Label>
                        <div className="form-control-wrap has-timepicker focused">
                          <DatePicker
                            selected={formData.dueDate}
                            className="form-control date-picker"
                            onChange={(date) => setDateToFormData(date, "date", false)}
                            customInput={<ExampleCustomInput />}
                          />
                        </div>
                      </div>
                    </Col>
                    <Col sm="6">
                      <div className="form-group">
                        <Label>Due Time*</Label>
                        <div className="form-control-wrap has-timepicker focused">
                          <DatePicker
                            selected={formData.dueDate}
                            onChange={(date) => setDateToFormData(date, "time", false)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Time"
                            dateFormat="h:mm aa"
                            className="form-control date-picker"
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Col>
                {/* <Col md="6">
                  <div className="form-group">
                    <label className="form-label">Assignment*</label>
                    <RSelect
                      {...register("assignment", { required: "This field is required" })}
                      options={assignments}
                      value={formData.assignment}
                      onChange={(e) => setFormData({ ...formData, assignment: e })}
                    />
                    {errors.assignment && <span className="invalid text-danger">{errors.assignment.message}</span>}
                  </div>
                </Col> */}
                {/* <Col md="6">
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
                </Col> */}
                <Col size="12">
                  <div className="form-group">
                    <label className="form-label">Note</label>
                    <textarea
                      value={formData.note === null ? "" : formData.note}
                      placeholder="Your note"
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="form-control-xl form-control no-resize"
                    />
                  </div>
                </Col>
                {/* <Col md="6">
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
                </Col> */}
                <Col size="12">
                  <ul className=" text-end">
                    <li>
                      <Button color="primary" size="md" type="submit">
                        {modalType === "add" && "Add Milestone"} {modalType === "edit" && "Update Milestone"}
                        {modalType === "import" && "Import"}
                      </Button>
                    </li>
                  </ul>
                </Col>
              </Form>
            )}
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
export default FormModal;
