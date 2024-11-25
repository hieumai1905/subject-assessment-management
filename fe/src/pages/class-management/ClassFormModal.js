import React, { useEffect, useRef, useState } from "react";
import { Icon, Button, Col, RSelect, Row } from "../../components/Component";
import { Modal, ModalBody, Form, Input, Spinner } from "reactstrap";
import { useForm } from "react-hook-form";
import "react-toastify/dist/ReactToastify.css";
import { generateExcel, isNullOrEmpty, transformToOptions } from "../../utils/Utils";
import authApi from "../../utils/ApiAuth";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

const ClassFormModal = ({
  modal,
  closeModal,
  onSubmit,
  formData,
  setFormData,
  modalType,
  semesters,
  subjects,
  isFetching,
  selectedManager,
  setSelectedManager,
  errImportList,
  changeSelectedManager,
  isLoading,
  students
}) => {
  useEffect(() => {
    reset(formData);
  }, [formData]);

  const [subjectTeachers, selectedTeachers] = useState([]);
  const fileInputRef = useRef("");

  useEffect(() => {
    console.log("e", errImportList);
    if (errImportList && errImportList.length > 0) {
      setfileInput("");
    }
  }, [errImportList]);

  useEffect(() => {
    const fetchSubjectTeachers = async () => {
      if (!formData?.subject) return false;
      try {
        const response = await authApi.post("/subjects/search-subject-teachers", {
          pageSize: 9999,
          subjectId: formData?.subject?.value,
          type: "added",
        });
        console.log("Giáo viên của môn học:", response.data.data);
        if (response.data.statusCode === 200) {
          selectedTeachers(transformToOptions(response.data.data));
          if (response.data.data.length > 0) {
            if (modalType === "edit" && formData?.teacher) {
              response.data.data.forEach((st) => {
                if (st?.id === formData?.teacher?.value) {
                  setFormData({
                    ...formData,
                    teacher: {
                      value: st.id,
                      label: `${st.fullname} (${st.username})`,
                    },
                  });
                  return false;
                }
              });
            } else {
              setFormData({
                ...formData,
                teacher: {
                  value: response.data.data[0].id,
                  label: `${response.data.data[0].fullname} (${response.data.data[0].username})`,
                },
              });
            }
          } else {
            setFormData({ ...formData, teacher: null });
          }
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        toast.error("Lỗi tìm kiếm giáo viên của môn học!", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    };

    fetchSubjectTeachers();
  }, [formData?.subject]);

  const [fileInput, setfileInput] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    setfileInput(file.filename);
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      if(jsonData){
        setFormData(jsonData.map((row) => ({
          code: row["Mã học sinh"],
          fullname: row["Họ và Tên"],
          email: row["Email"],
        })));
      }
      console.log("JSON Data:", jsonData, formData);
      
    };

    reader.readAsArrayBuffer(file);
    fileInputRef.current.value = "";
  };

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
            closeModal();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-2">
          <h5 className="title">
            {modalType === "add" && "Thêm Lớp Học"}
            {modalType === "edit" && "Cập Nhật Lớp Học"}
            {modalType === "import" && "Nhập Học Sinh"}
          </h5>
          <div className="mt-4">
            {modalType === "import" ? (
              <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
                <Row className="m-3 p-2">
                  <Col sm="12" className="mb-2 text-end">
                    <a
                      href="#download"
                      style={{ cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}
                      className="text-primary"
                      onClick={() => generateExcel(students)}
                    >
                      <Icon name="file-download" /> Tải Mẫu File
                    </a>
                  </Col>
                  <Col sm="12">
                    <label className="form-label">Tải Tệp Excel</label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <Icon name="upload" />
                        </span>
                      </div>
                      <Input
                        type="file"
                        id="customFile"
                        onChange={handleFileUpload}
                        className="form-control"
                        value={fileInput}
                      />
                    </div>
                  </Col>
                  <Col sm="12">
                    {errImportList.length > 0 && (
                      <div className="form-group mt-4">
                        <div
                          style={{
                            backgroundColor: "#f8d7da",
                            border: "1px solid #f5c6cb",
                            padding: "15px",
                            borderRadius: "5px",
                            color: "#721c24",
                          }}
                        >
                          <h6 style={{ margin: "0 0 10px 0", fontSize: "16px", fontWeight: "bold" }}>
                            <Icon name="alert-circle" style={{ marginRight: "8px", verticalAlign: "middle" }} />
                            Lỗi khi nhập danh sách học sinh!
                          </h6>
                          <div
                            style={{
                              maxHeight: "260px",
                              overflowY: "auto",
                              padding: "5px 10px",
                              backgroundColor: "#f1b0b7",
                              borderRadius: "5px",
                            }}
                          >
                            {errImportList.map((item, index) => (
                              <div
                                key={index}
                                style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}
                              >
                                <span style={{ flex: "1", textAlign: "left", marginLeft: "10px" }}>
                                  {index + 1}. {item.email}
                                </span>

                                <span style={{ flex: "1", textAlign: "right", marginRight: "10px" }}>
                                  {item.errorDetails}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </Col>
                </Row>
                <Row className="m-3 p-2 text-end">
                  <Col sm="12">
                    {isFetching ? (
                      <Button type="button" color="gray" disabled>
                        Đang nhập...
                      </Button>
                    ) : (
                      <Button color="success" size="md" type="submit">
                        <Icon name="upload-cloud" className="me-2" />
                        {modalType === "import" && "Nhập"}
                      </Button>
                    )}
                  </Col>
                </Row>
              </Form>
            ) : (
              <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
                <Col md="6">
                  <div className="form-group">
                    <label className="form-label">Học Kỳ*</label>
                    <RSelect
                      options={semesters}
                      value={formData.semester}
                      {...register("semester", { required: "Trường này là bắt buộc" })}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          semester: e,
                          name: `${formData?.subject?.label || ""} - ${
                            e?.label || ""
                          } - ${new Date().getFullYear()} - ${formData?.code || ""}`,
                        });
                      }}
                    />
                    {errors.semester && <span className="invalid text-danger">{errors.semester.message}</span>}
                  </div>
                </Col>

                <Col md="6">
                  <div className="form-group">
                    <label className="form-label">Môn Học*</label>
                    <RSelect
                      options={subjects}
                      value={formData.subject}
                      {...register("subject", { required: "Trường này là bắt buộc" })}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          subject: e,
                          name: `${e?.label || ""} - ${
                            formData?.semester?.label || ""
                          } - ${new Date().getFullYear()} - ${formData?.code || ""}`,
                        });
                      }}
                    />
                    {errors.subject && <span className="invalid text-danger">{errors.subject.message}</span>}
                  </div>
                </Col>

                <Col md="6">
                  <div className="form-group">
                    <label className="form-label">Mã Lớp*</label>
                    <input
                      type="text"
                      {...register("code", { required: "Trường này là bắt buộc" })}
                      value={formData.code}
                      placeholder="Nhập mã lớp"
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          code: e.target.value,
                          name: `${formData?.subject?.label || ""} - ${
                            formData?.semester?.label || ""
                          } - ${new Date().getFullYear()} - ${e.target.value}`,
                        });
                      }}
                      className="form-control"
                    />
                    {errors.code && <span className="invalid">{errors.code.message}</span>}
                  </div>
                </Col>
                <Col md="6">
                  <div className="form-group">
                    <label className="form-label">Tên Lớp*</label>
                    <input
                      type="text"
                      readOnly={true}
                      {...register("name", { required: "Trường này là bắt buộc" })}
                      value={formData.name}
                      placeholder="Tên lớp sẽ tự động tạo"
                      className="form-control"
                    />
                    {errors.name && <span className="invalid">{errors.name.message}</span>}
                  </div>
                </Col>

                <Col md="6">
                  <div className="form-group">
                    <label className="form-label">Giáo Viên</label>
                    <RSelect
                      options={subjectTeachers}
                      value={formData.teacher}
                      onChange={(e) => {
                        setFormData({ ...formData, teacher: e });
                      }}
                    />
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
                            id="btnClassRadioControl1"
                            defaultChecked={formData.active === "Active" || modalType === "add"}
                            value={"Active"}
                            onClick={(e) => {
                              setFormData({ ...formData, active: e.target.value });
                            }}
                          />
                          <label className="custom-control-label" htmlFor="btnClassRadioControl1">
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
                            id="btnClassRadioControl5"
                            defaultChecked={formData.active === "InActive"}
                            value={"InActive"}
                            onClick={(e) => {
                              setFormData({ ...formData, active: e.target.value });
                            }}
                          />
                          <label className="custom-control-label" htmlFor="btnClassRadioControl5">
                            Không Hoạt Động
                          </label>
                        </div>
                      </li>
                    </ul>
                  </div>
                </Col>
                <Col size="12">
                  <div className="form-group">
                    <label className="form-label">Mô Tả</label>
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
                          {modalType === "add" && "Thêm Lớp Học"}
                          {modalType === "edit" && "Cập Nhật"}
                        </Button>
                      )}
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

export default ClassFormModal;
