import React, { useEffect } from "react";
import { Icon, Button, Col, RSelect } from "../../components/Component";
import { Modal, ModalBody, Form, Spinner, Input } from "reactstrap";
import { useForm } from "react-hook-form";
import defaultAvatar from "../../images/default-avatar.webp";

const FormModal = ({ modal, closeModal, onSubmit, formData, setFormData, modalType, isLoading }) => {
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
            <img
              width="50"
              height="50"
              src={
                formData.avatar
                  ? URL.createObjectURL(formData.avatar) // Ưu tiên avatar nếu tồn tại
                  : formData.avatar_url || defaultAvatar // Sử dụng avatar_url nếu có, ngược lại là defaultAvatar
              }
              alt="Avatar"
            />
            {modalType === "add" && "Thêm giảng viên"} {modalType === "edit" && "Cập Nhật giảng viên"}
          </h5>
          <div className="mt-4">
            <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Tên giảng viên*</label>
                  <input
                    type="text"
                    {...register("fullname", { required: "Trường này là bắt buộc" })}
                    value={formData.fullname}
                    placeholder="Nhập tên giảng viên"
                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                    className="form-control"
                  />
                  {errors.name && <span className="invalid">{errors.name.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Email*</label>
                  <input
                    type="email"
                    {...register("email", { required: "Trường này là bắt buộc" })}
                    value={formData.email}
                    placeholder="Nhập email"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-control"
                  />
                  {errors.email && <span className="invalid">{errors.email.message}</span>}
                </div>
              </Col>
              <Col sm="6">
                <label className="form-label">Ảnh đại diện</label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <Icon name="upload" />
                    </span>
                  </div>
                  <Input
                    type="file"
                    id="customFile"
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.files[0] })}
                    className="form-control"
                  />
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.mobile}
                    placeholder="Nhập số điện thoại"
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="form-control"
                  />
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Giới tính</label>
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
                          defaultChecked={formData.gender === "Nam" || modalType === "add"}
                          value={"Nam"}
                          onClick={(e) => {
                            setFormData({ ...formData, gender: e.target.value });
                          }}
                        />
                        <label className="custom-control-label" htmlFor="btnRadioControl1">
                          Nam
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
                          defaultChecked={formData.gender === "Nữ"}
                          value={"Nữ"}
                          onClick={(e) => {
                            setFormData({ ...formData, gender: e.target.value });
                          }}
                        />
                        <label className="custom-control-label" htmlFor="btnRadioControl5">
                          Nữ
                        </label>
                      </div>
                    </li>
                  </ul>
                </div>
              </Col>
              <Col md="6">
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
                          name="btnRadioControla"
                          id="btnRadioControl1w"
                          defaultChecked={formData.active === "Active" || modalType === "add"}
                          value={"Active"}
                          onClick={(e) => {
                            setFormData({ ...formData, active: e.target.value });
                          }}
                        />
                        <label className="custom-control-label" htmlFor="btnRadioControl1w">
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
                          name="btnRadioControla"
                          id="btnRadioControl5a"
                          defaultChecked={formData.active === "InActive"}
                          value={"InActive"}
                          onClick={(e) => {
                            setFormData({ ...formData, active: e.target.value });
                          }}
                        />
                        <label className="custom-control-label" htmlFor="btnRadioControl5a">
                          Không hoạt động
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
                    placeholder="Ghi chú của bạn"
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="form-control-xl form-control no-resize"
                  />
                </div>
              </Col>
              <Col size="12">
                <ul className=" text-end">
                  <li>
                    {isLoading ? (
                      <Button disabled color="primary">
                        <Spinner size="sm" />
                        <span> Đang lưu... </span>
                      </Button>
                    ) : (
                      <Button color="primary" size="md" type="submit">
                        {modalType === "add" && "Thêm"} {modalType === "edit" && "Cập Nhật"}
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
