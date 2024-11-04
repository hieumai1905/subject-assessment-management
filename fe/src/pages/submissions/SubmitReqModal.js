import React, { useEffect, useRef, useState } from "react";
import {
  Icon,
  Button,
  Col,
  RSelect,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableItem,
} from "../../components/Component";
import {
  Modal,
  ModalBody,
  Form,
  Input,
  Spinner,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import authApi from "../../utils/ApiAuth";
import { isNullOrEmpty, shortenString } from "../../utils/Utils";
import { canChangeAssignee, canModifyMilestone } from "../../utils/CheckPermissions";

const SubmitReqModal = ({
  modal,
  modalType,
  closeModal,
  formData,
  setFormData,
  data,
  setData,
  teamMembers,
  milestoneId,
  teamId,
  role,
  canSubmit,
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

  const [isFetching, setIsFetching] = useState({
    requirement: true,
    submit: false,
  });
  const [requirements, setRequirements] = useState([]);
  const [inputFile, setInputFile] = useState("");

  const onSubmit = async (sData) => {
    const { files, link, submitType, note } = sData;
    const formData = new FormData();
    if (!isNullOrEmpty(link)) {
      formData.append("link", link);
    }
    if (!isNullOrEmpty(files)) {
      formData.append("file", files);
    }
    if (!isNullOrEmpty(note)) formData.append("note", note);
    let selectedReqs = [...requirements];
    let reqIds = [],
      assigneeIds = [];
    selectedReqs.forEach((item) => {
      if (item.studentId && item.checked) {
        reqIds.push(item.id);
        assigneeIds.push(item.studentId);
      }
    });
    formData.append("requirementIds", reqIds);
    formData.append("assigneeIds", assigneeIds);
    try {
      setIsFetching({ ...isFetching, submit: true });
      const response = await authApi.post("/requirements/submit-work", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("submit work:", response.data.data);
      if (response.data.statusCode === 200) {
        toast.success("Submit work successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        setData([response.data.data]);
        closeModal();
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Fail to submit work", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, submit: false });
    }
  };

  const isSelected = (item) => {
    let isSelected = false;
    if (data[0] && data[0].requirementDTOS && data[0].requirementDTOS.length > 0) {
      data[0].requirementDTOS.forEach((req) => {
        if (item.id === req.id) {
          isSelected = true;
          return false;
        }
      });
    }
    return isSelected;
  };

  useEffect(() => {
    const fetchRequirements = async () => {
      if (!teamId || !milestoneId) return;
      try {
        setIsFetching({ ...isFetching, requirement: true });
        const response = await authApi.post("/requirements/search", {
          pageSize: 9999,
          pageIndex: 1,
          milestoneId: milestoneId,
          teamId: teamId,
          // title: filterForm?.title,
          isCurrentRequirements: role === "STUDENT",
        });
        console.log("reqs:", response.data.data);
        if (response.data.statusCode === 200) {
          let requirements = response.data.data.requirementDTOs;
          requirements = requirements.filter((item) => item.status !== "WAITING FOR APPROVAL");
          if (modalType === "edit") {
            requirements = requirements.map((item) => {
              item.checked = isSelected(item);
              return item;
            });
            setFormData({
              ...formData,
              link: data[0].submitLink,
              file: data[0].submitFile,
              note: data[0].note,
            });
          }
          setRequirements(requirements);
          console.log("v", teamMembers[teamId]);
        } else {
          toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error search requirements!", { position: toast.POSITION.TOP_CENTER });
      } finally {
        setIsFetching({ ...isFetching, requirement: false });
      }
    };
    fetchRequirements();
  }, [teamId, milestoneId]);

  const selectorCheck = (e) => {
    let newData;
    newData = requirements.map((item) => {
      if (item.studentId) item.checked = e.currentTarget.checked;
      return item;
    });
    setRequirements([...newData]);
  };

  const onSelectChange = (e, id) => {
    let newData = requirements;
    let index = newData.findIndex((item) => item.id === id);
    newData[index].checked = e.currentTarget.checked;
    setRequirements([...newData]);
  };

  const getFileNameFromURL = (url) => {
    if(isNullOrEmpty(url)) return "";
    return url.split("/").pop().split("?")[0];
  };

  const updateAssignee = (member, id) => {
    let nReq = [...requirements];
    let index = nReq.findIndex((item) => item.id === id);
    if (index !== -1) {
      nReq[index] = {
        ...nReq[index],
        studentId: member.id,
        studentFullname: member.fullname,
      };
      setRequirements(nReq);
    }
  };

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="xl">
      <ToastContainer />
      <ModalBody>
        <a
          href="#cancel"
          onClick={(ev) => {
            ev.preventDefault();
            if (!isFetching?.submit) closeModal();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-2" style={{ overflowY: "auto", overflowX: "hidden", height: "600px", width: "100%" }}>
          <h5 className="title">Submit Work</h5>
          <div className="mt-4">
            <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
              <Col md="12">
                {!canSubmit ? (
                  <p>
                    <span className="fw-bold me-2">Link:</span>
                    <a href={formData.link} target="_blank">
                      {shortenString(formData.link, 100)}
                    </a>
                  </p>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Link</label>
                    <input
                      type="text"
                      disabled={!canSubmit}
                      value={formData.link}
                      placeholder="Enter link"
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="form-control"
                    />
                  </div>
                )}
              </Col>
              {!canSubmit ? (
                <Col md="12">
                  <p>
                    <span className="fw-bold me-2">File:</span>
                    <a href={`${formData.file}`} download={`${getFileNameFromURL(formData.file)}`}>
                      {getFileNameFromURL(formData.file)}
                    </a>
                  </p>
                </Col>
              ) : (
                <Col md="12">
                  <label className="form-label">Upload File &lt;= 5MB</label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <Icon name="upload" />
                      </span>
                    </div>
                    <Input
                      type="file"
                      disabled={!canSubmit}
                      // {...register("file", { required: "This field is required" })}
                      id="customFileSubmitWork"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        const maxFileSize = 5 * 1024 * 1024;
                        if (file && file.size > maxFileSize) {
                          e.target.value = null;
                          toast.error("File size exceeds the maximum allowed size of 5MB.", {
                            position: toast.POSITION.TOP_CENTER,
                          });
                          return false;
                        }
                        setFormData({ ...formData, files: file });
                      }}
                      className="form-control"
                    />
                  </div>
                  {modalType === "edit" && !isNullOrEmpty(formData.file) && (
                    <div>
                      Submitted File:{" "}
                      <a href={`${formData.file}`} download={`${getFileNameFromURL(formData.file)}`}>
                        {getFileNameFromURL(formData.file)}
                      </a>
                    </div>
                  )}
                </Col>
              )}
              <Col size="12">
                <div className="form-group">
                  <label className="form-label">Note</label>
                  <textarea
                    disabled={!canSubmit}
                    value={formData.note}
                    placeholder="Your note"
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="form-control-xl form-control no-resize"
                  />
                </div>
              </Col>
              <Col sizex="12">
                <h6>Requirements:</h6>
                {isFetching?.requirement ? (
                  <div className="d-flex justify-content-center align-items-center">
                    <Spinner style={{ width: "3rem", height: "3rem" }} />
                  </div>
                ) : (
                  <DataTableBody compact>
                    <DataTableHead>
                      <DataTableRow className="nk-tb-col-check">
                        <div className="custom-control custom-control-sm custom-checkbox notext">
                          <input
                            disabled={!canSubmit}
                            type="checkbox"
                            className="custom-control-input"
                            onChange={(e) => selectorCheck(e)}
                            id="uid"
                          />
                          <label className="custom-control-label" htmlFor="uid"></label>
                        </div>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="sub-text">Requirement</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="sub-text">Status</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="sub-text">Assignee</span>
                      </DataTableRow>
                    </DataTableHead>
                    {requirements.length > 0
                      ? requirements.map((item) => {
                          return (
                            <DataTableItem key={item.id}>
                              <DataTableRow className="nk-tb-col-check">
                                {item.studentId && (
                                  <div className="custom-control custom-control-sm custom-checkbox notext">
                                    <input
                                      disabled={!canSubmit}
                                      type="checkbox"
                                      className="custom-control-input"
                                      defaultChecked={item.checked}
                                      id={item.id + "uid1"}
                                      key={Math.random()}
                                      onChange={(e) => onSelectChange(e, item.id)}
                                    />
                                    <label className="custom-control-label" htmlFor={item.id + "uid1"}></label>
                                  </div>
                                )}
                              </DataTableRow>
                              <DataTableRow>
                                <span>{item.reqTitle}</span>
                              </DataTableRow>
                              <DataTableRow>
                                <span style={{ cursor: "pointer" }}>{item.status}</span>
                              </DataTableRow>
                              <DataTableRow>
                                <UncontrolledDropdown>
                                  <DropdownToggle tag="a" className="text-soft dropdown-toggle btn btn-icon ">
                                    <span style={{ cursor: "pointer" }}>
                                      {isNullOrEmpty(item?.studentFullname) ? "No one" : item?.studentFullname}
                                    </span>
                                    {item.status !== "EVALUATED" && canSubmit && <Icon name="chevron-down"></Icon>}
                                  </DropdownToggle>
                                  {item.status !== "EVALUATED" && canSubmit && (
                                    <DropdownMenu>
                                      <ul className="link-list-opt no-bdr">
                                        {teamMembers[teamId]?.map((member) => (
                                          <li key={`s-${member.id}`}>
                                            <DropdownItem
                                              tag="a"
                                              href="#move"
                                              onClick={(ev) => {
                                                ev.preventDefault();
                                                updateAssignee(member, item.id);
                                              }}
                                            >
                                              <span>
                                                {member.id !== -1 ? `${member.fullname} (${member.email})` : "No one"}
                                              </span>
                                            </DropdownItem>
                                          </li>
                                        ))}
                                      </ul>
                                    </DropdownMenu>
                                  )}
                                </UncontrolledDropdown>
                              </DataTableRow>
                            </DataTableItem>
                          );
                        })
                      : null}
                  </DataTableBody>
                )}
                <div className="card-inner">
                  {requirements.length === 0 && (
                    <div className="text-center">
                      <span className="text-silent">No data found</span>
                    </div>
                  )}
                </div>
              </Col>
              <Col size="12">
                <ul className=" text-end">
                  {canSubmit && (
                    <li>
                      {isFetching?.submit ? (
                        <Button disabled color="primary">
                          <Spinner size="sm" />
                          <span> Submitting... </span>
                        </Button>
                      ) : (
                        <Button color="primary" size="md" type="submit" disabled={isFetching?.requirement}>
                          Submit Work
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
export default SubmitReqModal;
