import React, { useEffect, useState } from "react";
import Content from "../../layout/content/Content";
import Head from "../../layout/head/Head";
import {
  Block,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  BlockDes,
  BackTo,
  BlockBetween,
} from "../../components/block/Block";
import MilestonesAccordion from "./MilestonesAccordion";
import { Button, Col, Icon, Row, RSelect } from "../../components/Component";
import useQueryMilestone from "../../hooks/UseQueryMilestone";
import FormModal from "./FormModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import authApi from "../../utils/ApiAuth";
import { addFirstAndDeleteLast, convertExcelTeamToRequest, convertToOptions, isNullOrEmpty } from "../../utils/Utils";
import useAuthStore from "../../store/Userstore";
import { Spinner } from "reactstrap";
import { useLocation } from "react-router-dom";

const MilestoneList = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const seId = queryParams.get("seId");
  const sId = queryParams.get("sId");
  const cId = queryParams.get("cId");
  const [modal, setModal] = useState({
    edit: false,
    add: false,
    import: false,
  });
  const { role } = useAuthStore((state) => state);
  const [editId, setEditedId] = useState();
  const [data, setData] = useState([]);
  const [totalElements, setTotalElements] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage] = useState(7);
  const [sortBy, setSortBy] = useState("displayOrder");
  const [orderBy, setOrderBy] = useState("asc");
  const [search, setSearch] = useState({});
  const [isFetching, setIsFetching] = useState({
    semester: true,
    subject: true,
    class: true,
    milestone: true,
    import: false,
  });
  const [filterForm, setFilterForm] = useState({
    semester: null,
    subject: null,
    class: null,
  });
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [classTeachers, setClassTeachers] = useState([]);
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        setIsFetching({ ...isFetching, semester: true });
        const response = await authApi.post("/setting/search", {
          pageSize: 9999,
          pageIndex: 1,
          type: "Semester",
          active: true,
          sortBy: "displayOrder",
          orderBy: "ASC",
        });
        console.log("semester:", response.data.data);
        if (response.data.statusCode === 200) {
          let semesters = convertToOptions(response.data.data.settingDTOS, "id", "name");
          setSemesters(semesters);
          if (response.data.data.totalElements > 0) {
            let selectedSemester = {
              value: semesters[0]?.value,
              label: semesters[0]?.label,
            };
            if (seId) {
              const foundSemester = semesters.find((item) => item.value == seId);
              if (foundSemester) {
                selectedSemester = foundSemester;
              }
            }
            setFilterForm({
              ...filterForm,
              semester: selectedSemester,
            });
          }
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Xảy ra lỗi khi tìm kiêm học kỳ", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching({ ...isFetching, semester: false });
      }
    };
    fetchSemesters();
  }, []);
  useEffect(() => {
    const fetchSubjects = async () => {
      if (isFetching.semester) return false;
      try {
        setIsFetching({ ...isFetching, subject: true });
        const response = await authApi.post("/subjects/search", {
          pageSize: 9999,
          pageIndex: 1,
          active: true,
        });
        console.log("subject:", response.data.data);
        if (response.data.statusCode === 200) {
          let subjects = convertToOptions(response.data.data.subjects, "id", "subjectCode");
          setSubjects(subjects);
          if (response.data.data.totalElements > 0) {
            let selectedSubject = {
              value: subjects[0]?.value,
              label: subjects[0]?.label,
            };
            if (sId) {
              const foundSubject = subjects.find((item) => item.value == sId);
              if (foundSubject) {
                selectedSubject = foundSubject;
              }
            }
            setFilterForm({
              ...filterForm,
              subject: selectedSubject,
            });
          }
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Xảy ra lỗi khi tìm kiếm môn học", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching({ ...isFetching, subject: false });
      }
    };
    fetchSubjects();
  }, [isFetching.semester]);
  useEffect(() => {
    const fetchClasses = async () => {
      if (isFetching.subject || isFetching.semester) return false;
      try {
        setIsFetching({ ...isFetching, class: true });
        const response = await authApi.post("/class/search", {
          pageSize: 9999,
          pageIndex: 1,
          active: true,
          subjectId: filterForm?.subject?.value,
          settingId: filterForm?.semester?.value,
          isCurrentClass: role === "STUDENT" || role === "TEACHER",
        });
        console.log("class:", response.data.data);
        if (response.data.statusCode === 200) {
          let classes = convertToOptions(response.data.data.classesDTOS, "id", "classCode");
          setClasses(classes);
          if (response.data.data.totalElements > 0) {
            let selectedClass = {
              value: classes[0]?.value,
              label: classes[0]?.label,
            };
            setClassTeachers(
              response.data.data.classesDTOS.map((item) => ({
                id: item.id,
                teacherId: item?.teacherId,
              }))
            );
            if (cId) {
              const foundClass = classes.find((item) => item.value == cId);
              if (foundClass) {
                selectedClass = foundClass;
              }
            }
            setFilterForm({
              ...filterForm,
              class: selectedClass,
            });
          } else
            setFilterForm({
              ...filterForm,
              class: null,
            });
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Xảy ra lỗi khi tìm kiếm lớp học", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching({ ...isFetching, class: false });
      }
    };
    fetchClasses();
  }, [filterForm.subject, filterForm.semester]);
  const [milestones, setMilestones] = useState([]);
  const { milestoneResponses, loading, error } = useQueryMilestone({
    currentPage,
    itemPerPage,
    setTotalElements,
    search: filterForm,
    sortBy,
    orderBy,
    setMilestones,
  });
  useEffect(() => {
    if (error) {
      toast.error(`${error}`, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }, [error]);

  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    startDate: new Date(),
    dueDate: new Date(),
    note: "",
    assignment: null,
    active: "Active",
    evalWeight: 1,
    oldMilestones: [],
  });
  const [editFormData, setEditFormData] = useState({
    startDate: new Date(),
    dueDate: new Date(),
    note: "",
    assignment: null,
    active: "Active",
    evalWeight: 1,
    oldMilestones: [],
  });

  // function to reset the form
  const resetForm = () => {
    setFormData({
      title: "",
      startDate: new Date(),
      dueDate: new Date(),
      note: "",
      assignment: null,
      active: "Active",
      evalWeight: 1,
      oldMilestones: [],
    });
    setFormErrors({});
  };

  const closeModal = () => {
    setModal({ add: false });
    resetForm();
  };

  const closeEditModal = () => {
    setModal({ edit: false });
    resetForm();
  };

  // submit function to add a new item
  const onFormSubmit = async (sData) => {
    const { title, startDate, dueDate, assignment, active, note, evalWeight, oldMilestones } = sData;
    const submittedData = {
      title: title,
      startDate: startDate,
      dueDate: dueDate,
      assignmentId: assignment?.value,
      active: active === "Active",
      note: note,
      classesId: filterForm?.class?.value,
      evalWeight: Number(evalWeight),
      milestones: oldMilestones,
    };
    console.log(submittedData);
    try {
      const response = await authApi.post("/milestone/create", submittedData);
      console.log("create milestone:", response.data.data);
      if (response.data.statusCode === 200) {
        toast.success("Create milestone successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        setTotalElements(totalElements + 1);
        setMilestones(addFirstAndDeleteLast(milestones, response.data.data, 9999));
        resetForm();
        setModal({ add: false });
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error creating milestone:", error);
      toast.error("Error creating milestone!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  // submit function to update a new item
  const onEditSubmit = async (sData) => {
    const { startDate, dueDate, assignment, active, note } = sData;
    try {
      const response = await authApi.put("/milestone/update/" + editId, {
        id: editId,
        startDate: startDate,
        dueDate: dueDate,
        assignmentId: assignment?.value,
        active: active === "Active",
        note: note,
        classesId: filterForm?.class?.value,
      });
      console.log("edit milestone: ", response.data);
      if (response.data.statusCode === 200) {
        toast.success("Update milestone successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        let submittedData;
        milestones.forEach((item) => {
          if (item.id === editId) {
            submittedData = {
              id: editId,
              startDate: startDate,
              dueDate: dueDate,
              assignmentId: assignment?.value,
              title: item?.title,
              active: active === "Active",
              note: note,
            };
          }
        });
        let index = milestones.findIndex((item) => item.id === editId);
        milestones[index] = submittedData;
        setModal({ edit: false });
        resetForm();
      } else {
        toast.error(`${response.data.data}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error("Error update milestone:", error);
      toast.error("Error update milestone!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    milestones.forEach((item) => {
      if (item.id === id) {
        // let startDate = item.startDate;
        // if (isNullOrEmpty(item.startDate)) startDate = new Date();
        setEditFormData({
          startDate: new Date(item.startDate ?? new Date()),
          dueDate: new Date(item.dueDate ?? new Date()),
          assignment: { value: item?.assignmentId, label: item?.assignmentTitle },
          active: item.active ? "Active" : "InActive",
          note: item.note,
        });
        setModal({ edit: true }, { add: false });
        setEditedId(id);
      }
    });
  };

  return (
    <>
      <Head title="Danh sách giai đoạn" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page> Danh sách giai đoạn</BlockTitle>
              <BlockDes className="text-soft">Bạn có tổng cộng {totalElements} giai đoạn</BlockDes>
            </BlockHeadContent>
            <BlockHeadContent></BlockHeadContent>
          </BlockBetween>
        </BlockHead>
        <Block>
          <Row>
            <Col size="2">
              <div className="form-group">
                <label className="form-label">Học kỳ</label>
                {isFetching?.semester ? (
                  <div>
                    <Spinner />
                  </div>
                ) : (
                  <RSelect
                    options={semesters}
                    value={filterForm.semester}
                    onChange={(e) => setFilterForm({ ...filterForm, semester: e })}
                  />
                )}
              </div>
            </Col>
            <Col size="2">
              <div className="form-group">
                <label className="form-label">Môn học</label>
                {isFetching?.subject ? (
                  <div>
                    <Spinner />
                  </div>
                ) : (
                  <RSelect
                    options={subjects}
                    value={filterForm.subject}
                    onChange={(e) =>
                      setFilterForm({
                        ...filterForm,
                        subject: e,
                      })
                    }
                  />
                )}
              </div>
            </Col>
            <Col size="2">
              <div className="form-group">
                <label className="form-label">Lớp học</label>
                {isFetching?.class ? (
                  <div>
                    <Spinner />
                  </div>
                ) : (
                  <RSelect
                    options={classes}
                    value={filterForm.class}
                    onChange={(e) => setFilterForm({ ...filterForm, class: e })}
                  />
                )}
              </div>
            </Col>
          </Row>
        </Block>
        <Block size="lg">
          <BlockHead>
            <BlockHeadContent></BlockHeadContent>
          </BlockHead>
          {loading ? (
            <div className="d-flex justify-content-center">
              <Spinner style={{ width: "3rem", height: "3rem" }} />
            </div>
          ) : (
            <MilestonesAccordion
              milestones={milestones}
              setMilestones={setMilestones}
              teacherId={classTeachers.find((item) => item?.id === filterForm?.class?.value)?.teacherId}
              onEditClick={onEditClick}
            />
          )}
        </Block>
        <FormModal
          modal={modal.add}
          modalType="add"
          formData={formData}
          setFormData={setFormData}
          closeModal={closeModal}
          onSubmit={onFormSubmit}
          assignments={assignments}
          classId={filterForm?.class?.value}
        />
        <FormModal
          modal={modal.edit}
          modalType="edit"
          formData={editFormData}
          setFormData={setEditFormData}
          closeModal={closeEditModal}
          onSubmit={onEditSubmit}
          assignments={assignments}
          classId={filterForm?.class?.value}
        />
        <ToastContainer />
      </Content>
    </>
  );
};

export default MilestoneList;
