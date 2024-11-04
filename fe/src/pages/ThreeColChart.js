import React from "react";
import { Bar } from "react-chartjs-2";
import { Card, CardBody, CardTitle, CardHeader } from "reactstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register components required by Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const data = {
  labels: ["iter1", "iter2", "iter3"],
  datasets: [
    {
      label: "Simple",
      data: [2, 3, 1.5],
      backgroundColor: "#6576ff",
    },
    {
      label: "Medium",
      data: [1, 1.5, 1],
      backgroundColor: "#1ee0ac",
    },
    {
      label: "Complex",
      data: [0.5, 2, 1],
      backgroundColor: "#ff63a5",
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
      labels: {
        font: {
          weight: "bold",
        },
      },
    },
    tooltip: {
      backgroundColor: "#fff",
      borderColor: "#ccc",
      borderWidth: 1,
      titleColor: "#000",
      bodyColor: "#000",
      borderRadius: 10,
    },
  },
  scales: {
    x: {
      ticks: {
        font: {
          weight: "bold",
        },
      },
    },
    y: {
      ticks: {
        font: {
          weight: "bold",
        },
      },
    },
  },
};

const ThreeColChart = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-white text-center">
        <CardTitle tag="h5" className="mb-0">
          Project Iteration Complexity
        </CardTitle>
      </CardHeader>
      <CardBody className="bg-light">
        <div style={{ height: "300px" }}>
          <Bar data={data} options={options} />
        </div>
      </CardBody>
    </Card>
  );
};

export default ThreeColChart;
