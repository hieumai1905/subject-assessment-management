import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Icon, Button, Col, RSelect } from "../../components/Component";
import { typeList, statusList, managerList } from "./SubjectData";
import { Modal, ModalBody, Form, Spinner } from "reactstrap";
import { useForm } from "react-hook-form";
import useQueryUser from "../../hooks/UseQuerryUser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import authApi from "../../utils/ApiAuth";
import { transformToOptions } from "../../utils/Utils";

const FormModal = ({
  modal,
  closeModal,
  onSubmit,
  formData,
  setFormData,
  modalType,
  users,
  selectedManager,
  setSelectedManager,
  changeSelectedManager,
  isLoading,
}) => {
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
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="xl">
      <ModalBody>
        <a
          href="#cancel"
          onClick={(ev) => {
            ev.preventDefault();
            if (!isLoading) closeModal();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-2">
          <h5 className="title">
            {modalType === "add" && "Thêm mới môn học"} {modalType === "edit" && "Cập nhật môn học"}
          </h5>
          <div className="mt-4">
            <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Tên môn học</label>
                  <input
                    type="text"
                    {...register("name", { required: "Trường này là bắt buộc" })}
                    value={formData.name}
                    placeholder="Nhập tên môn học"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-control"
                  />
                  {errors.name && <span className="invalid">{errors.name.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Mã môn học</label>
                  <input
                    type="text"
                    {...register("code", { required: "Trường này là bắt buộc" })}
                    value={formData.code}
                    placeholder="Nhập mã môn học"
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="form-control"
                  />
                  {errors.code && <span className="invalid">{errors.code.message}</span>}
                </div>
              </Col>
              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Quản lý</label>
                  <RSelect
                    options={transformToOptions(users)}
                    value={formData.managerIds}
                    isMulti
                    onChange={(e) => {
                      setFormData({ ...formData, managerIds: e });
                    }}
                  />
                </div>
              </Col>
              {/* <Col md="6">
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
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
                          defaultChecked={formData.isActive === "Active" || modalType === "add"}
                          value={"Active"}
                          onClick={(e) => {
                            setFormData({ ...formData, isActive: e.target.value });
                          }}
                        />
                        <label className="custom-control-label" htmlFor="btnRadioControl1">
                          Hoạt động
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
                          Không hoạt động
                        </label>
                      </div>
                    </li>
                  </ul>
                </div>
              </Col> */}
              <Col md="6">
                <div className="form-group">
                  {/* <label className="form-label">Trạng thái</label> */}
                  <div className="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="isActiveCheckbox"
                      checked={formData.isActive == "Active" || modalType == "add"}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked ? "Active" : "InActive" })}
                    />
                    <label className="custom-control-label" htmlFor="isActiveCheckbox">
                      Môn học này có đang hoạt động?
                    </label>
                  </div>
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  {/* <label className="form-label">Chấm hội đồng</label> */}
                  <div className="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="isCouncilCheckbox"
                      checked={formData.isCouncil}
                      onChange={(e) => setFormData({ ...formData, isCouncil: e.target.checked })}
                    />
                    <label className="custom-control-label" htmlFor="isCouncilCheckbox">
                      Môn học này có chấm hội đồng
                    </label>
                  </div>
                </div>
              </Col>

              <Col size="12">
                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea
                    value={formData.description}
                    placeholder="Nhập mô tả"
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-control-xl form-control no-resize"
                  />
                </div>
              </Col>
              <Col size="12">
                <ul className="text-end">
                  <li>
                    {isLoading ? (
                      <Button disabled color="primary">
                        <Spinner size="sm" />
                        <span> Đang lưu... </span>
                      </Button>
                    ) : (
                      <Button color="primary" size="md" type="submit">
                        {modalType === "add" && "Thêm"} {modalType === "edit" && "Cập nhật"}
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
