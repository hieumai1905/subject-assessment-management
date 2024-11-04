import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Card, CardBody, CardTitle, CardText } from "reactstrap";
import authApi from "../../../../utils/ApiAuth";

const SalesOverview = () => {
  const [data, setData] = useState({
    labels: [], // Tên lớp sẽ hiển thị trên trục ngang
    datasets: [
      {
        label: "Number of Students in Each Class",
        data: [], // Số lượng học sinh tương ứng
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 2,
        fill: true,
      },
      {
        label: "Total Number of Students",
        data: [], // Tổng số lượng học sinh
        backgroundColor: "rgba(153,102,255,0.4)",
        borderColor: "rgba(153,102,255,1)",
        borderWidth: 2,
        borderDash: [10, 5], // Tạo đường gạch để phân biệt
        fill: false,
      },
    ],
  });

  useEffect(() => {
    authApi
      .get("/dashboard/admin")
      .then((response) => {
        const studentClasses = response.data.data.studentClasses;

        // Extract class names and student counts
        const labels = studentClasses.map((cls) => `${cls.className}`);
        const studentCounts = studentClasses.map((cls) => cls.totalStudent);
        const totalStudents = studentCounts.reduce((total, num) => total + num, 0);

        // Update chart data
        setData({
          labels: labels, // Tên lớp
          datasets: [
            {
              label: "Number of Students in Each Class",
              data: studentCounts,
              backgroundColor: "rgba(75,192,192,0.4)",
              borderColor: "rgba(75,192,192,1)",
              borderWidth: 2,
              fill: true,
            },
            {
              label: "Total Number of Students",
              data: Array(studentCounts.length).fill(totalStudents), // Tổng số lượng học sinh hiển thị
              backgroundColor: "rgba(153,102,255,0.4)",
              borderColor: "rgba(153,102,255,1)",
              borderWidth: 2,
              borderDash: [10, 5], // Đường gạch ngang
              fill: false,
            },
          ],
        });
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <CardTitle tag="h5">Class Students Overview</CardTitle>
          <CardText>Statistics on the number of students in each class.</CardText>
          <div className="chart-container" style={{ height: "300px" }}>
            <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default SalesOverview;
