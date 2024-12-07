import React, { useEffect, useState } from "react";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  Input,
  Modal,
  ModalBody,
  Nav,
  NavItem,
  NavLink,
  Spinner,
  TabContent,
  TabPane,
  UncontrolledDropdown,
} from "reactstrap";
import { Button, Col, Icon, Row, RSelect } from "../../components/Component";
import authApi from "../../utils/ApiAuth";
import {
  convertToOptions,
  exportToExcel,
  generateExcel,
  generateTemplate,
  generateTemplateStudentEval,
  getValueByLabel,
  isEqual,
  isNullOrEmpty,
  isNumber,
  transformToOptions,
} from "../../utils/Utils";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import classnames from "classnames";
import { useForm } from "react-hook-form";

export default function ImportStudentEvalModal({ modal, setModal, rows, setRows, evaluations, teams, filterForm }) {
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [isFetching, setIsFetching] = useState(false);
  const [formData, setFormData] = useState([]);

  const handleFileUpload = (event) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log("JSON Data:", jsonData);
      setFormData(jsonData);
    };

    reader.readAsArrayBuffer(file);
  };

  const dowloadTemplate = async () => {
    await generateTemplateStudentEval(evaluations);
  };

  const isExistField = (obj, field) => {
    if (isNullOrEmpty(obj) || isNullOrEmpty(field)) return false;
    let isExist = false;
    Object.keys(obj).forEach((key) => {
      if (key === field) {
        isExist = true;
        return true;
      }
    });
    return isExist;
  };

  const onSubmit = async () => {
    if (!formData || formData.length === 0 || !evaluations || evaluations.length === 0) {
      toast.error(`Không có dữ liệu để đánh giá`, {
        position: toast.POSITION.TOP_CENTER,
      });
      return false;
    }
    let mileTitle = `${evaluations[0]?.milestone?.name} (${evaluations[0]?.milestone?.weight}%)`;
    let isValidTemplate = true;
    if (!isExistField(formData[0], mileTitle)) {
      toast.error(`File không đúng định dạng`, {
        position: toast.POSITION.TOP_CENTER,
      });
      return false;
    }
    if (evaluations[0]?.criteriaNames && evaluations[0]?.criteriaNames.length > 0) {
      evaluations[0].criteriaNames.forEach((criteria) => {
        let criteriaName = `${criteria.name} (${criteria?.weight}% của ${evaluations[0]?.milestone?.name})`;
        if (!isExistField(formData[0], criteriaName)) {
          isValidTemplate = false;
          return false;
        }
      });
      if (!isValidTemplate) {
        toast.error(`File không đúng định dạng`, {
          position: toast.POSITION.TOP_CENTER,
        });
        return false;
      }
    }
    setIsFetching(true);
    let changed = [];
    let updatedRows = [...rows];
    formData.forEach((item, index) => {
      let email = isNullOrEmpty(item["Email"]) ? null : item["Email"];
      let teamName = item["Nhóm"];
      let teamId = null;
      if (isNullOrEmpty(email)) {
        teamId = getValueByLabel(teams, teamName);
      }
      let milestoneEvalGrade = isNumber(item[mileTitle], "float");
      let milestoneComment = item[`Nhận xét`];
      let row = {
        email: email,
        teamName: teamName,
        milestoneEvalGrade: milestoneEvalGrade,
        milestoneComment: milestoneComment,
      };
      changed.push({
        teamId: teamId,
        milestoneId: evaluations[0]?.milestone?.id,
        criteriaId: null,
        email: email,
        comment: milestoneComment,
        evalGrade: milestoneEvalGrade,
      });
      if (evaluations[0]?.criteriaNames && evaluations[0]?.criteriaNames.length > 0) {
        evaluations[0].criteriaNames.forEach((criteria, idx) => {
          let criteriaName = `${criteria.name} (${criteria?.weight}% của ${evaluations[0]?.milestone?.name})`;
          let grade = isNumber(item[criteriaName], "float");
          row = {
            ...row,
            [`${criteria.id}_evalGrade`]: grade,
            [`${criteria.id}_comment`]: item[`Nhận xét ${criteria.name}`],
          };
          changed.push({
            teamId: teamId,
            milestoneId: evaluations[0]?.milestone?.id,
            criteriaId: criteria.id,
            email: email,
            comment: item[`Nhận xét ${criteria.name}`],
            evalGrade: grade,
          });
        });
      }
      let rowIdx = updatedRows.findIndex((r) => isEqual(r.email, email) && isEqual(r.teamName, teamName));
      if (rowIdx !== -1) {
        updatedRows[rowIdx] = {
          id: rowIdx,
          ...updatedRows[rowIdx],
          ...row,
        };
      }
    });

    if (changed && changed.length === 0) {
      toast.error(`Không có dữ liệu để đánh giá`, {
        position: toast.POSITION.TOP_CENTER,
      });
      setIsFetching(false);
      return false;
    }
    console.log("changed", changed);
    try {
      const response = await authApi.post("/evaluation/evaluate-student-eval-for-grand-final", {
        studentEvals: changed,
        sessionId: filterForm?.session?.value,
        teamId: filterForm?.team?.value,
      });
      if (response.data.statusCode === 200) {
        toast.success(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
        setRows(updatedRows);
        closeModal();
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error evaluating student:", error);
      toast.error("Xảy ra lỗi trong quá trình xử lý", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching(false);
    }
  };

  const closeModal = () => {
    setModal({ importEval: false });
    setFormData([]);
  };

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
          <h5 className="title">Nhập đánh giá sinh viên</h5>
          <div className="mt-4">
            <Row className="m-2 p-2">
              <Col sm="12" className="mb-2 text-end">
                <a
                  href="#download"
                  style={{ cursor: "pointer", fontSize: "16px", textDecoration: "underline" }}
                  className="text-primary"
                  onClick={() => dowloadTemplate()}
                >
                  <Icon name="file-download" /> Tải file mẫu
                </a>
              </Col>
              <Col sm="12">
                <label className="form-label">Nhập Excel File*</label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <Icon name="upload" />
                    </span>
                  </div>
                  <Input type="file" id="customFile" onChange={handleFileUpload} className="form-control" />
                </div>
              </Col>
              <Col className="mt-5" size="12">
                <ul className=" text-end">
                  <li>
                    {isFetching ? (
                      <Button disabled color="primary">
                        <Spinner size="sm" />
                        <span> Đang lưu... </span>
                      </Button>
                    ) : (
                      <Button color="primary" size="md" type="button" onClick={() => onSubmit()}>
                        Nhập
                      </Button>
                    )}
                  </li>
                </ul>
              </Col>
            </Row>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
