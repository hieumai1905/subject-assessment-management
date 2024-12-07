import React, { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Col, Row, Spinner } from "reactstrap";
import Content from "../layout/content/Content";
import {
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
  RSelect,
} from "../components/Component";
import authApi from "../utils/ApiAuth";
import { convertToOptions, isNullOrEmpty } from "../utils/Utils";
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Filler, Legend } from "chart.js";
import { toast, ToastContainer } from "react-toastify";

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Filler, Legend);

const styles = {
  dashboard: {
    padding: "20px",
  },
  filterRow: {
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectContainer: {
    width: "45%",
  },
  chartRow: {
    marginBottom: "40px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
  },
  chartContainer: {
    flex: "1",
    minHeight: "350px",
    padding: "20px", // Increase padding for better spacing
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  tableRow: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px", // Add gap between the columns
    marginBottom: "20px",
  },
  tableContainer: {
    flex: "1",
    minHeight: "350px",
    padding: "20px", // Increase padding for better spacing
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
};

const OngoingGradeChart = ({ data }) => {
  const sortedData = [...data].sort((a, b) => {
    const aValue = parseInt(a.grade.split("_")[1]);
    const bValue = parseInt(b.grade.split("_")[1]);
    return bValue - aValue;
  });

  const labels = sortedData.map((item) => parseInt(item.grade.split("_")[1]));
  const numbers = sortedData.map((item) => item.numberOfGrades);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Số sinh viên",
        data: numbers,
        backgroundColor: "#ff63a5",
        borderColor: "#ff63a5",
        borderWidth: 1,
        barThickness: "flex",
      },
    ],
  };

  const options = {
    indexAxis: "y",
    scales: {
      x: {
        beginAtZero: true,
        max: Math.max(...numbers) * 1.2,
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Điểm quá trình", // Tiêu đề cho biểu đồ
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

const AvgRequirementsChart = ({ data }) => {
  const labels = data.map((item) => item.iteration);

  const colors = ["#1676fb", "#1ee0ac", "#ff63a5"]; // Màu sắc cố định cho các biểu đồ

  const allComplexities = Array.from(new Set(data.flatMap((item) => Object.keys(item.complexityAverages))));

  const datasets = allComplexities.map((complexity, index) => ({
    label: complexity,
    data: data.map((item) => item.complexityAverages[complexity] || 0),
    backgroundColor: colors[index % colors.length], // Sử dụng màu sắc cố định
    borderColor: colors[index % colors.length], // Đường viền có cùng màu với nền
    barThickness: "flex",
  }));

  const chartData = {
    labels: labels,
    datasets: datasets,
  };

  const options = {
    scales: {
      x: {
        stacked: false,
        max: 5,
      },
      y: {
        stacked: false,
        beginAtZero: true,
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Trung bình yêu cầu/sinh viên", // Tiêu đề cho biểu đồ
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};


const OngoingPassFailDoughnut = ({ data }) => {
  const chartData = {
    labels: ["Đánh giá quá trình - Đạt", "Đánh giá quá trình - Không đạt"],
    datasets: [
      {
        data: [data.passed, data.failed],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  return (
    <Doughnut
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false, // Allows the chart to be responsive
        cutout: "60%", // Adjust the inner cutout
        plugins: {
          legend: {
            display: true,
            position: "bottom",
          },
          tooltip: {
            enabled: true,
            displayColors: false,
            backgroundColor: "#eff6ff",
            titleFont: {
              size: "13px",
            },
            titleColor: "#6783b8",
            titleMarginBottom: 6,
            bodyColor: "#9eaecf",
            bodyFont: {
              size: "12px",
            },
            bodySpacing: 4,
            padding: 10,
            footerMarginTop: 0,
          },
          title: {
            display: true,
            text: "Đánh giá quá trình Đạt/Không đạt", // Chart title
          },
        },
      }}
      style={{ width: "80%", height: "80%" }} // Reduce the chart size to 80% of its container
    />
  );
};


const AvgGradesByMilestonesChart = ({ data }) => {
  const labels = data.map((item) => item.grade);
  const avgGrades = data.map((item) => isNullOrEmpty(item.avgGrade) ? 0 : item.avgGrade.toFixed(2));

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Điểm trung bình",
        data: avgGrades,
        backgroundColor: "#6576ff", // Màu xanh đậm
        borderColor: "#6576ff", // Đường viền màu xanh đậm
        borderWidth: 1,
        barThickness: "flex",
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(...avgGrades) * 1.2,
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Điểm trung bình từng giai đoạn",
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

const TopLOCGradeTable = ({ data }) => {
  const formatEmail = (email) => {
    return email.split("@")[0];
  };

  return (
    <DataTableBody className="border-top">
      <DataTableHead>
        <DataTableRow>
          <span>Sinh viên</span>
        </DataTableRow>
        <DataTableRow>
          <span>Lớp học</span>
        </DataTableRow>
        <DataTableRow>
          <span>Cột mốc</span>
        </DataTableRow>
        <DataTableRow>
          <span>Số yêu cầu</span>
        </DataTableRow>
        <DataTableRow>
          <span>LOC</span>
        </DataTableRow>
      </DataTableHead>
      {data.map((item, index) => (
        <DataTableItem key={index}>
          <DataTableRow>
            <span className="tb-lead">{formatEmail(item.email)}</span>
          </DataTableRow>
          <DataTableRow>
            <span className="tb-lead">{item.classCode}</span>
          </DataTableRow>
          <DataTableRow>
            <span className="tb-sub">{item.iter}</span>
          </DataTableRow>
          <DataTableRow>
            <span className="tb-sub">{item.numberOfReqs}</span>
          </DataTableRow>
          <DataTableRow>
            <span className="tb-sub">{item.totalLOC}</span>
          </DataTableRow>
        </DataTableItem>
      ))}
    </DataTableBody>
  );
};

const TopClassGradeTable = ({ data }) => {
  const formatEmail = (email) => {
    return email.split("@")[0];
  };

  return (
    <DataTableBody className="border-top">
      <DataTableHead>
        <DataTableRow>
          <span>Lớp học</span>
        </DataTableRow>
        <DataTableRow>
          <span>Giảng viên</span>
        </DataTableRow>
        <DataTableRow>
          <span>Điểm đánh giá</span>
        </DataTableRow>
      </DataTableHead>
      {data.map((item, index) => (
        <DataTableItem key={index}>
          <DataTableRow>
            <span className="tb-lead">{item.classCode}</span>
          </DataTableRow>
          <DataTableRow>
            <span className="tb-lead">{formatEmail(item.email)}</span>
          </DataTableRow>
          <DataTableRow>
            <span className="tb-sub">{isNullOrEmpty(item.grade) ? 0 : item.grade.toFixed(2)}</span>
          </DataTableRow>
        </DataTableItem>
      ))}
    </DataTableBody>
  );
};

const Dashboard = () => {
  const [data, setData] = useState({});
  const [filterForm, setFilterForm] = useState({
    semester: null,
    subject: null,
  });
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isFetching, setIsFetching] = useState({
    semester: true,
    subject: true,
    data: true,
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
        toast.error("Xảy ra lỗi khi tìm kiếm học kỳ", {
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
    const fetchData = async () => {
      if (!filterForm?.semester || !filterForm?.subject) {
        setData({});
        setIsFetching({ ...isFetching, data: false });
        return false;
      }

      try {
        setIsFetching({ ...isFetching, data: true });
        const response = await authApi.get(
          `/dashboard?semesterId=${filterForm?.semester?.value}&subjectId=${filterForm?.subject?.value}`
        );
        if (response.data.statusCode === 200) {
          setData(response.data.data);
        } else {
          toast.error(`${response.data.data}`, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Xảy ra lỗi khi thống kê", {
          position: toast.POSITION.TOP_CENTER,
        });
      } finally {
        setIsFetching({ ...isFetching, data: false });
      }
    };
    fetchData();
  }, [filterForm.subject, filterForm.semester]);

  return (
    <Content>
      <div style={styles.dashboard}>
        <BlockHeadContent className="mb-3">
          <BlockTitle page>Hệ thống đánh giá</BlockTitle>
          {/* <BlockDes className="text-soft">
            <p>Welcome to SES</p>
          </BlockDes> */}
        </BlockHeadContent>

        <BlockHead size="lg">
          <Row style={styles.filterRow}>
            <Col md="6" style={styles.selectContainer}>
              <label className="form-label">Học kỳ</label>
              {isFetching?.semester ? (
                <Spinner />
              ) : (
                <RSelect
                  options={semesters}
                  value={filterForm.semester}
                  onChange={(e) => setFilterForm({ ...filterForm, semester: e })}
                />
              )}
            </Col>
            <Col md="6" style={styles.selectContainer}>
              <label className="form-label">Môn học</label>
              {isFetching?.subject ? (
                <Spinner />
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
            </Col>
          </Row>
        </BlockHead>

        <Row className="g-4" style={styles.chartRow}>
          <Col md="6" style={styles.chartContainer}>
            <OngoingGradeChart data={data.gradeDistributionList || []} />
          </Col>
          <Col md="6" style={styles.chartContainer}>
            <OngoingPassFailDoughnut
              data={{
                passed:
                  data.ongoingPassFailList
                    ?.filter((item) => item.isPassed)
                    .reduce((acc, cur) => acc + cur.numberOfStudent, 0) || 0,
                failed:
                  data.ongoingPassFailList
                    ?.filter((item) => !item.isPassed)
                    .reduce((acc, cur) => acc + cur.numberOfStudent, 0) || 0,
              }}
            />
          </Col>
        </Row>

        <Row className="g-4" style={styles.chartRow}>
          <Col md="6" style={styles.chartContainer}>
            <AvgRequirementsChart data={data.avgRequirementsList || []} />
          </Col>
          <Col md="6" style={styles.chartContainer}>
            <AvgGradesByMilestonesChart data={data.avgGradeList || []} />
          </Col>
        </Row>

        <Row className="g-4" style={styles.tableRow}>
          <Col md="6" style={styles.tableContainer}>
            <h6>Top Student's LOC</h6>
            <TopLOCGradeTable data={data.topLOCGradeList || []} />
          </Col>
          <Col md="6" style={styles.tableContainer}>
            <h6>Top Class Grades</h6>
            <TopClassGradeTable data={data.classAvgGradeList || []} />
          </Col>
        </Row>
        <ToastContainer />
      </div>
    </Content>
  );
};

export default Dashboard;
