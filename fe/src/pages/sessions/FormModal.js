import React, { useEffect } from "react";
import { Icon, Button, Col, RSelect } from "../../components/Component";
import { settingTypeList, statusList } from "./SettingData";
import { Modal, ModalBody, Form, Spinner } from "reactstrap";
import { useForm } from "react-hook-form";
import { getOnlyDate, getOnlyDate2, isNullOrEmpty } from "../../utils/Utils";

const FormModal = ({
  modal,
  closeModal,
  onSubmit,
  formData,
  setFormData,
  modalType,
  rounds,
  filterForm,
  isFetching,
  canEdit,
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

  const formatDateToDDMMYYYY = (dateString) => {
    if (isNullOrEmpty(dateString)) return "";
    let seperator = "-";
    if (dateString.includes("/")) {
      seperator = "/";
    }
    let [y, m, d] = dateString.split(seperator);
    return `${m}/${d}/${y}`;
  };

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="lg">
      <ModalBody>
        <a
          href="#cancel"
          onClick={(ev) => {
            ev.preventDefault();
            if (!isFetching) closeModal();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-2">
          <h5 className="title">{modalType === "add" ? "Thêm mới" : "Chi tiết"}</h5>
          <div className="mt-4">
            <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Phiên đánh giá</label>
                  <input
                    readOnly={true}
                    type="text"
                    value={formData.name}
                    placeholder="Nhập tên"
                    className="form-control"
                  />
                </div>
              </Col>
              <Col md="6">
                {!canEdit ? (
                  <div className="fw-bold mt-4" style={{ fontSize: "20px" }}>
                    <p>{filterForm?.round?.label}</p>
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Lần đánh giá*</label>
                    <RSelect
                      {...register("round", { required: "Trường này là bắt buộc" })}
                      options={rounds}
                      value={formData.round || filterForm?.round}
                      onChange={(e) => setFormData({ ...formData, round: e })}
                    />
                    {errors.round && <span className="invalid text-danger">{errors.round.message}</span>}
                  </div>
                )}
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Ngày (mm/dd/yyyy)*</label>
                  <input
                    disabled={!canEdit}
                    type="date"
                    {...register("sessionDate", { required: "Trường này là bắt buộc" })}
                    value={formData?.sessionDate}
                    placeholder="Nhập ngày"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        sessionDate: e.target.value,
                        name: `${formatDateToDDMMYYYY(e.target.value)}_${formData?.time === "Active" ? "AM" : "PM"}`,
                      });
                    }}
                    className="form-control"
                  />
                  {errors.sessionDate && <span className="invalid">{errors.sessionDate.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Sáng/Chiều</label>
                  <br />
                  <ul className="custom-control-group">
                    <li>
                      <div
                        style={{ height: 40 }}
                        className="custom-control custom-control-sm custom-radio custom-control-pro checked"
                      >
                        <input
                          disabled={!canEdit}
                          type="radio"
                          className="custom-control-input"
                          name="btnRadioControl"
                          id="btnRadioControl1"
                          defaultChecked={formData.time === "Active" || modalType === "add"}
                          value={"Active"}
                          onClick={(e) => {
                            setFormData({
                              ...formData,
                              time: e.target.value,
                              name: `${formatDateToDDMMYYYY(formData.sessionDate)}_AM`,
                            });
                          }}
                        />
                        <label className="custom-control-label" htmlFor="btnRadioControl1">
                          Sáng
                        </label>
                      </div>
                    </li>
                    <li>
                      <div
                        style={{ height: 40 }}
                        className="custom-control custom-control-sm custom-radio custom-control-pro"
                      >
                        <input
                          disabled={!canEdit}
                          type="radio"
                          className="custom-control-input"
                          name="btnRadioControl"
                          id="btnRadioControl5"
                          defaultChecked={formData.time === "InActive"}
                          value={"InActive"}
                          onClick={(e) => {
                            setFormData({
                              ...formData,
                              time: e.target.value,
                              name: `${formatDateToDDMMYYYY(formData.sessionDate)}_PM`,
                            });
                          }}
                        />
                        <label className="custom-control-label" htmlFor="btnRadioControl5">
                          Chiều
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
                    disabled={!canEdit}
                    value={formData.note}
                    placeholder="Nhập ghi chú"
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="form-control-xl form-control no-resize"
                  />
                </div>
              </Col>
              <Col size="12">
                <ul className=" text-end">
                  {canEdit && (
                    <li>
                      {isFetching ? (
                        <Button disabled color="primary">
                          <Spinner size="sm" />
                          <span> Đang gửi... </span>
                        </Button>
                      ) : (
                        <Button color="primary" size="md" type="submit">
                          Gửi
                        </Button>
                      )}
                    </li>
                  )}
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
