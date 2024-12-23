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
  PreviewCard,
  Block,
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
import { convertToOptions, isNullOrEmpty, shortenString } from "../../utils/Utils";
import { canChangeAssignee, canModifyMilestone, canSubmitWork } from "../../utils/CheckPermissions";
import useAuthStore from "../../store/Userstore";
import { useLocation } from "react-router-dom";
import Head from "../../layout/head/Head";
import Content from "../../layout/content/Content";
import { evaluationTypes, fullRequirementStatuses } from "../../data/ConstantData";

const SubmitDetail = (
  {
    //   modal,
    //   modalType,
    //   closeModal,
    //   formData,
    //   setFormData,
    //   data,
    //   setData,
    //   teamMembers,
    //   milestoneId,
    //   teamId,
    //   role,
    //   canSubmit,
  }
) => {
  const { role } = useAuthStore((state) => state);
  const { user } = useAuthStore((state) => state);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mId = queryParams.get("mId");
  const tId = queryParams.get("tId");

  const [formData, setFormData] = useState({
    requirements: [],
    submitType: "file",
    file: null,
    link: null,
    note: "",
  });
  const [canSubmit, setCanSubmit] = useState(false);
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
    milestone: true,
    requirement: true,
    submission: true,
    team: true,
    submit: false,
  });
  const [requirements, setRequirements] = useState([]);
  const [permission, setPermission] = useState({});
  const [milestone, setMilestone] = useState({});
  const [team, setTeam] = useState({});
  const [teamMembers, setTeamMembers] = useState({});
  const [data, setData] = useState([]);
  const [grandFinal, setGrandFinal] = useState(null);

  const onSubmit = async (sData) => {
    const { files, link, submitType, note } = sData;
    const formData = new FormData();
    formData.append("teamId", tId);
    formData.append("milestoneId", milestone?.id);
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
    if ((!reqIds || reqIds.length === 0) && !grandFinal) {
      toast.info("Vui lòng chọn ít nhất một yêu cầu", {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }
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
        toast.success("Nộp bài thành công", {
          position: toast.POSITION.TOP_CENTER,
        });
        // setData([response.data.data]);
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Xảy ra lỗi khi nộp bài", {
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
    const fetchMilestone = async () => {
      try {
        if (!mId) {
          setIsFetching({ ...isFetching, milestone: false });
          return;
        }
        setIsFetching({ ...isFetching, milestone: true });
        const response = await authApi.get("/milestone/get-by-id/" + mId);
        console.log("milestone:", response.data.data);
        if (response.data.statusCode === 200) {
          let mile = response.data.data.milestone;
          setMilestone(mile);
          setGrandFinal(mile.evaluationType === evaluationTypes[2].value);
        } else {
          toast.error(response.data.data, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch {
        toast.error("Xảy ra lỗi khi tìm kiếm giai đoạn", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching({ ...isFetching, milestone: false });
      }
    };

    fetchMilestone();
  }, [mId]);

  useEffect(() => {
    const fetchTeams = async () => {
      if (isFetching.milestone || !milestone) {
        setIsFetching((prev) => ({ ...prev, team: false }));
        return;
      }
      console.log("adad", milestone?.classesId);

      try {
        setIsFetching((prev) => ({ ...prev, team: true }));
        const response = await authApi.post("/teams/search", {
          pageSize: 9999,
          pageIndex: 1,
          classId: milestone?.classesId,
        });
        console.log("teams:", response.data.data);
        if (response.data.statusCode === 200) {
          let teamOptions = convertToOptions(response.data.data.teamDTOs, "id", "teamName");
          teamOptions = teamOptions?.filter((team) => team.label !== "Wish List");
          if (teamOptions.length > 0) {
            let nTeamMembers = {},
              nPermission = {},
              team = null;
            response.data.data.teamDTOs
              .filter((item) => item.teamName !== "Wish List")
              .forEach((item) => {
                if (item.id == tId) {
                  team = item;
                }
                nTeamMembers = {
                  ...nTeamMembers,
                  [`${item.id}`]: item.members,
                };
                nPermission = {
                  ...nPermission,
                  [`t-${item.id}`]: item.leaderId,
                };
              });
            setPermission({
              ...permission,
              ...nPermission,
            });
            setTeamMembers(nTeamMembers);
            setTeam(team);
          }
        } else {
          toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Xảy ra lỗi khi tìm kiếm nhóm", { position: toast.POSITION.TOP_CENTER });
      } finally {
        setIsFetching((prev) => ({ ...prev, team: false }));
      }
    };

    fetchTeams();
  }, [milestone, isFetching?.milestone]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (isFetching.milestone || isFetching.team) return;
      if (!tId || !mId || !team) {
        setIsFetching({ ...isFetching, submission: false });
        setData([]);
        return;
      }
      try {
        setIsFetching({ ...isFetching, submission: true });
        const response = await authApi.post("/submission/search", {
          pageSize: 9999,
          pageIndex: 1,
          milestoneId: mId,
          teamId: tId,
          classId: milestone?.classesId,
          // title: filterForm?.title,
          // isCurrentRequirements: role === "STUDENT",
        });
        console.log("submissions:", response.data.data);
        if (response.data.statusCode === 200) {
          console.log("p", permission);

          setCanSubmit(canSubmitWork(user, role, permission[`t-${tId}`]) && (grandFinal || milestone?.active));
          let submissions = response.data.data.submissionDTOS;
          setData(submissions);
        } else {
          toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Xảy ra lỗi khi tìm kiếm bài nộp", { position: toast.POSITION.TOP_CENTER });
      } finally {
        setIsFetching({ ...isFetching, submission: false });
      }
    };
    fetchSubmissions();
  }, [isFetching?.team, isFetching?.milestone]);

  useEffect(() => {
    const fetchRequirements = async () => {
      if (!tId || !mId || isFetching?.submission || !team) {
        setIsFetching({ ...isFetching, requirement: false });
        return;
      }
      try {
        setIsFetching({ ...isFetching, requirement: true });
        const response = await authApi.post("/requirements/search-for-submission", {
          pageSize: 9999,
          pageIndex: 1,
          milestoneId: mId,
          teamId: tId,
          classId: milestone?.classesId,
          isCurrentRequirements: role === "STUDENT",
        });
        console.log("reqs:", response.data.data);
        if (response.data.statusCode === 200) {
          let requirements = response.data.data.requirementDTOs;
          if (data && data.length > 0) {
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
        } else {
          toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Xảy ra lỗi khi tìm kiếm yêu cầu", { position: toast.POSITION.TOP_CENTER });
      } finally {
        setIsFetching({ ...isFetching, requirement: false });
      }
    };
    fetchRequirements();
  }, [isFetching?.submission]);

  const selectorCheck = (e) => {
    let newData;
    newData = requirements.map((item) => {
      if (item.studentId && item.status !== "EVALUATED") item.checked = e.currentTarget.checked;
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
    if (isNullOrEmpty(url)) return "";
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
    <>
      <Head title="Chi tiết bài nộp"></Head>
      <ToastContainer />
      <Content>
        <Block>
          <div className="p-2 mt-5 bg-white">
            <h3 className="title mt-5">Chi tiết nộp bài trong {milestone?.title}</h3>
            <div className="ms-3 mt-4">
              <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
                <Col md="12">
                  {!canSubmit ? (
                    <p>
                      <span className="fw-bold me-2">Liên kết:</span>
                      <a href={formData.link} target="_blank">
                        {shortenString(formData.link, 100)}
                      </a>
                    </p>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Liên kết</label>
                      <input
                        type="text"
                        disabled={!canSubmit}
                        value={formData.link}
                        placeholder="Nhập liên kết"
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  )}
                </Col>
                {!canSubmit ? (
                  <Col md="12">
                    <p>
                      <span className="fw-bold me-2">Tệp:</span>
                      <a href={`${formData.file}`} download={`${getFileNameFromURL(formData.file)}`}>
                        {getFileNameFromURL(formData.file)}
                      </a>
                    </p>
                  </Col>
                ) : (
                  <Col md="12">
                    <label className="form-label">Tải lên tệp &lt;= 5MB</label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <Icon name="upload" />
                        </span>
                      </div>
                      <Input
                        type="file"
                        disabled={!canSubmit}
                        id="customFileSubmitWork"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          const maxFileSize = 5 * 1024 * 1024;
                          if (file && file.size > maxFileSize) {
                            e.target.value = null;
                            toast.error("Dung lượng tệp vượt quá giới hạn tối đa là 5MB.", {
                              position: toast.POSITION.TOP_CENTER,
                            });
                            return false;
                          }
                          setFormData({ ...formData, files: file });
                        }}
                        className="form-control"
                      />
                    </div>
                    {data && data.length > 0 && !isNullOrEmpty(formData.file) && (
                      <div>
                        Tệp đã nộp:{" "}
                        <a href={`${formData.file}`} download={`${getFileNameFromURL(formData.file)}`}>
                          {getFileNameFromURL(formData.file)}
                        </a>
                      </div>
                    )}
                  </Col>
                )}
                <Col size="12">
                  <div className="form-group">
                    <label className="form-label">Ghi chú</label>
                    <textarea
                      disabled={!canSubmit}
                      value={formData.note}
                      placeholder="Nhập ghi chú của bạn"
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="form-control-xl form-control no-resize"
                    />
                  </div>
                </Col>
                {!grandFinal && (
                  <Col sizex="12">
                    <h6>Yêu cầu:</h6>
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
                            <span className="sub-text">Yêu cầu</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span className="sub-text">Trạng thái</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span className="sub-text">Người được giao</span>
                          </DataTableRow>
                        </DataTableHead>
                        {requirements && requirements.length > 0
                          ? requirements.map((item, rIdx) => {
                              return (
                                <DataTableItem key={`r-${rIdx}`}>
                                  <DataTableRow className="nk-tb-col-check">
                                    {item.studentId && (
                                      <div className="custom-control custom-control-sm custom-checkbox notext">
                                        <input
                                          disabled={!canSubmit || item.status === "EVALUATED"}
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
                                    <span style={{ cursor: "pointer" }}>{fullRequirementStatuses.find(s => s.value === item.status)?.label}</span>
                                  </DataTableRow>
                                  <DataTableRow>
                                    <UncontrolledDropdown>
                                      <DropdownToggle tag="a" className="text-soft dropdown-toggle btn btn-icon ">
                                        <span style={{ cursor: "pointer" }}>
                                          {isNullOrEmpty(item?.studentFullname) ? "Không có" : item?.studentFullname}
                                        </span>
                                        {item.status !== "EVALUATED" && canSubmit && <Icon name="chevron-down"></Icon>}
                                      </DropdownToggle>
                                      {item.status !== "EVALUATED" && canSubmit && (
                                        <DropdownMenu>
                                          <ul className="link-list-opt no-bdr">
                                            {teamMembers[tId]?.map((member) => (
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
                                                    {member.id !== -1
                                                      ? `${member.fullname} (${member.email})`
                                                      : "Không có"}
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
                          <span className="text-silent">Không tìm thấy dữ liệu</span>
                        </div>
                      )}
                    </div>
                  </Col>
                )}
                <Col size="12">
                  <ul className=" text-end">
                    <li>
                      <a className="me-5" size="md" href="/submissions">
                        Quay lại
                      </a>
                      {canSubmit && (
                        <>
                          {isFetching?.submit ? (
                            <Button disabled color="primary">
                              <Spinner size="sm" />
                              <span> Đang nộp... </span>
                            </Button>
                          ) : (
                            <Button color="primary" size="md" type="submit" disabled={isFetching?.requirement}>
                              Nộp bài
                            </Button>
                          )}
                        </>
                      )}
                    </li>
                  </ul>
                </Col>
              </Form>
            </div>
          </div>
        </Block>
      </Content>
    </>
  );
};
export default SubmitDetail;
