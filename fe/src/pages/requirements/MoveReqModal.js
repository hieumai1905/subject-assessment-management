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
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useForm } from "react-hook-form";

export default function MoveReqModal({
  modal,
  setModal,
  milestones,
  teamOptions,
  data,
  setData,
  setSelectedItem,
  initFormData,
  role,
  user
}) {
  const [isFetching, setIsFetching] = useState({
    team: true,
    submit: false,
  });
  const [teams, setTeams] = useState(teamOptions);
  const [formData, setFormData] = useState(initFormData);
  const [selectedData, setSelectedData] = useState([]);
  const [initial, setInitial] = useState({});
  // useEffect(() => {
  //   reset(formData);
  // }, [formData]);

  const {
    reset,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  const onSubmit = async () => {
    try {
      if (!formData?.milestone?.value) {
        setError("milestone", {
          type: "manual",
          message: "This field is required",
        });
        return false;
      }
      if (!formData?.teams?.value) {
        setError("teams", {
          type: "manual",
          message: "This field is required",
        });
        return false;
      }
      // let teamIds = null;
      setIsFetching({ ...isFetching, submit: true });
      // if (formData?.teams && formData?.teams.length > 0) {
      //   teamIds = formData?.teams.map((te) => te.value);
      // }
      const response = await authApi.put("/requirements/move-requirements", {
        milestoneId: formData?.milestone?.value,
        teamIds: [formData?.teams?.value],
        requirementIds: selectedData.map((item) => item.id),
      });
      console.log("assigne reqs: ", response.data.data);
      if (response.data.statusCode === 200) {
        if (selectedData[0].milestoneId !== formData?.milestone?.value) {
          let unSelectedData = data.filter((item) => !item.checked);
          setData([...response.data.data, ...unSelectedData]);
        } else {
          setData([...response.data.data, ...data]);
        }
        closeModal();
        toast.success(`Assigne requirements successfully!`, {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error asigning requirements!", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsFetching({ ...isFetching, submit: false });
    }
  };

  const closeModal = () => {
    setModal({ import: false });
    setFormData({});
    setSelectedItem({
      teamId: -1,
      milestoneId: -1,
    });
    setData((prev) =>
      prev.map((item) => {
        item.checked = false;
        return item;
      })
    );
  };

  useEffect(() => {
    if (data && milestones && teamOptions) {
      let selectedReqs = data.filter((item) => item.checked);
      setSelectedData(selectedReqs);
      // let fMile = milestones.find((item) => item.value === selectedReqs[0]?.milestoneId);
      // let fTeam = teamOptions.find((item) => item.value === selectedReqs[0]?.teamId);
      // setInitial({
      //   milestone: fMile,
      //   teams: fTeam,
      // });
    }
  }, [data, milestones, teamOptions]);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!formData?.milestone?.value) {
        setFormData({ ...formData, teams: null });
        setIsFetching((prev) => ({ ...prev, team: false }));
        setTeams([]);
        return;
      }
      try {
        setIsFetching((prev) => ({ ...prev, team: true }));
        const response = await authApi.post("/teams/search", {
          pageSize: 9999,
          pageIndex: 1,
          milestoneId: formData?.milestone?.value || initial?.milestone?.value,
        });
        console.log("teams:", response.data.data);
        if (response.data.statusCode === 200) {
          let rTeams = response.data.data.teamDTOs;
          let teamOptions = convertToOptions(rTeams, "id", "teamName");
          teamOptions = teamOptions?.filter((team) => team.label !== "Wish List");
          let sameTeam = teamOptions.find((item) => item.value === initFormData?.teams?.value);
          
          if(!sameTeam && role === 'STUDENT'){
            let isFound = false;
            rTeams.forEach(item => {
              item.members.forEach(tm => {
                if(tm.id === user.id){
                  sameTeam = {
                    value: item.id,
                    label: item.teamName,
                  };
                  isFound = true;
                }
              });
              if(isFound)
                return;
            });
          }
          if (sameTeam) {
            teamOptions = teamOptions.filter(item => item.value === sameTeam.value);
            setFormData({ ...formData, teams: sameTeam });
          } else {
            setFormData({ ...formData, teams: null });
          }
          setTeams(teamOptions);
        } else {
          toast.error(`${response.data.data}`, { position: toast.POSITION.TOP_CENTER });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error search teams!", { position: toast.POSITION.TOP_CENTER });
      } finally {
        setIsFetching((prev) => ({ ...prev, team: false }));
      }
    };

    fetchTeams();
  }, [formData?.milestone]);

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="xl">
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
          <h5 className="title">Assign Requirements</h5>
          <div className="mt-4">
            <Row className="m-2 p-2">
              <Col md="12">
                <div
                  className="mb-3"
                  style={{ height: `${selectedData.length > 9 ? "240px" : "auto"}`, overflow: "auto" }}
                >
                  <ol className="ms-2">
                    {selectedData.map((req, index) => (
                      <li key={`li-req-${index}`} style={{ fontSize: "16px" }}>
                        {index + 1}. {req.reqTitle}
                        <span className="fw-bold ms-2 me-2">{req.milestoneTitle}</span>
                        <span className="fw-bold">{req.teamTeamName}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Col>
              <Col md="12">
                <div className="form-group mt-4">
                  <label className="form-label">Milestone*</label>
                  <RSelect
                    {...register("milestone")}
                    options={milestones}
                    value={formData?.milestone}
                    onChange={(e) => {
                      setFormData({ ...formData, milestone: e });
                    }}
                  />
                  {errors.milestone && <span className="invalid text-danger">{errors.milestone.message}</span>}
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
                      {...register("teams")}
                      value={formData.teams}
                      // isMulti
                      onChange={(e) => {
                        setFormData({ ...formData, teams: e });
                      }}
                    />
                  )}
                  {errors.teams && <span className="invalid text-danger">{errors.teams.message}</span>}
                </div>
              </Col>
              <Col className="mt-5" size="12">
                <ul className=" text-end">
                  <li>
                    {isFetching?.submit ? (
                      <Button disabled color="primary">
                        <Spinner size="sm" />
                        <span> Moving... </span>
                      </Button>
                    ) : (
                      <Button color="primary" size="md" type="button" onClick={() => onSubmit()}>
                        Assign Requirements
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
