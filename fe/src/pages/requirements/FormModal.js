import React, { forwardRef, useEffect, useState } from "react";
import { Icon, Button, Col, RSelect, Row } from "../../components/Component";
// import { settingTypeList, statusList } from "./SettingData";
import { Modal, ModalBody, Form, Nav, NavItem, NavLink, TabContent, TabPane, Label, Input, Spinner } from "reactstrap";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import authApi from "../../utils/ApiAuth";
import { requirementStatuses } from "../../data/ConstantData";

const FormModal = ({
  modal,
  closeModal,
  formData,
  setFormData,
  modalType,
  role,
  data,
  milestone,
  teams,
  currentTeam,
  complexities,
  setData,
  editIds,
  members,
  setTotalItems,
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
  const [isFetching, setIsFetching] = useState(false);
  const [sTeams, setSTeams] = useState(teams || []);

  const onSubmit = (sData) => {
    if (modalType === "add") {
      addRequirements(sData);
    } else if (modalType === "edit") {
      editRequirements(sData);
    }
  };

  const addRequirements = async (sData) => {
    try {
      console.log("add sData", sData);
      setIsFetching(true);
      const { reqTitle, reqType, complexity, teams, note } = sData;
      const response = await authApi.post("/requirements", {
        milestoneId: milestone?.id,
        teamIds: teams.map((t) => t.value),
        reqTitle: reqTitle,
        note: note,
        complexityId: complexity?.value,
      });
      console.log("add reqs: ", response.data.data);
      if (response.data.statusCode === 200) {
        setData((prev) => [...response.data.data, ...prev]);
        setTotalItems((prev) => prev + response.data.data.length);
        closeModal();
        toast.success(`Thêm yêu cầu thành công`, {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
      setIsFetching(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi thêm yêu cầu", {
        position: toast.POSITION.TOP_CENTER,
      });
      setIsFetching(false);
    }
  };

  const editRequirements = async (sData) => {
    console.log("edit sData: ", sData, editIds);
    try {
      setIsFetching(true);
      const { reqTitle, reqType, complexity, status, note, student } = sData;
      const response = await authApi.put("/requirements", {
        status: status?.value,
        reqTitle: reqTitle,
        note: note,
        complexityId: complexity?.value,
        requirementIds: editIds,
        studentId: student?.value,
      });
      console.log("edit reqs: ", response.data.data);
      if (response.data.statusCode === 200) {
        let updatedData = data;
        response.data.data.forEach((element) => {
          let index = updatedData.findIndex((item) => item.id === element.id);
          updatedData[index] = element;
        });
        setData(updatedData);
        closeModal();
        toast.success(`Cập nhật yêu cầu thành công`, {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
      setIsFetching(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi cập nhật yêu cầu", {
        position: toast.POSITION.TOP_CENTER,
      });
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (currentTeam && teams && role === "STUDENT") {
      setSTeams(teams?.filter((item) => item.value === currentTeam?.value));
    }
  }, [currentTeam, teams, role]);

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
            {modalType === "add" && "Thêm Yêu Cầu"}
            {modalType === "edit" && "Cập Nhật Yêu Cầu"}
            {modalType === "import" && "Nhập Yêu Cầu"}
          </h5>
          <div className="mt-4">
            <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
              {modalType === "edit" && <span className="text-info">Bạn chỉ cần nhập các trường muốn chỉnh sửa</span>}
              {modalType === "add" && (
                <Col md="12">
                  <div className="form-group">
                    <label className="form-label">Tiêu Đề*</label>
                    <input
                      type="text"
                      {...register("reqTitle", { required: "Trường này là bắt buộc" })}
                      value={formData.reqTitle}
                      placeholder="Nhập tiêu đề"
                      onChange={(e) => setFormData({ ...formData, reqTitle: e.target.value })}
                      className="form-control"
                    />
                    {errors.reqTitle && <span className="invalid">{errors.reqTitle.message}</span>}
                  </div>
                </Col>
              )}
              {modalType === "edit" && members.length > 0 && (
                <Col md="12">
                  <div className="form-group">
                    <label className="form-label">Học Sinh</label>
                    <RSelect
                      options={members}
                      value={formData.student}
                      onChange={(e) => setFormData({ ...formData, student: e })}
                    />
                  </div>
                </Col>
              )}
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Độ Phức Tạp</label>
                  <RSelect
                    options={complexities}
                    value={formData.complexity}
                    onChange={(e) => setFormData({ ...formData, complexity: e })}
                  />
                </div>
              </Col>
              {modalType === "add" && (
                <Col md="12">
                  <div className="form-group">
                    <label className="form-label">Đội Nhóm*</label>
                    <RSelect
                      {...register("teams", { required: "Trường này là bắt buộc" })}
                      options={sTeams}
                      isMulti
                      value={formData.teams}
                      onChange={(e) => setFormData({ ...formData, teams: e })}
                    />
                    {errors.teams && <span className="invalid text-danger">{errors.teams.message}</span>}
                  </div>
                </Col>
              )}
              {modalType === "edit" && (
                <Col md="6">
                  <div className="form-group">
                    <label className="form-label">Trạng Thái</label>
                    <RSelect
                      options={requirementStatuses}
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e })}
                    />
                  </div>
                </Col>
              )}
              <Col size="12">
                <div className="form-group">
                  <label className="form-label">Ghi Chú</label>
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
                    {isFetching ? (
                      <Button disabled color="primary">
                        <Spinner size="sm" />
                        <span> Đang Lưu... </span>
                      </Button>
                    ) : (
                      <>
                        <Button
                          className="me-2"
                          color="secondary"
                          size="md"
                          type="button"
                          onClick={() => {
                            if (modalType === "add") {
                              setFormData({
                                reqTitle: "",
                                reqType: "",
                                complexity: null,
                                teams: null,
                                note: "",
                              });
                            } else if (modalType === "edit") {
                              setFormData({
                                reqTitle: "",
                                reqType: "",
                                complexity: null,
                                status: null,
                                note: "",
                                student: null,
                              });
                            }
                          }}
                        >
                          Đặt Lại
                        </Button>
                        <Button color="primary" size="md" type="submit">
                          {modalType === "add" && "Thêm Yêu Cầu"}
                          {modalType === "edit" && "Cập Nhật Yêu Cầu"}
                        </Button>
                      </>
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
