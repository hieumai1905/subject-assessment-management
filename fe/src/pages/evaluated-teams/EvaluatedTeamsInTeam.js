import React, { useEffect, useState } from "react";
import {
  Col,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
  Icon,
  PaginationComponent,
  RSelect,
} from "../../components/Component";
import Content from "../../layout/content/Content";
import { Button, Form, Input, Modal, ModalBody, Spinner } from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import authApi from "../../utils/ApiAuth";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import useAuthStore from "../../store/Userstore";
import { canModifySessionCouncil } from "../../utils/CheckPermissions";
import { isNullOrEmpty } from "../../utils/Utils";
import Swal from "sweetalert2";

export default function EvaluatedTeamsInTeam({
  filterForm,
  councils,
  setCouncils,
  currentPage,
  itemPerPage,
  totalElements,
  paginate,
  councilTeams,
  setCouncilTeams,
  sessions,
  setSessions,
}) {
  const { role, user } = useAuthStore((state) => state);
  const [editId, setEditId] = useState(null);
  const [selectedCouncil, setSelectedCouncil] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [canEdit, setCanEdit] = useState(true);
  const [modal, setModal] = useState({
    assSession: false,
    assCouncil: false,
    import: false,
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [isFetching, setIsFetching] = useState({
    assgine: false,
    import: false,
    autoAssign: false,
  });
  const [fileInput, setfileInput] = useState("");
  const [formData, setFormData] = useState([]);
  useEffect(() => {
    if (role && user) {
      setCanEdit(canModifySessionCouncil(user, role));
    }
  }, [role, user]);
  const closeModal = () => {
    setModal({});
  };
  const onUpdateClick = (id) => {
    if (editId === id) {
      //   let uCouncilTeams = [...councilTeams];
      //   uCouncilTeams[id].session = {
      //     id: selectedSession?.value,
      //     name: selectedSession?.label,
      //   };
      //   uCouncilTeams[id].councilId = selectedCouncil?.value;
      //   setSelectedCouncil(null);
      //   setSelectedSession(null);
      //   setCouncilTeams(uCouncilTeams);
      //   setEditId(null);
      saveChanges(true);
    } else {
      if (councilTeams[id].session) {
        let fSession = sessions.find((session) => session.id === councilTeams[id]?.session?.id);
        if (fSession) setSelectedSession({ value: fSession.id, label: fSession.name });
      } else if (sessions && sessions.length > 0) {
        // setSelectedSession({ value: sessions[0].id, label: sessions[0].name });
      }
      if (councilTeams[id].councilId) {
        let fCouncil = councils.find((council) => council.id === councilTeams[id].councilId);
        if (fCouncil) setSelectedCouncil({ value: fCouncil.id, label: fCouncil.councilName });
      } else if (councils && councils.length > 0) {
        // setSelectedCouncil({ value: councils[0].id, label: councils[0].councilName });
      }
      setEditId(id);
    }
  };

  const selectorCheck = (e) => {
    let newData;
    newData = councilTeams.map((item) => {
      let canEditInNewRound = true;
      if (item.otherCouncilTeamDTOs && item.otherCouncilTeamDTOs.length > 0) {
        item.otherCouncilTeamDTOs.forEach((o) => {
          if (o?.status) {
            if (o?.status === "Evaluated" || o?.status === "Evaluating") {
              canEditInNewRound = false;
            }
          }
        });
      }
      if (isNullOrEmpty(item?.status) && canEditInNewRound) item.checked = e.currentTarget.checked;
      return item;
    });
    setCouncilTeams([...newData]);
  };

  const onSelectChange = (e, id) => {
    let newData = councilTeams;
    let index = newData.findIndex((item) => item.id === id);
    newData[index].checked = e.currentTarget.checked;
    setCouncilTeams([...newData]);
  };

  const isTeacherInCouncil = (council, teacherIds) => {
    let isExisted = false;
    if (council && council.councilMembers) {
      council.councilMembers.forEach((cm) => {
        if (teacherIds.includes(cm.id)) {
          isExisted = true;
          return true;
        }
      });
    }
    return isExisted;
  };

  const checkIsSelected = () => {
    let selectedCouncilTeams = [];
    councilTeams.forEach((ct) => {
      if (ct.checked) {
        selectedCouncilTeams.push(ct);
      }
    });
    if (selectedCouncilTeams && selectedCouncilTeams.length === 0) {
      toast.info("Vui lòng chọn ít nhất 1 mục để cập nhật", {
        position: toast.POSITION.TOP_CENTER,
      });
      return false;
    }
    if (sessions && sessions.length > 0 && modal?.assSession) {
      setSelectedSession({ value: sessions[0].id, label: sessions[0].name });
    }
    if (councils && councils.length > 0 && modal?.assCouncil) {
      setSelectedCouncil({ value: councils[0].id, label: councils[0].councilName });
    }
    setSelectedItems(selectedCouncilTeams);
    return true;
  };

  const saveChanges = async (isAssignSingle) => {
    try {
      let submitData = {
        isAssignedForClass: false,
        ids: isAssignSingle ? [councilTeams[editId].teamId] : selectedItems.map((item) => item.teamId),
        councilId: selectedCouncil?.value,
        sessionId: selectedSession?.value,
        roundId: filterForm?.round?.value,
        semesterId: filterForm?.semester?.value,
      };
      console.log("s", submitData);

      setIsFetching({ ...isFetching, assgine: true });
      const response = await authApi.put("/council-team/update", submitData);
      console.log("assign council teams:", response.data.data);
      if (response.data.statusCode === 200) {
        let uCouncilTeams = [...councilTeams];
        if (isAssignSingle) {
          uCouncilTeams[editId].session = {
            id: selectedSession?.value,
            name: selectedSession?.label,
          };
          uCouncilTeams[editId].councilId = selectedCouncil?.value;
        } else {
          uCouncilTeams.forEach((s) => {
            if (s.checked) {
              if (modal?.assSession) {
                s.session = {
                  id: selectedSession?.value,
                  name: selectedSession?.label,
                };
              } else if (modal?.assCouncil) {
                s.councilId = selectedCouncil?.value;
              }
            }
            s.checked = false;
          });
        }
        setCouncilTeams(uCouncilTeams);
        setEditId(null);
        setSelectedItems([]);
        setSelectedCouncil(null);
        setSelectedSession(null);
        toast.success(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
        closeModal();
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi phân công hội đồng", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, assgine: false });
    }
  };

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
      console.log("JSON Data:", jsonData);
      setFormData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const generateExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Evaluated Teams");

    worksheet.columns = [
      { header: "ID", key: "teamId", width: 10 },
      { header: "Nhóm", key: "teamName", width: 20 },
      { header: "Số thành viên", key: "size", width: 10 },
      { header: "Lớp học/Giảng viên", key: "email", width: 30 },
      { header: "Hội đồng", key: "council", width: 40 },
      { header: "Phiên đánh giá", key: "session", width: 20 },
    ];

    councilTeams.forEach((item, idx) => {
      if (isNullOrEmpty(item?.status)) {
        const council = councils.find((c) => c.id === item.councilId);
        const session = sessions.find((s) => s.id === item?.session?.id);

        const row = worksheet.addRow({
          teamId: item.teamId,
          teamName: item.teamName,
          size: item.size,
          email: item.classCode + "/" + item.email,
          council: council ? council.councilName : "Chưa phân công",
          session: session ? session.name : "Chưa phân công",
        });

        const availableCouncils = councils
          .filter((c) => !isTeacherInCouncil(c, [item.teacherId]))
          .map((c) => c.councilName)
          .join(",");

        worksheet.getCell(`E${row.number}`).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${availableCouncils}"`],
          showErrorMessage: true,
          errorTitle: "Nội dung không hợp lệ",
          error: "Vui lòng chọn một mục có trong danh sách",
        };

        const availableSessions = sessions.map((s) => s.name).join(",");

        worksheet.getCell(`F${row.number}`).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${availableSessions}"`],
          showErrorMessage: true,
          errorTitle: "Nội dung không hợp lệ",
          error: "Vui lòng chọn một mục có trong danh sách",
        };
      }
    });

    worksheet.getColumn("A").eachCell((cell) => {
      cell.protection = {
        locked: true,
      };
    });

    ["B", "C", "D", "E", "F"].forEach((columnKey) => {
      worksheet.getColumn(columnKey).eachCell((cell) => {
        cell.protection = {
          locked: false,
        };
      });
    });

    worksheet.protect("your-password", {
      selectLockedCells: false,
      selectUnlockedCells: true,
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "evaluated_teams.xlsx");
  };

  const handleImportData = async () => {
    try {
      if (!formData || formData.length === 0) {
        toast.error(`Không có dữ liệu để nhập`, {
          position: toast.POSITION.TOP_CENTER,
        });
        return;
      }
      let importData = [];
      formData.forEach((row) => {
        let councilTeam = councilTeams.find((item) => item.teamId === row[`ID`]);
        if (councilTeam) {
          let session = sessions.find((item) => item.name === row[`Phiên đánh giá`]);
          let council = councils.find((item) => item.councilName === row[`Hội đồng`]);
          importData.push({
            id: councilTeam.teamId,
            sessionId: session?.id,
            councilId: council?.id,
          });
        }
      });
      if (!importData || importData.length === 0) {
        toast.error(`Không có dữ liệu để nhập`, {
          position: toast.POSITION.TOP_CENTER,
        });
        return;
      }
      setIsFetching({ ...isFetching, import: true });
      const response = await authApi.post("/council-team/import", {
        importedTeams: importData,
        isAssignedForClass: false,
        roundId: filterForm?.round?.value,
        semesterId: filterForm?.semester?.value,
      });
      console.log("import council teams:", response.data.data);
      if (response.data.statusCode === 200) {
        let uCouncilTeams = [...councilTeams];
        // let uIds = importData.map(item => item.id);
        uCouncilTeams.forEach((s) => {
          let index = importData.findIndex((item) => item.id === s.teamId);
          if (index !== -1) {
            if (importData[index].sessionId) {
              s.session = sessions.find((item) => item.id === importData[index].sessionId);
            }
            if (importData[index].councilId) {
              s.councilId = importData[index].councilId;
            }
          }
        });
        setCouncilTeams(uCouncilTeams);
        toast.success(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
        closeModal();
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi nhập phân công hội đồng", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setfileInput("");
      setIsFetching({ ...isFetching, import: false });
    }
  };

  const autoAssign = () => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: `Bạn có chắc chắn muốn phân công hội đồng tự động không?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Thực hiện",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsFetching({ ...isFetching, autoAssign: true });
          const response = await authApi.get(
            `/council-team/auto-assign?semesterId=${filterForm?.semester?.value}&roundId=${filterForm?.round?.value}`
          );
          console.log("Phân công tự động:", response.data.data);
          if (response.data.statusCode === 200) {
            setCouncilTeams(response.data.data.councilTeams);
            toast.success(`Phân công hội đồng thành công`, {
              position: toast.POSITION.TOP_CENTER,
            });
          } else {
            toast.error(`${response.data.data}`, {
              position: toast.POSITION.TOP_CENTER,
            });
          }
        } catch (error) {
          console.error("Lỗi xóa yêu cầu:", error);
          toast.error("Xảy ra lỗi khi phân công hội đồng tự động", {
            position: toast.POSITION.TOP_CENTER,
          });
        } finally {
          setIsFetching({ ...isFetching, autoAssign: false });
        }
      }
    });
  };

  return (
    <Content>
      <ToastContainer />
      <div className="text-end mb-4" style={{ marginTop: "-50px" }}>
        <div className="d-flex justify-content-between align-items-end w-100 mb-3 mt-4">
          <div className="d-flex align-items-end" style={{ gap: "20px" }}></div>
          <div className="text-end">
            {canEdit && (
              <>
                {isFetching?.autoAssign ? (
                  <Button color="primary" style={{ marginRight: "20px" }}>
                    <Spinner size="sm" />
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    onClick={() => {
                      autoAssign();
                    }}
                    style={{ marginRight: "20px" }}
                  >
                    <span>Phân công tự động</span>
                  </Button>
                )}
                <Button
                  color="primary"
                  outline="primary"
                  onClick={() => {
                    if (checkIsSelected()) {
                      setModal({ assSession: true });
                    }
                  }}
                  style={{ marginRight: "20px" }}
                >
                  <span>Phân công phiên</span>
                </Button>
                <Button
                  color="primary"
                  outline="primary"
                  onClick={() => {
                    if (checkIsSelected()) {
                      setModal({ assCouncil: true });
                    }
                  }}
                  style={{ marginRight: "20px" }}
                >
                  <span>Phân công hội đồng</span>
                </Button>
                <Button
                  color="success"
                  onClick={() => {
                    setModal({ import: true });
                  }}
                >
                  <span>Nhập</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <DataTable className="card-stretch">
        <DataTableBody>
          <DataTableHead className="nk-tb-item nk-tb-head">
            <DataTableRow>
              <div className="custom-control custom-control-sm custom-checkbox notext">
                <input type="checkbox" className="custom-control-input" onChange={(e) => selectorCheck(e)} id="uid" />
                <label className="custom-control-label" htmlFor="uid"></label>
              </div>
            </DataTableRow>
            <DataTableRow size="mb">
              <span className="sub-text">Nhóm</span>
            </DataTableRow>
            <DataTableRow size="sm">
              <span className="sub-text">Số thành viên</span>
            </DataTableRow>
            <DataTableRow>
              <span className="sub-text">Lớp học/Giảng viên</span>
            </DataTableRow>
            <DataTableRow size="lg">
              <span className="sub-text">Hội đồng</span>
            </DataTableRow>
            <DataTableRow size="lg">
              <span className="sub-text">Phiên đánh giá</span>
            </DataTableRow>
            <DataTableRow className="nk-tb-col-tools text-end">
              <span className="sub-text"></span>
            </DataTableRow>
          </DataTableHead>
          {councilTeams && councilTeams?.length > 0
            ? councilTeams.map((item, idx) => {
                item.id = idx;
                let council = councils.find((c) => c.id === item.councilId);
                let session = sessions.find((s) => s.id === item?.session?.id);
                let otherCouncil = [],
                  otherStatus = [];
                let canEditInNewRound = true;
                if (item.otherCouncilTeamDTOs && item.otherCouncilTeamDTOs.length > 0) {
                  item.otherCouncilTeamDTOs.forEach((o) => {
                    if (o.councilName) {
                      otherCouncil.push(o.councilName);
                    }
                    if (o?.status) {
                      if (o?.status === "Evaluated" || o?.status === "Evaluating") {
                        canEditInNewRound = false;
                      }
                      otherStatus.push(o?.status);
                    }
                  });
                }
                return (
                  <DataTableItem key={idx}>
                    <DataTableRow>
                      {isNullOrEmpty(item?.status) && canEditInNewRound && (
                        <div className="custom-control custom-control-sm custom-checkbox notext">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            defaultChecked={item.checked}
                            id={item.id + "uid1"}
                            key={Math.random()}
                            onChange={(e) => onSelectChange(e, item.id, item?.status)}
                          />
                          <label className="custom-control-label" htmlFor={item.id + "uid1"}></label>
                        </div>
                      )}
                    </DataTableRow>
                    <DataTableRow size="mb">
                      <span>{item.teamName}</span>
                    </DataTableRow>
                    <DataTableRow size="sm">
                      <span>{item.size}</span>
                    </DataTableRow>
                    <DataTableRow>
                      <span>
                        {item.classCode}/{item.email}
                      </span>
                    </DataTableRow>
                    <DataTableRow size="lg">
                      {editId === item.id ? (
                        <RSelect
                          options={councils
                            .filter((c) => !isTeacherInCouncil(c, [item.teacherId]))
                            .map((c) => ({
                              value: c.id,
                              label: c.councilName,
                            }))}
                          value={selectedCouncil}
                          onChange={(e) => setSelectedCouncil(e)}
                          styles={{ control: (base) => ({ ...base, width: "300px" }) }}
                        />
                      ) : (
                        <>
                          <span className="fw-bold">{council && council.councilName}</span>
                          {otherCouncil && otherCouncil.length > 0 && (
                            <div style={{ marginTop: "4px", fontSize: "11px", color: "#6c757d" }}>
                              {otherCouncil.map((other, j) => (
                                <div key={`o-${j}`}>
                                  <span>{other}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </DataTableRow>

                    <DataTableRow size="lg">
                      {editId === item.id ? (
                        <RSelect
                          options={sessions.map((c) => ({
                            value: c.id,
                            label: c.name,
                          }))}
                          value={selectedSession}
                          onChange={(e) => setSelectedSession(e)}
                          styles={{ control: (base) => ({ ...base, width: "140px" }) }}
                        />
                      ) : (
                        <>
                          <span className="fw-bold">{session && session.name}</span>
                          {otherStatus && otherStatus.length > 0 && (
                            <div style={{ marginTop: "4px", fontSize: "12px", color: "#6c757d" }}>
                              {otherStatus.map((other, j) => (
                                <div key={`o-${j}`}>
                                  <span>{other}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </DataTableRow>

                    <DataTableRow className="nk-tb-col-tools text-end">
                      {isNullOrEmpty(item?.status) && canEditInNewRound && (
                        <a
                          className="action-link"
                          onClick={() => {
                            if (!isFetching?.assgine) onUpdateClick(idx);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          {editId === idx ? (
                            isFetching?.assgine ? (
                              <Icon name="loader" style={{ fontSize: "16px" }}></Icon>
                            ) : (
                              <Icon name="save" style={{ fontSize: "16px" }}></Icon>
                            )
                          ) : (
                            <Icon name="edit-alt" style={{ fontSize: "16px" }}></Icon>
                          )}
                        </a>
                      )}
                    </DataTableRow>
                  </DataTableItem>
                );
              })
            : null}
        </DataTableBody>
        <div className="card-inner">
          {totalElements > 0 ? (
            <PaginationComponent
              itemPerPage={itemPerPage}
              totalItems={totalElements}
              paginate={paginate}
              currentPage={currentPage}
            />
          ) : (
            <div className="text-center">
              <span className="text-silent">Không có dữ liệu</span>
            </div>
          )}
        </div>
      </DataTable>
      <Modal
        isOpen={modal?.assCouncil || modal?.assSession || modal?.import}
        toggle={() => closeModal()}
        className="modal-dialog-centered"
        size="lg"
      >
        <ModalBody>
          <a
            href="#cancel"
            onClick={(ev) => {
              ev.preventDefault();
              if (!isFetching?.assgine) closeModal();
            }}
            className="close"
          >
            <Icon name="cross-sm"></Icon>
          </a>
          <div className="p-3">
            <h4 className="title text-center">
              {modal?.assCouncil && "Phân công hội đồng"}
              {modal?.assSession && "Phân công phiên"}
              {modal?.import && "Nhập phân công hội đồng"}
            </h4>
            <div className="mt-4">
              <Form className="row gy-4">
                {(modal?.assCouncil || modal?.assSession) && (
                  <div className="ms-auto me-auto w-100 text-center">
                    <div className="card" style={{ maxHeight: "200px", overflowY: "auto", padding: "10px" }}>
                      {selectedItems.map((item, idx) => (
                        <div key={idx} className="mb-2">
                          <span className="badge bg-light text-dark">
                            {idx + 1}. {item.teamName} - {item.classCode}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {modal?.import && (
                  <>
                    <Col sm="12" className="mb-2 text-end">
                      <a
                        href="#download"
                        style={{ cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}
                        className="text-primary"
                        onClick={generateExcel}
                      >
                        <Icon name="file-download" /> Tải file mẫu
                      </a>
                    </Col>
                  </>
                )}
                {modal?.import && (
                  <Col md="12">
                    <label className="form-label">Nhập excel file</label>
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
                )}
                <Col md="8" className="mx-auto">
                  {modal?.assSession && (
                    <div className="form-group">
                      <label className="form-label">Phiên đánh giá*</label>
                      <RSelect
                        options={sessions.map((c) => ({
                          value: c.id,
                          label: c.name,
                        }))}
                        value={selectedSession}
                        onChange={(e) => setSelectedSession(e)}
                      />
                    </div>
                  )}
                  {modal?.assCouncil && (
                    <div className="form-group">
                      <label className="form-label">Hội đồng*</label>
                      <RSelect
                        options={councils
                          .filter(
                            (c) =>
                              !isTeacherInCouncil(
                                c,
                                selectedItems.map((t) => t.teacherId)
                              )
                          )
                          .map((c) => ({
                            value: c.id,
                            label: c.councilName,
                          }))}
                        value={selectedCouncil}
                        onChange={(e) => setSelectedCouncil(e)}
                      />
                    </div>
                  )}
                </Col>
                <Col size="12" className="text-center mt-4">
                  {(modal?.assCouncil || modal?.assSession) && (
                    <Button
                      color="primary"
                      size="md"
                      className="btn-block"
                      onClick={() => {
                        if (modal?.assCouncil && !selectedCouncil?.value) {
                          toast.info("Vui lòng chọn một hội đồng", {
                            position: toast.POSITION.TOP_CENTER,
                          });
                          return false;
                        }
                        if (modal?.assSession && !selectedSession?.value) {
                          toast.info("Vui lòng chọn một phiên đánh giá", {
                            position: toast.POSITION.TOP_CENTER,
                          });
                          return false;
                        }
                        saveChanges(false);
                      }}
                    >
                      {isFetching?.assgine ? <Spinner size="sm" /> : <span>Lưu</span>}
                    </Button>
                  )}
                  {modal?.import && (
                    <Button
                      color="primary"
                      size="md"
                      className="btn-block"
                      onClick={() => {
                        handleImportData();
                      }}
                    >
                      {isFetching?.import ? <Spinner size="sm" /> : <span>Nhập</span>}
                    </Button>
                  )}
                </Col>
              </Form>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </Content>
  );
}
