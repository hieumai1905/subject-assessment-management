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
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function ImportReqToClassModal({ modal, setModal, milestones, teamOptions, data, setData }) {
  const [isFetching, setIsFetching] = useState({
    team: true,
    submit: false,
  });
//   const [teams, setTeams] = useState(teamOptions);
  const [formData, setFormData] = useState({});
  const [fileInput, setFileInput] = useState("");

  const handleFileUpload = (event) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    setFileInput(file.filename);
    const reader = new FileReader();

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
  const downloadTemplate = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet 1");
  
      worksheet.addRow(['Title', 'Note', 'Milestone']);
      let mileOpts = [];
      if(milestones){
        milestones.forEach(milestone => {
            mileOpts.push(milestone.label);
        });
      }
      worksheet.dataValidations.add('C2:C9999', {
        type: 'list',
        allowBlank: false,
        formulae: [`"${mileOpts.join(',')}"`],
      });
  
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
      saveAs(blob, "template_import_req_to_class.xlsx");
    } catch (error) {
      console.error("Error download template:", error);
      toast.error("Error download template!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  const findComplexityByName = (name) => {
    return complexities.find((c) => c?.label?.toLowerCase() === name?.toLowerCase().trim());
  };

  const onSubmit = async () => {
    console.log("import:", formData);
    if (formData.data === null) {
      toast.info("Please upload file to import!", {
        position: toast.POSITION.TOP_CENTER,
      });
      return false;
    }
    try {
      setIsFetching({...isFetching, submit: true,});
      let mileObj = {};
      milestones.forEach(item => {
        mileObj[item.label] = item.value;
      });  
      let requirementDTOs = formData.data.map((item) => ({
        reqTitle: item['Title'],
        milestoneId: mileObj[`${item['Milestone']}`],
        note: item['Note'],
      }));
      const response = await authApi.post("/requirements/import-requirements-to-class", {
        requirementDTOs: requirementDTOs,
      });
      console.log("import reqs: ", response.data.data);
      if (response.data.statusCode === 200) {
        setData([...response.data.data, ...data]);
        closeModal();
        toast.success(`Import requirements successfully!`, {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error import requirements!", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally{
      setIsFetching({...isFetching, submit: false,});
      setFileInput("");
    }
  };

  const closeModal = () => {
    setModal({ import: false });
    setFormData({});
  };

//   useEffect(() => {
//     const fetchTeams = async () => {
//       if (!formData?.milestone?.value) {
//         setFormData({ ...formData, teams: null });
//         setIsFetching((prev) => ({ ...prev, team: false }));
//         setTeams([]);
//         return;
//       }
//       try {
//         setIsFetching((prev) => ({ ...prev, team: true }));
//         const response = await authApi.post("/teams/search", {
//           pageSize: 9999,
//           pageIndex: 1,
//           milestoneId: formData?.milestone?.value,
//         });
//         console.log("teams:", response.data.data);
//         if (response.data.statusCode === 200) {
//           let teamOptions = convertToOptions(response.data.data.teamDTOs, "id", "teamName");
//           teamOptions = teamOptions?.filter((team) => team.label !== "Wish List");
//           setFormData({ ...formData, teams: null });
//           setTeams(teamOptions);
//         } else {
//           toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         toast.error("Error search teams!", { position: toast.POSITION.TOP_CENTER });
//       } finally {
//         setIsFetching((prev) => ({ ...prev, team: false }));
//       }
//     };

//     fetchTeams();
//   }, [formData?.milestone]);

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="lg">
      <ModalBody>
        <ToastContainer />
        <a
          href="#cancel"
          onClick={(ev) => {
            if (isFetching?.submit) return false;
            ev.preventDefault();
            closeModal();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-2">
          <h5 className="title">Import Requirements</h5>
          <div className="mt-4">
            <Row className="m-2 p-2">
              <Col sm="12" className="mb-2 text-end">
                <a
                  href="#download"
                  style={{ cursor: "pointer", fontSize: "16px", textDecoration: "underline" }}
                  className="text-primary"
                  onClick={() => downloadTemplate()}
                >
                  <Icon name="file-download" /> Download Template
                </a>
              </Col>
              <Col sm="12">
                <label className="form-label">Upload Excel File*</label>
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
              {/* <Col md="12">
                <div className="form-group mt-4">
                  <label className="form-label">Milestone*</label>
                  <RSelect
                    options={milestones}
                    value={formData?.milestone}
                    onChange={(e) => {
                      setFormData({ ...formData, milestone: e });
                    }}
                  />
                </div>
              </Col>
              <Col md="12">
                <div className="form-group mt-4">
                  <label className="form-label">Teams</label>
                  {isFetching?.team ? (
                    <div>
                      <Spinner />
                    </div>
                  ) : (
                    <RSelect
                      options={teams}
                      value={formData.teams}
                      isMulti
                      onChange={(e) => {
                        setFormData({ ...formData, teams: e });
                      }}
                    />
                  )}
                </div>
              </Col> */}
              <Col className="mt-5" size="12">
                <ul className=" text-end">
                  <li>
                    {isFetching?.submit ? (
                      <Button disabled color="primary">
                        <Spinner size="sm" />
                        <span> Saving... </span>
                      </Button>
                    ) : (
                      <Button color="primary" size="md" type="button" onClick={() => onSubmit()}>
                        Import
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
