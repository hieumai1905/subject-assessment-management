import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Head from "../../layout/head/Head";
import Content from "../../layout/content/Content";
import { Block, BlockHead, BlockHeadContent, BlockTitle, BlockDes, Button, Icon } from "../../components/Component";
import { FormGroup, Input, Label, Spinner, Table } from "reactstrap";
import authApi from "../../utils/ApiAuth";
import { useLocation } from "react-router-dom";
import { formatDate, isNullOrEmpty } from "../../utils/Utils";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BuildIcon from "@mui/icons-material/Build";
import GroupIcon from "@mui/icons-material/Group";
import useAuthStore from "../../store/Userstore";
import Swal from "sweetalert2";
import { TextareaAutosize } from "@mui/material";
import { fullRequirementStatuses } from "../../data/ConstantData";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function RequirementDetail() {
  let query = useQuery();
  const reqId = query.get("reqId");
  // const teamId = query.get("teamId");
  const [isFetching, setIsFetching] = useState({
    updateReq: false,
  });
  const [requirement, setRequirement] = useState({});
  const [reload, setReload] = useState(false);
  const { role } = useAuthStore((state) => state);
  const { user } = useAuthStore((state) => state);
  const [canEdit, setCanEdit] = useState({
    req: false,
    updateTrackings: false,
  });

  useEffect(() => {
    const fetchRequirement = async () => {
      if (!reqId) return;
      try {
        const response = await authApi.get(`/requirements/${reqId}`);
        if (response.data.statusCode === 200) {
          setRequirement(response.data.data);
        } else {
          toast.error(response.data.data, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch {
        toast.error("Xảy ra lỗi khi tìm kiếm yêu cầu", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setReload(!reload);
      }
    };
    fetchRequirement();
  }, [reqId]);

  useEffect(() => {
    if (requirement && user && role) {
      if (requirement.status === "EVALUATED") {
        setCanEdit({
          req: false,
          updateTrackings: user?.id === requirement?.studentId,
        });
      } else {
        setCanEdit({
          req: role != "STUDENT" || isNullOrEmpty(requirement?.studentId) || requirement?.studentId === user.id,
          updateTrackings: false,
        });
      }
    }
  }, [reload, user, role]);

  const handleTitleChange = (e) => {
    setRequirement({
      ...requirement,
      reqTitle: e.target.value,
    });
  };

  const handleNoteChange = (e) => {
    setRequirement({
      ...requirement,
      note: e.target.value,
    });
  };

  const handleDetailChange = (e, index) => {
    let updateTrackings = [...requirement.updateTrackings];
    updateTrackings[index] = {
      ...updateTrackings[index],
      note: e.target.value,
    };
    setRequirement({
      ...requirement,
      updateTrackings: updateTrackings,
    });
  };

  const handleAddNewClick = () => {
    let newTracking = {
      updatedDate: new Date(),
      note: "",
    };
    let updateTrackings = [...requirement?.updateTrackings];
    updateTrackings.unshift(newTracking);
    setRequirement({
      ...requirement,
      updateTrackings: updateTrackings,
    });
  };

  const handleSave = async () => {
    if (isNullOrEmpty(requirement?.reqTitle)) {
      toast.error(`Tiêu đề là bắt buộc`, {
        position: toast.POSITION.TOP_CENTER,
      });
      return false;
    }
    try {
      setIsFetching({ ...isFetching, updateReq: true });
      const response = await authApi.put("/requirements", {
        reqTitle: requirement?.reqTitle,
        note: requirement?.note,
        requirementIds: [requirement?.id],
      });
      console.log("edit reqs: ", response.data.data);
      if (response.data.statusCode === 200) {
        toast.success(`Cập nhật yêu cầu thành công`, {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Xảy ra lỗi khi cập nhật yêu cầu", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, updateReq: false });
    }
  };

  const onUpdate = async (index, action) => {
    let updateTrackings = [...requirement?.updateTrackings];
    if (isNullOrEmpty(updateTrackings[index]?.note) || updateTrackings[index]?.note.trim() === "") {
      toast.error(`Thông tin chi tiết là bắt buộc`, {
        position: toast.POSITION.TOP_CENTER,
      });
      return false;
    }
    try {
      setIsFetching({ ...isFetching, [`u-${index}`]: true });
      const response = await authApi.put("/requirements/update-tracking/" + requirement?.id, {
        note: updateTrackings[index]?.note,
        id: action === "Add" ? null : updateTrackings[index]?.id,
      });
      console.log("edit trackings: ", response.data.data);
      if (response.data.statusCode === 200) {
        toast.success(`Cập nhật theo dõi thành công`, {
          position: toast.POSITION.TOP_CENTER,
        });
        updateTrackings[index] = response.data.data;
        setRequirement({
          ...requirement,
          updateTrackings: updateTrackings,
        });
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(`Xảy ra lỗi khi cập nhật theo dõi`, {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, [`u-${index}`]: false });
    }
  };

  const onDelete = async (index) => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: `Bạn có chắc chắn xóa thông tin theo dõi này`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đồng ý xóa",
      cancelButtonText: "Hủy"
    }).then(async (result) => {
      if (result.isConfirmed) {
        let updateTrackings = [...requirement?.updateTrackings];
        try {
          setIsFetching({ ...isFetching, [`d-${index}`]: true });
          const response = await authApi.put("/requirements/update-tracking/" + requirement?.id, {
            // note: foundTracking?.note,
            id: updateTrackings[index]?.id,
            action: "delete",
          });
          console.log("delete trackings: ", response.data.data);
          if (response.data.statusCode === 200) {
            toast.success(`Xóa thông tin theo dõi thành công`, {
              position: toast.POSITION.TOP_CENTER,
            });
            updateTrackings.splice(index, 1);
            setRequirement({
              ...requirement,
              updateTrackings: updateTrackings,
            });
          } else {
            toast.error(`${response.data.data}`, {
              position: toast.POSITION.TOP_CENTER,
            });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Xảy ra lỗi khi xóa thông tin theo dõi", {
            position: toast.POSITION.TOP_CENTER,
          });
        } finally {
          setIsFetching({ ...isFetching, [`d-${index}`]: false });
        }
      }
    });
  };

  return (
    <>
      <Head title="Chi tiết yêu cầu" />
      <Content>
        <BlockHead size="sm" className="border-bottom pb-3 mb-3">
          <div className="row">
            <div className="col-md-6">
              {/* <BlockHeadContent> */}
              <FormGroup>
                <Label for="reqTitle" className="">
                  Tiêu đề
                </Label>
                <Input
                  id="reqTitle"
                  type="text"
                  disabled={!canEdit?.req}
                  value={requirement?.reqTitle}
                  onChange={handleTitleChange}
                  className="mb-3"
                />
              </FormGroup>
              {/* </BlockHeadContent> */}
            </div>
            <div className="col-md-2"></div>
            {canEdit?.req && (
              <div className="col-md-4 text-end">
                {isFetching?.updateReq ? (
                  <Button disabled color="primary" className="ms-3 mt-5">
                    <Spinner size="sm" />
                    <span> Đang lưu... </span>
                  </Button>
                ) : (
                  <Button color="primary" onClick={handleSave} className="ms-3 mt-5">
                    <Icon name="save" className="me-2" /> Lưu
                  </Button>
                )}
              </div>
            )}
          </div>

          <BlockHeadContent>
            <BlockDes className="d-flex align-items-center" style={{ fontSize: "14px" }}>
              <Icon name="bell" className="text-primary mx-3" />
              <span>{isNullOrEmpty(requirement?.status) ? "Chưa làm" : fullRequirementStatuses.find(s => s.value === requirement?.status)?.label}</span>
              <Icon name="sort-line" className="text-info mx-3" />
              <span>{isNullOrEmpty(requirement?.complexityName) ? "N/A" : requirement?.complexityName}</span>
              {
                <>
                  <Icon name="user" className="text-primary mx-3" />
                  {isNullOrEmpty(requirement?.studentFullname) ? "" : requirement?.studentFullname}{" - "}
                  <span>
                    {isNullOrEmpty(requirement?.teamTeamName) ? "N/A" : requirement?.teamTeamName} trong{" "}
                    {isNullOrEmpty(requirement?.milestoneTitle) ? "N/A" : requirement?.milestoneTitle}
                  </span>
                </>
              }
            </BlockDes>

            <FormGroup className="mt-1 pt-3">
              <Label for="note" className="">
                Ghi chú
              </Label>
              <Input
                id="note"
                type="textarea"
                disabled={!canEdit?.req}
                rows="5"
                value={requirement?.note || "N/A"}
                onChange={handleNoteChange}
              />
            </FormGroup>
          </BlockHeadContent>
        </BlockHead>

        {requirement && requirement?.status === "EVALUATED" && (
          <Block>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Cập nhật theo dõi</h5>
              {canEdit?.updateTrackings && (
                <Button color="primary" onClick={() => handleAddNewClick()}>
                  <Icon name="plus" /> Thêm mới
                </Button>
              )}
            </div>

            <Table responsive className="table-striped">
              <thead className="thead-dark">
                <tr>
                  <th>Cập nhật cuối</th>
                  <th style={{ width: "70%" }}>Chi tiết cập nhật</th>
                  <th style={{ textAlign: "right" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {requirement &&
                  requirement.updateTrackings &&
                  requirement.updateTrackings.map((tracking, index) => (
                    <tr key={index}>
                      <td>{formatDate(tracking.updatedDate)}</td>
                      <td>
                        {/* <Input
                          id="note"
                          type="textarea"
                          rows="5"
                          disabled={requirement?.studentId !== user?.id}
                          style={{ width: "100%" }}
                          value={tracking?.note}
                          onChange={(e) => {
                            handleDetailChange(e, index);
                          }}
                        /> */}
                        <TextareaAutosize
                          placeholder="Nhập thông tin chi tiết"
                          value={tracking?.note}
                          disabled={requirement?.studentId !== user?.id}
                          style={{ width: "100%" }}
                          onChange={(e) => {
                            handleDetailChange(e, index);
                          }}
                          minRows={2}
                          maxRows={5}
                        />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {" "}
                        <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                          {" "}
                          {canEdit?.updateTrackings && tracking?.id && (
                            <>
                              {isFetching[`u-${index}`] ? (
                                <Button disabled color="warning" size="sm">
                                  <Spinner size="sm" />
                                  <span> Đang lưu... </span>
                                </Button>
                              ) : (
                                <Button color="warning" size="sm" onClick={() => onUpdate(index, "Update")}>
                                  Cập nhật
                                </Button>
                              )}
                              {isFetching[`d-${index}`] ? (
                                <Button disabled color="danger" size="sm">
                                  <Spinner size="sm" />
                                  <span> Đang xóa... </span>
                                </Button>
                              ) : (
                                <Button color="danger" size="sm" onClick={() => onDelete(index)}>
                                  Xóa
                                </Button>
                              )}
                            </>
                          )}
                          {canEdit?.updateTrackings && !tracking?.id && (
                            <>
                              {isFetching[`u-${index}`] ? (
                                <Button disabled color="primary" size="sm">
                                  <Spinner size="sm" />
                                  <span> Đang thêm... </span>
                                </Button>
                              ) : (
                                <Button color="primary" size="sm" onClick={() => onUpdate(index, "Add")}>
                                  Thêm
                                </Button>
                              )}
                              <Button
                                color="danger"
                                size="sm"
                                onClick={() => {
                                  Swal.fire({
                                    title: "Bạn có chắc chắn?",
                                    text: `Bạn có chắc chắn muốn xóa thông tin này?`,
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonText: "Đồng ý xóa",
                                    cancelButtonText: "Hủy"
                                  }).then(async (result) => {
                                    if (result.isConfirmed) {
                                      let updateTrackings = [...requirement?.updateTrackings];
                                      updateTrackings.splice(index, 1);
                                      setRequirement({
                                        ...requirement,
                                        updateTrackings: updateTrackings,
                                      });
                                    }
                                  });
                                }}
                              >
                                Xóa
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Block>
        )}
      </Content>

      <ToastContainer />
    </>
  );
}
