import React, { useEffect, useState } from "react";
import { Form, Input, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import { Button, Col, Icon, Row, RSelect } from "../../components/Component";
import authApi from "../../utils/ApiAuth";
import { convertToOptions, exportToExcel, isNullOrEmpty } from "../../utils/Utils";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import classnames from "classnames";
import { evaluationTypes } from "../../data/ConstantData";

export default function ImportTeamsForm({
  milestone,
  onSubmit,
  isFetching,
  setFormData,
  handleSubmit,
  random,
  setRandom,
  setTypeImport,
  cloneMilestone,
  setCloneMilestone,
  inputFile,
  setInputFile,
  classId,
}) {
  const [activeTab, setActiveTab] = useState("1");
  const [milestones, setMilestones] = useState([]);
  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
    if (tab == 1) setTypeImport("file");
    else if (tab == 2) {
      setTypeImport("random");
    } else if (tab == 3) setTypeImport("clone");
  };
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
      setFormData(jsonData);
    };

    reader.readAsArrayBuffer(file);
  };
  const dowloadTemplate = async () => {
    try {
      const response = await authApi.post("/class/search-students", {
        classId: classId,
        roleId: 4,
        pageSize: 9999,
      });
      console.log("search student:", response.data.data.classUserSuccessDTOS);
      if (response.data.statusCode === 200) {
        response.data.data = response.data.data.classUserSuccessDTOS.map((item) => ({
          code: item.code,
          fullname: item.fullname,
          // gender: item.gender,
          email: item.email,
          isLeader: "",
          teamName: "",
          topicName: "",
        }));
        exportToExcel(response.data.data, "template_import_teams.xlsx");
      } else {
        toast.error(`${response.data.data}`, {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error dowload template:", error);
      toast.error("Xảy ra lỗi khi tải mẫu!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  // useEffect(() => {
  //   const fetchMilestones = async () => {
  //     try {
  //       const response = await authApi.post("/milestone/search", {
  //         pageSize: 9999,
  //         // active: true,
  //         classId: milestone?.classesId,
  //       });
  //       console.log("milestone: ", response.data.data);
  //       if (response.data.statusCode === 200) {
  //         let options = response.data.data.milestoneResponses
  //           .filter((item) => item?.id !== milestone.id && item.evaluationType !== evaluationTypes[2].value)
  //           .map((item) => ({
  //             value: item?.id,
  //             label: item?.title,
  //           }));
  //         setMilestones(options);
  //       } else {
  //         toast.error(`${response.data.data}`, {
  //           position: "top-center",
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Error search milestone:", error);
  //       toast.error("Error search milestone!", {
  //         position: toast.POSITION.TOP_CENTER,
  //       });
  //     }
  //   };

  //   fetchMilestones();
  // }, []);

  return (
    <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
      <Nav tabs className="ms-2">
        <NavItem>
          <NavLink
            tag="a"
            href="#tab"
            className={classnames({ active: activeTab === "1" })}
            onClick={(ev) => {
              ev.preventDefault();
              toggle("1");
            }}
          >
            Nhập File
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            tag="a"
            href="#tab"
            className={classnames({ active: activeTab === "2" })}
            onClick={(ev) => {
              ev.preventDefault();
              toggle("2");
            }}
          >
            Ngẫu nhiên
          </NavLink>
        </NavItem>
        {/* <NavItem>
          <NavLink
            tag="a"
            href="#tab"
            className={classnames({ active: activeTab === "3" })}
            onClick={(ev) => {
              ev.preventDefault();
              toggle("3");
            }}
          >
            Clone
          </NavLink>
        </NavItem> */}
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          {activeTab === "1" ? (
            <Row className="m-2 p-2">
              <Col sm="12" className="mb-2 text-end">
                <a
                  href="#download"
                  style={{ cursor: "pointer", fontSize: "16px", textDecoration: "underline" }}
                  className="text-primary"
                  onClick={dowloadTemplate}
                >
                  <Icon name="file-download" /> Tải xuống mẫu
                </a>
              </Col>
              <Col sm="12">
                <label className="form-label">Tải lên tệp Excel</label>
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
            </Row>
          ) : (
            <></>
          )}
        </TabPane>
        <TabPane tabId="2">
          {activeTab === "2" ? (
            <>
              <Row className="m-2 p-2">
                <Col sm="12">
                  <div className="form-group">
                    <label className="form-label">Số thành viên cho mỗi nhóm</label>
                    <input
                      type="number"
                      value={random}
                      placeholder="Nhập số"
                      onChange={(e) => setRandom(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </Col>
              </Row>
            </>
          ) : (
            <></>
          )}
        </TabPane>
        <TabPane tabId="3">
          {activeTab === "3" ? (
            <>
              <Row className="m-2 p-2">
                <Col sm="12">
                  <div className="form-group">
                    <label className="form-label">Sao chép từ cột mốc</label>
                    <RSelect
                      options={milestones}
                      value={cloneMilestone}
                      onChange={(e) => {
                        setCloneMilestone(e);
                      }}
                    />
                  </div>
                </Col>
              </Row>
            </>
          ) : (
            <></>
          )}
        </TabPane>
      </TabContent>

      <Col size="12">
        <ul className=" text-end">
          <li>
            {isFetching ? (
              <Button type="button" color="gray">
                Đang nhập...
              </Button>
            ) : (
              <Button color="primary" size="md" type="submit">
                Nhập
              </Button>
            )}
          </li>
        </ul>
      </Col>
    </Form>
  );
}
