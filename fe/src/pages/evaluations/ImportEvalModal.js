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
  isNullOrEmpty,
  isNumber,
  transformToOptions,
} from "../../utils/Utils";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import classnames from "classnames";
import { useForm } from "react-hook-form";
import { evaluationTypes } from "../../data/ConstantData";

export default function ImportEvalModal({ modal, setModal, evaluations, setEvaluations, complexities, qualities, typeEvaluator, filterForm }) {
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
    await generateTemplate(evaluations, complexities, qualities, typeEvaluator);
  };

  const findComplexityByName = (name) => {
    if (!name) return null;
    return complexities.find((c) => c?.name === name)?.id;
  };

  const findQualityByName = (name) => {
    if (!name) return null;
    return qualities.find((c) => c?.name === name)?.id;
  };

  const onSubmit = async () => {
    if (!formData || formData.length === 0) {
      toast.error(`Không có dữ liệu để đánh giá`, {
        position: toast.POSITION.TOP_CENTER,
      });
      return false;
    }
    setIsFetching(true);
    let changed = [];
    let updatedEval = [...evaluations];

    formData.forEach((item) => {
      let id = isNumber(item["ID"], "int");
      if (id) {
        let complexityId = findComplexityByName(item["Độ khó"]);
        let qualityId = findQualityByName(item["Mức độ hoàn thiện"]);
        let comment = item["Nhận xét"];
        let loc = isNumber(item["LOC"], "float");
        let reqEval = {
          reqId: id,
          isUpdateEval: false,
          complexityId: complexityId,
          qualityId: qualityId,
          comment: comment,
          grade: loc,
        };
        complexityId = findComplexityByName(item["Cập nhật độ khó"]);
        qualityId = findQualityByName(item["Cập nhật mức độ hoàn thiện"]);
        comment = item["Cập nhật nhận xét"];
        loc = isNumber(item["Cập nhật LOC"], "float");
        let updateReqEval = {
          reqId: id,
          isUpdateEval: true,
          complexityId: complexityId,
          qualityId: qualityId,
          comment: comment,
          grade: loc,
        };
        let idx = updatedEval.findIndex((item) => item.id === id);
        if (idx !== -1) {
          updatedEval[idx] = {
            ...updatedEval[idx],
            requirementEval: reqEval,
            updateRequirementEval: updateReqEval,
          };
        }
        if(typeEvaluator === evaluationTypes[0].value){
          changed.push(reqEval);
        } else if(typeEvaluator === evaluationTypes[1].value){
          if(!isNullOrEmpty(updateReqEval?.grade)){
            changed.push(updateReqEval);
          } else if(!isNullOrEmpty(reqEval?.grade)){
            changed.push(reqEval);
          }
        }
      }
    });
    if (changed && changed.length === 0) {
      toast.error(`Không có dữ liệu để đánh giá`, {
        position: toast.POSITION.TOP_CENTER,
      });
      setIsFetching(false);
      return false;
    }
    console.log('changed', changed);
    try {
      const response = await authApi.post("/evaluation/evaluate-requirement/"+filterForm?.milestone?.value, changed);
      if (response.data.statusCode === 200) {
        toast.success(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
        setEvaluations(updatedEval);
        closeModal();
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error evaluating requirement:", error);
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
          <h5 className="title">Nhập đánh giá</h5>
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
                <label className="form-label">Nhập file excel*</label>
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
                        Nhập đánh giá
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
