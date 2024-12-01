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
import { convertToOptions, exportToExcel, transformToOptions } from "../../utils/Utils";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import classnames from "classnames";
import { useForm } from "react-hook-form";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function ImportRequirementsForm({
  setTotalItems,
  milestone,
  closeModal,
  formData,
  setFormData,
  teams,
  data,
  setData,
  complexities,
  modal,
  currentTeam,
  role,
}) {
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
  const [inputFile, setInputFile] = useState("");
  const [sTeams, setSTeams] = useState(teams || []);

  useEffect(() => {
    if (currentTeam && teams && role === "STUDENT") {
      if (currentTeam?.value) {
        setSTeams(teams?.filter((item) => item.value === currentTeam?.value));
      } else {
        setSTeams([]);
      }
    }
  }, [currentTeam, teams, role]);

  const handleFileUpload = (event) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    const reader = new FileReader();
    setInputFile(file.filename);
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log("JSON Data:", jsonData);
      setFormData({ ...formData, data: jsonData });
    };

    reader.readAsArrayBuffer(file);
  };
  const dowloadTemplate = async (teamId) => {
    try {
      const response = await authApi.post("/requirements/search", {
        milestoneId: milestone?.id,
        teamId: teamId,
      });
      console.log("search requirements:", response.data.data);
      if (response.data.statusCode === 200) {
        let templateData = response.data.data.requirementDTOs.map((item) => ({
          reqTitle: item.reqTitle,
          note: item.note,
          complexity: item.complexityName,
        }));
        if (templateData.length === 0) {
          templateData.push({
            reqTitle: "requirement title...",
            note: "requirement note...",
            complexity: "medium",
          });
        }
        exportToExcel(templateData, "template_import_requirements.xlsx");
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error dowload template:", error);
      toast.error("Error dowload template!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  const nDownloadTemplate = async (teamId) => {
    try {
      const response = await authApi.post("/requirements/search", {
        milestoneId: milestone?.id,
        teamId: teamId,
      });
      console.log("search requirements:", response.data.data);
      if (response.data.statusCode === 200) {
        let templateData = response.data.data.requirementDTOs.map((item) => ({
          reqTitle: item.reqTitle,
          note: item.note,
          complexity: item.complexityName,
        }));
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet 1");

        worksheet.addRow(["Title", "Note", "Complexity"]);
        // Style header row
        worksheet.getRow(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFADD8E6" },
        };

        worksheet.getRow(1).eachCell((cell) => {
          cell.font = {
            name: "Inter",
            size: 12,
          };
          cell.alignment = {
            horizontal: "center",
          };
        });
        let complexityOpts = [];
        if (complexities) {
          complexities.forEach((com) => {
            complexityOpts.push(com.label);
          });
        }
        worksheet.dataValidations.add("C2:C9999", {
          type: "list",
          allowBlank: false,
          formulae: [`"${complexityOpts.join(",")}"`],
        });
        templateData.forEach((req, index) => {
          const row = worksheet.addRow();
          row.getCell(1).value = req.reqTitle;
          row.getCell(2).value = req.note;
          row.getCell(3).value = req.complexity;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        saveAs(blob, "template_import_requirements.xlsx");
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error download template:", error);
      toast.error("Xảy ra lỗi khi tải mẫu", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  const findComplexityByName = (name) => {
    return complexities.find((c) => c?.label?.toLowerCase() === name?.toLowerCase().trim());
  };

  const onSubmit = async (sData) => {
    console.log("import:", formData);
    if (formData.data === null) {
      toast.info("Vui lòng tải lên tệp để nhập!", {
        position: toast.POSITION.TOP_CENTER,
      });
      return false;
    }
    if (formData.teams === null) {
      toast.info("Vui lòng chọn ít nhất một đội nhóm để nhập!", {
        position: toast.POSITION.TOP_CENTER,
      });
      return false;
    }
    try {
      setIsFetching(true);
      let teamIds = formData.teams.map((t) => t.value);
      let requirementDTOs = formData.data.map((item) => ({
        reqTitle: item["Title"],
        complexityId: findComplexityByName(item[`Complexity`])?.value,
        note: item[`Note`],
      }));
      const response = await authApi.post("/requirements/add-list", {
        milestoneId: milestone?.id,
        teamIds: teamIds,
        requirementDTOs: requirementDTOs,
      });
      console.log("import reqs: ", response.data.data);
      if (response.data.statusCode === 200) {
        let newData = data.filter((r) => !teamIds.includes(r.teamId) || r.status === "EVALUATED");
        console.log("bew", newData, data);

        setData([...response.data.data, ...newData]);
        if (setTotalItems) {
          setTotalItems(response.data.data.length + newData.length);
        }
        closeModal();
        toast.success(`Nhập yêu cầu thành công!`, {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
        setInputFile("");
      }
      setIsFetching(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Lỗi khi nhập yêu cầu!", {
        position: toast.POSITION.TOP_CENTER,
      });
      setIsFetching(false);
    }
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
          <h5 className="title">Nhập Yêu Cầu</h5>
          <p className="text-danger">Nếu bạn nhập một bộ yêu cầu mới, bộ yêu cầu cũ sẽ bị xóa.</p>
          <div className="mt-4">
            <Row className="m-2 p-2">
              <Col sm="12" className="mb-2 text-end">
                <UncontrolledDropdown>
                  <DropdownToggle tag="a" className="text-soft dropdown-toggle btn btn-icon ">
                    <a
                      href="#download"
                      style={{ cursor: "pointer", fontSize: "16px", textDecoration: "underline" }}
                      className="text-primary"
                    >
                      <Icon name="file-download" /> Tải Mẫu
                    </a>
                  </DropdownToggle>
                  <DropdownMenu end>
                    <ul className="link-list-opt no-bdr">
                      {teams.map((te) => (
                        <li key={`move-${te.value}`}>
                          <DropdownItem
                            tag="a"
                            href="#move"
                            onClick={(ev) => {
                              ev.preventDefault();
                              nDownloadTemplate(te.value);
                            }}
                          >
                            <span>{te.label}</span>
                          </DropdownItem>
                        </li>
                      ))}
                    </ul>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </Col>
              <Col sm="12">
                <label className="form-label">Tải Lên Tệp Excel*</label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <Icon name="upload" />
                    </span>
                  </div>
                  <Input
                    type="file"
                    id="customFile"
                    value={inputFile}
                    onChange={handleFileUpload}
                    className="form-control"
                  />
                </div>
              </Col>
              <Col md="12">
                <div className="form-group mt-4">
                  <label className="form-label">Đội Nhóm*</label>
                  <RSelect
                    options={sTeams}
                    value={formData.teams}
                    isMulti
                    onChange={(e) => {
                      setFormData({ ...formData, teams: e });
                    }}
                  />
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
