import React, { useEffect, useState } from "react";
import Head from "../../layout/head/Head";
import Content from "../../layout/content/Content";
import {
  Block,
  BlockHead,
  BlockBetween,
  BlockHeadContent,
  BlockTitle,
  BlockDes,
  Icon,
  Button,
  Row,
  ProjectCard,
  UserAvatar,
  Col,
  PaginationComponent,
  RSelect,
} from "../../components/Component";
import { toast, ToastContainer } from "react-toastify";
import authApi from "../../utils/ApiAuth";
import { convertToOptions } from "../../utils/Utils";
import useAuthStore from "../../store/Userstore";
import { Spinner } from "reactstrap";
import { useLocation } from "react-router-dom";

const MyClassPage = () => {
  const { role } = useAuthStore((state) => state);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState({
    semester: true,
    subject: true,
    class: true,
    import: false,
  });
  const [filterForm, setFilterForm] = useState({
    semester: null,
    subject: null,
    class: null,
  });

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
        toast.error("Lỗi tìm kiếm học kỳ!", {
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
          setSubjects(convertToOptions(response.data.data.subjects, "id", "subjectCode"));
          if (response.data.data.totalElements > 0)
            setFilterForm({
              ...filterForm,
              subject: {
                value: response.data.data.subjects[0]?.id,
                label: response.data.data.subjects[0]?.subjectCode,
              },
            });
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Lỗi tìm kiếm môn học!", {
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
      if(!filterForm?.semester?.value || !filterForm?.subject?.value){
        console.log('aa');
        setData([]);
        setIsFetching({ ...isFetching, class: false });
        return;
      }
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
          setData(response.data.data.classesDTOS);
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Lỗi tìm kiếm lớp học!", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching({ ...isFetching, class: false });
      }
    };
    fetchClasses();
  }, [filterForm.subject, filterForm.semester, isFetching?.subject]);

  return (
    <>
      <ToastContainer />
      <Head title="Lớp học của tôi"></Head>
      <Content>
        <BlockHead size="lg">
          <Row className="mt-5">
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
          </Row>
        </BlockHead>
        <Block>
          {!isFetching?.class ? (
            <Row className="g-gs">
              {data && data.length > 0 ? (
                data.map((item, idx) => {
                  return (
                    <Col sm="6" lg="4" xxl="3" key={item.id}>
                      <ProjectCard>
                        <div className="project-head">
                          <a
                            href="#title"
                            onClick={(ev) => {
                              ev.preventDefault();
                            }}
                            className="project-title"
                          >
                            <div className="project-info">
                              <h6 className="title">{item.classCode}</h6>
                            </div>
                          </a>
                          <div className="text-end">
                            <a href={`/my-classes/get-by-id/${item.id}`} className="text-primary">
                              Chi tiết
                            </a>
                          </div>
                        </div>
                        <div className="project-progress">
                          <div className="project-progress-details">
                            <div className="project-progress-task">
                              <Icon name="calendar"></Icon>
                              <span>{item.semesterName}</span>
                            </div>
                            <div className="project-progress-percent"></div>
                          </div>
                        </div>
                        <div className="project-progress">
                          <div className="project-progress-details">
                            <div className="project-progress-task">
                              <Icon name="user"></Icon>
                              <span>{item.teacherName}</span>
                            </div>
                            <div className="project-progress-percent"></div>
                          </div>
                        </div>
                        <div className="project-meta">
                          <a
                            href={`/milestone-list?seId=${filterForm?.semester?.value}&sId=${filterForm?.subject?.value}&cId=${item.id}`}
                          >
                            Đi tới giai đoạn lớp học <Icon name="arrow-long-right"></Icon>
                          </a>
                        </div>
                      </ProjectCard>
                    </Col>
                  );
                })
              ) : (
                <div className="d-flex justify-content-center ">
                  <Icon style={{ fontSize: "30px" }} name="inbox">
                    Không tìm thấy dữ liệu!
                  </Icon>
                </div>
              )}
            </Row>
          ) : (
            <div className="d-flex justify-content-center">
              <Spinner style={{ width: "3rem", height: "3rem" }} />
            </div>
          )}
        </Block>
      </Content>
    </>
  );
};
export default MyClassPage;
